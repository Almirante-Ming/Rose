import { useState, useEffect } from 'react';
import {View,Text,FlatList,ActivityIndicator,Alert,TouchableOpacity,RefreshControl,Modal,TextInput} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/contexts';
import { personsService } from '@/services';
import { rose_theme } from '@constants/rose_theme';
import { PersonResponse } from '@constants/types';
import PersonEditModal from '@/components/PersonEditModal';
import { personListStyles as styles } from '@/styles/person_list_styles';

export default function Person() {
  const [persons, setPersons] = useState<PersonResponse[]>([]);
  const [filteredPersons, setFilteredPersons] = useState<PersonResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'trainer' | 'customer'>('all');
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'created_at'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [editingPerson, setEditingPerson] = useState<PersonResponse | null>(null);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const applyFiltersAndSort = (data: PersonResponse[], nameFilter: string, roleFilterValue: 'all' | 'admin' | 'trainer' | 'customer', sortField: 'id' | 'name' | 'created_at', order: 'asc' | 'desc') => {
    let filtered = data;

    if (nameFilter.trim()) {
      filtered = filtered.filter(person => 
        person.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    if (roleFilterValue !== 'all') {
      filtered = filtered.filter(person => person.p_type === roleFilterValue);
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
        case 'created_at':
          aValue = a.dt_create || '';
          bValue = b.dt_create || '';
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

    setFilteredPersons(sorted);
  };

  const handleSearch = (text: string) => {
    setSearchName(text);
    applyFiltersAndSort(persons, text, roleFilter, sortBy, sortOrder);
  };

  const handleRoleFilter = (role: 'all' | 'admin' | 'trainer' | 'customer') => {
    setRoleFilter(role);
    applyFiltersAndSort(persons, searchName, role, sortBy, sortOrder);
  };

  const handleSort = (field: 'id' | 'name' | 'created_at') => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(newOrder);
    applyFiltersAndSort(persons, searchName, roleFilter, field, newOrder);
  };

  const clearFilters = () => {
    setSearchName('');
    setRoleFilter('all');
    setSortBy('id');
    setSortOrder('asc');
    applyFiltersAndSort(persons, '', 'all', 'id', 'asc');
  };

  const fetchPersons = async () => {
    try {
      setIsLoading(true);
      const data = await personsService.getPersons();
      setPersons(data);
      applyFiltersAndSort(data, searchName, roleFilter, sortBy, sortOrder);
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Erro ao carregar lista de pessoas. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPersons();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchPersons();
  }, []);

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    // Fix: Parse date as local date to avoid timezone shifts
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('pt-BR');
  };

  const formatCPF = (cpf: string): string => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string): string => {
    if (!phone) return '';
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const getPersonTypeLabel = (type: string): string => {
    switch (type) {
      case 'admin':
        return 'Administrador';
      case 'trainer':
        return 'Instrutor';
      case 'customer':
        return 'Cliente';
      default:
        return type;
    }
  };

  const getPersonTypeColor = (type: string): string => {
    switch (type) {
      case 'admin':
        return '#e74c3c';
      case 'trainer':
        return '#f39c12';
      case 'customer':
        return '#27ae60';
      default:
        return '#7f8c8d';
    }
  };

  const getStateColor = (state: string): string => {
    return state === 'active' ? '#27ae60' : '#e74c3c';
  };

  const handleOpenEditModal = (person: PersonResponse) => {
    setEditingPerson(person);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingPerson(null);
  };

  const handleEditSuccess = () => {
    fetchPersons();
  };

  const renderPersonCard = ({ item }: { item: PersonResponse }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => handleOpenEditModal(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.personName}>{item.name}</Text>
          <View style={styles.badgeContainer}>
            <View style={[styles.typeBadge, { backgroundColor: getPersonTypeColor(item.p_type) }]}>
              <Text style={styles.badgeText}>{getPersonTypeLabel(item.p_type)}</Text>
            </View>
            <View style={[styles.stateBadge, { backgroundColor: getStateColor(item.state) }]}>
              <Text style={styles.badgeText}>
                {item.state === 'active' ? 'Ativo' : 'Inativo'}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.personId}>#{item.id}</Text>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Ionicons name="person" size={16} color={rose_theme.rose_main} />
          <Text style={styles.infoLabel}>CPF:</Text>
          <Text style={styles.infoValue}>{formatCPF(item.cpf)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="mail" size={16} color={rose_theme.rose_main} />
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue} numberOfLines={1}>{item.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="call" size={16} color={rose_theme.rose_main} />
          <Text style={styles.infoLabel}>Telefone:</Text>
          <Text style={styles.infoValue}>{formatPhone(item.phone)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={16} color={rose_theme.rose_main} />
          <Text style={styles.infoLabel}>Nascimento:</Text>
          <Text style={styles.infoValue}>{formatDate(item.dt_birth)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time" size={16} color={rose_theme.rose_main} />
          <Text style={styles.infoLabel}>Criado em:</Text>
          <Text style={styles.infoValue}>{formatDate(item.dt_create)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={rose_theme.white} />
          <Text style={styles.loadingText}>Carregando pessoas...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Ionicons name="people" size={32} color={rose_theme.white} />
        <Text style={styles.title}>Lista de Pessoas</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setShowFilterModal(true)}>
            <Ionicons name="search" size={24} color={rose_theme.white} />
            {(searchName || roleFilter !== 'all') && (
              <View style={styles.filterIndicator}>
                <View style={styles.filterDot} />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Ionicons name="refresh" size={24} color={rose_theme.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{filteredPersons.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {filteredPersons.filter(p => p.p_type === 'admin').length}
          </Text>
          <Text style={styles.statLabel}>Admins</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {filteredPersons.filter(p => p.p_type === 'trainer').length}
          </Text>
          <Text style={styles.statLabel}>Instrutores</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {filteredPersons.filter(p => p.p_type === 'customer').length}
          </Text>
          <Text style={styles.statLabel}>Clientes</Text>
        </View>
      </View>

      <FlatList
        data={filteredPersons}
        renderItem={renderPersonCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[rose_theme.rose_main]}
            tintColor={rose_theme.white}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={rose_theme.disabled_text} />
            <Text style={styles.emptyText}>Nenhuma pessoa encontrada</Text>
          </View>
        }
      />
      
      <TouchableOpacity style={styles.floatingButton} onPress={() => router.push('/personAdd')}>
        <Ionicons name="add" size={28} color={rose_theme.white} />
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
                  placeholder="Digite o nome..."
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

            {/* Role filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Filtrar por função:</Text>
              <View style={styles.roleOptions}>
                <TouchableOpacity
                  style={[styles.roleButton, roleFilter === 'all' && styles.roleButtonActive]}
                  onPress={() => handleRoleFilter('all')}
                >
                  <Text style={[styles.roleButtonText, roleFilter === 'all' && styles.roleButtonTextActive]}>
                    Todos
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleButton, roleFilter === 'admin' && styles.roleButtonActive]}
                  onPress={() => handleRoleFilter('admin')}
                >
                  <Text style={[styles.roleButtonText, roleFilter === 'admin' && styles.roleButtonTextActive]}>
                    Administradores
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleButton, roleFilter === 'trainer' && styles.roleButtonActive]}
                  onPress={() => handleRoleFilter('trainer')}
                >
                  <Text style={[styles.roleButtonText, roleFilter === 'trainer' && styles.roleButtonTextActive]}>
                    Instrutores
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleButton, roleFilter === 'customer' && styles.roleButtonActive]}
                  onPress={() => handleRoleFilter('customer')}
                >
                  <Text style={[styles.roleButtonText, roleFilter === 'customer' && styles.roleButtonTextActive]}>
                    Clientes
                  </Text>
                </TouchableOpacity>
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

                <TouchableOpacity
                  style={[styles.sortButton, sortBy === 'created_at' && styles.sortButtonActive]}
                  onPress={() => handleSort('created_at')}
                >
                  <Text style={[styles.sortButtonText, sortBy === 'created_at' && styles.sortButtonTextActive]}>
                    Criado em {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
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

      {/* Edit Person Modal Component */}
      <PersonEditModal
        visible={showEditModal}
        editingPerson={editingPerson}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
      />
    </View>
  );
}