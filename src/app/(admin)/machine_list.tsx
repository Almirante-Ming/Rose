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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { machinesService } from '@/services';
import { rose_theme } from '@constants/rose_theme';
import { MachineResponse } from '@constants/types';

export default function MachineList() {
  const [machines, setMachines] = useState<MachineResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMachines = async () => {
    try {
      setIsLoading(true);
      const data = await machinesService.getMachines();
      setMachines(data);
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Erro ao carregar lista de máquinas. Tente novamente.'
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
      case 'active':
        return 'Disponível';
      case 'maintenance':
        return 'Em Análise';
      case 'inactive':
        return 'Indisponível';
      case 'deactive':
        return 'Desativado';
      default:
        return state;
    }
  };

  const getStateColor = (state: string): string => {
    switch (state) {
      case 'active':
        return '#27ae60';
      case 'maintenance':
        return '#f39c12';
      case 'inactive':
        return '#e74c3c';
      case 'deactive':
        return '#7f8c8d';
      default:
        return '#7f8c8d';
    }
  };

  const getStateIcon = (state: string): string => {
    switch (state) {
      case 'active':
        return 'checkmark-circle';
      case 'maintenance':
        return 'construct';
      case 'inactive':
        return 'close-circle';
      case 'deactive':
        return 'ban';
      default:
        return 'help-circle';
    }
  };

  const renderMachineCard = ({ item }: { item: MachineResponse }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.machineName}>{item.name}</Text>
          <View style={styles.badgeContainer}>
            <View style={[styles.stateBadge, { backgroundColor: getStateColor(item.state) }]}>
              <Ionicons 
                name={getStateIcon(item.state) as any} 
                size={12} 
                color="#FFFFFF" 
                style={styles.badgeIcon}
              />
              <Text style={styles.badgeText}>{getStateLabel(item.state)}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.machineId}>#{item.id}</Text>
      </View>

      {item.description && (
        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Ionicons name="document-text" size={16} color={rose_theme.rose_main} />
            <Text style={styles.infoLabel}>Descrição:</Text>
            <Text style={styles.infoValue} numberOfLines={2}>{item.description}</Text>
          </View>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Carregando atividades...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="list" size={32} color="#FFFFFF" />
        <Text style={styles.title}>Lista de Atividades</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{machines.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {machines.filter(m => m.state === 'active').length}
          </Text>
          <Text style={styles.statLabel}>Disponível</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {machines.filter(m => m.state === 'maintenance').length}
          </Text>
          <Text style={styles.statLabel}>Em Análise</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {machines.filter(m => m.state === 'inactive' || m.state === 'deactive').length}
          </Text>
          <Text style={styles.statLabel}>Indisponível</Text>
        </View>
      </View>

      <FlatList
        data={machines}
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
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: rose_theme.rose_dark,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center' as const,
  },
  refreshButton: {
    padding: 8,
  },
  floatingButton: {
    position: 'absolute' as const,
    bottom: 20,
    right: 20,
    backgroundColor: rose_theme.rose_lightest,
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  statsContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: rose_theme.rose_light,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center' as const,
    minWidth: 70,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 4,
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 15,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  machineName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 8,
  },
  machineId: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600' as const,
  },
  badgeContainer: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  stateBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeIcon: {
    marginRight: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
  cardContent: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#333',
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptyContainer: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#CCCCCC',
    marginTop: 16,
  },
};