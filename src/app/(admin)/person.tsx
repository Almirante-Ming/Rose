import React, { useState, useEffect } from 'react';
import {View,Text,FlatList,ActivityIndicator,Alert,TouchableOpacity,RefreshControl} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { personsService } from '@/services';
import { rose_theme } from '@constants/rose_theme';
import { PersonResponse } from '@constants/types';

export default function Person() {
  const [persons, setPersons] = useState<PersonResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPersons = async () => {
    try {
      setIsLoading(true);
      const data = await personsService.getPersons();
      setPersons(data);
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

  const renderPersonCard = ({ item }: { item: PersonResponse }) => (
    <View style={styles.card}>
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
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Carregando pessoas...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="people" size={32} color="#FFFFFF" />
        <Text style={styles.title}>Lista de Pessoas</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{persons.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {persons.filter(p => p.p_type === 'admin').length}
          </Text>
          <Text style={styles.statLabel}>Admins</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {persons.filter(p => p.p_type === 'trainer').length}
          </Text>
          <Text style={styles.statLabel}>Instrutores</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {persons.filter(p => p.p_type === 'customer').length}
          </Text>
          <Text style={styles.statLabel}>Clientes</Text>
        </View>
      </View>

      <FlatList
        data={persons}
        renderItem={renderPersonCard}
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
            <Ionicons name="people-outline" size={64} color="#CCCCCC" />
            <Text style={styles.emptyText}>Nenhuma pessoa encontrada</Text>
          </View>
        }
      />
      
      <TouchableOpacity style={styles.floatingButton} onPress={() => router.push('/personAdd')}>
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
  personName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 8,
  },
  personId: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600' as const,
  },
  badgeContainer: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
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