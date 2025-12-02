import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { machinesService } from '@/services';
import { rose_theme } from '@constants/rose_theme';
import { MachineResponse, Machine_Status } from '@constants/types';
import { machineListStyles as styles } from '@/styles/machine_list_styles';

export default function MachineList() {
  const [machines, setMachines] = useState<MachineResponse[]>([]);
  const [filteredMachines, setFilteredMachines] = useState<MachineResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMachine, setEditingMachine] = useState<MachineResponse | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', description: '', state: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'name'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const insets = useSafeAreaInsets();

  const applyFiltersAndSort = (data: MachineResponse[], nameFilter: string, sortField: 'id' | 'name', order: 'asc' | 'desc') => {
    let filtered = data;

    if (nameFilter.trim()) {
      filtered = data.filter(machine => 
        machine.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredMachines(sorted);
  };

  const handleSearch = (text: string) => {
    setSearchName(text);
    applyFiltersAndSort(machines, text, sortBy, sortOrder);
  };

  const handleSort = (field: 'id' | 'name') => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(newOrder);
    applyFiltersAndSort(machines, searchName, field, newOrder);
  };

  const clearFilters = () => {
    setSearchName('');
    setSortBy('id');
    setSortOrder('asc');
    applyFiltersAndSort(machines, '', 'id', 'asc');
  };

  const handleOpenEditModal = (machine: MachineResponse) => {
    setEditingMachine(machine);
    setEditFormData({
      name: machine.name,
      description: machine.description || '',
      state: (machine.m_state || Machine_Status.ACTIVE) as string,
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingMachine(null);
    setEditFormData({ name: '', description: '', state: '' });
  };

  const handleUpdateMachine = async () => {
    if (!editingMachine || !editFormData.name.trim()) {
      Alert.alert('Erro', 'Nome da atividade é obrigatório');
      return;
    }

    setIsSubmitting(true);
    try {
      await machinesService.updateMachine(editingMachine.id, {
        name: editFormData.name.trim(),
        description: editFormData.description.trim(),
        state: editFormData.state as string,
      });

      Alert.alert('Sucesso', 'Atividade atualizada com sucesso!', [
        {
          text: 'OK',
          onPress: () => {
            handleCloseEditModal();
            fetchMachines();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Erro ao atualizar atividade. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMachine = async () => {
    if (!editingMachine) return;

    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja deletar a atividade "${editingMachine.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              await machinesService.deleteMachine(editingMachine.id);
              Alert.alert('Sucesso', 'Atividade deletada com sucesso!', [
                {
                  text: 'OK',
                  onPress: () => {
                    handleCloseEditModal();
                    fetchMachines();
                  },
                },
              ]);
            } catch (error: any) {
              Alert.alert(
                'Erro',
                error.response?.data?.message || 'Erro ao deletar atividade. Tente novamente.'
              );
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const fetchMachines = async () => {
    try {
      setIsLoading(true);
      const data = await machinesService.getMachines();
      setMachines(data);
      applyFiltersAndSort(data, searchName, sortBy, sortOrder);
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Erro ao carregar lista de atividades. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMachines();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const getStateLabel = (state: string): string => {
    switch (state) {
      case Machine_Status.ACTIVE:
        return 'Disponível';
      case Machine_Status.MAINTENANCE:
        return 'Em Manutenção';
      case Machine_Status.INACTIVE:
        return 'Indisponível';
      default:
        return state;
    }
  };

  const getStateColor = (state: string): string => {
    switch (state) {
      case Machine_Status.ACTIVE:
        return '#27ae60';
      case Machine_Status.MAINTENANCE:
        return '#f39c12';
      case Machine_Status.INACTIVE:
        return '#e74c3c';
      default:
        return '#7f8c8d';
    }
  };

  const renderMachineCard = ({ item }: { item: MachineResponse }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => handleOpenEditModal(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.mainInfo}>
          <Text style={styles.machineName}>{item.name}</Text>
        </View>
        
        <View style={styles.rightSection}>
          <View style={[styles.stateBadge, { backgroundColor: getStateColor(item.m_state || item.state || 'active') }]}>
            <Text style={styles.badgeText}>{getStateLabel(item.m_state || item.state || 'active')}</Text>
          </View>
        </View>
      </View>
      
      {item.description && (
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Carregando atividades...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Ionicons name="list" size={32} color="#FFFFFF" />
        <Text style={styles.title}>Lista de Atividades</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setShowFilterModal(true)}>
            <Ionicons name="search" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Ionicons name="refresh" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredMachines}
        renderItem={renderMachineCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[rose_theme.rose_main]}
            tintColor="#FFFFFF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="construct-outline" size={64} color="#CCCCCC" />
            <Text style={styles.emptyText}>Nenhuma atividade encontrada</Text>
          </View>
        }
      />
      
      <TouchableOpacity style={styles.floatingButton} onPress={() => router.push('/machine_add')}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros e Ordenação</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowFilterModal(false)}
              >
                <Ionicons name="close" size={24} color={rose_theme.text_light} />
              </TouchableOpacity>
            </View>

            {/* Search by name */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Buscar por nome:</Text>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Digite o nome da atividade..."
                  value={searchName}
                  onChangeText={handleSearch}
                  placeholderTextColor="#999"
                />
                {searchName.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearSearchButton}
                    onPress={() => handleSearch('')}
                  >
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Sort options */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Ordenar por:</Text>
              <View style={styles.sortOptions}>
                <TouchableOpacity
                  style={[styles.sortButton, sortBy === 'id' && styles.sortButtonActive]}
                  onPress={() => handleSort('id')}
                >
                  <Text style={[styles.sortButtonText, sortBy === 'id' && styles.sortButtonTextActive]}>
                    ID {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sortButton, sortBy === 'name' && styles.sortButtonActive]}
                  onPress={() => handleSort('name')}
                >
                  <Text style={[styles.sortButtonText, sortBy === 'name' && styles.sortButtonTextActive]}>
                    Nome {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Filter actions */}
            <View style={styles.filterActions}>
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Text style={styles.clearButtonText}>Limpar Filtros</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.applyButtonText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Machine Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Atividade</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseEditModal}
              >
                <Ionicons name="close" size={24} color={rose_theme.text_light} />
              </TouchableOpacity>
            </View>

            {editingMachine && (
              <ScrollView style={styles.editFormContainer} showsVerticalScrollIndicator={false}>
                {/* Machine Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nome da Atividade *</Text>
                  <TextInput
                    style={styles.input}
                    value={editFormData.name}
                    onChangeText={(text) => setEditFormData({ ...editFormData, name: text })}
                    placeholder="Digite o nome"
                    placeholderTextColor="#999"
                  />
                </View>

                {/* Machine Description */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Descrição</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={editFormData.description}
                    onChangeText={(text) => setEditFormData({ ...editFormData, description: text })}
                    placeholder="Digite a descrição"
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                  />
                </View>

                {/* Machine State */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Status</Text>
                  <View style={styles.stateButtonsContainer}>
                    {[Machine_Status.ACTIVE, Machine_Status.MAINTENANCE, Machine_Status.INACTIVE].map((state) => {
                      const isSelected = editFormData.state.toString().trim() === state.toString().trim();
                      return (
                        <TouchableOpacity
                          key={state}
                          style={[
                            styles.stateButton,
                            isSelected && styles.stateButtonActive,
                          ]}
                          onPress={() => setEditFormData({ ...editFormData, state })}
                        >
                          <Text
                            style={[
                              styles.stateButtonText,
                              isSelected && styles.stateButtonTextActive,
                            ]}
                          >
                            {getStateLabel(state)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.editActionButtons}>
                  <TouchableOpacity
                    style={[styles.deleteButton, isSubmitting && styles.buttonDisabled]}
                    onPress={handleDeleteMachine}
                    disabled={isSubmitting}
                  >
                    <Ionicons name="trash" size={20} color="#FFFFFF" />
                    <Text style={styles.deleteButtonText}>Apagar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveButton, isSubmitting && styles.buttonDisabled]}
                    onPress={handleUpdateMachine}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                        <Text style={styles.saveButtonText}>Salvar</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}