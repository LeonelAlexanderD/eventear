import { RootStackParamList } from '@/App';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { eventServices } from '../../lib/services';
import { Event } from '../../types/event';

const { width } = Dimensions.get('window');

type MyEventsScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'MyEvents'>;
};

const MyEventsScreen = ({ navigation }: MyEventsScreenProps) => {
  const { colors, theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const events = await eventServices.getUserEvents();
      setAllEvents(events);
    } catch (error) {
      console.error('Error cargando eventos:', error);
      Alert.alert('Error', 'No se pudieron cargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (selectedFilter) {
      case 'upcoming':
        return allEvents.filter(event => new Date(event.date) >= today);
      case 'past':
        return allEvents.filter(event => new Date(event.date) < today);
      default:
        return allEvents;
    }
  };

  const filteredEvents = getFilteredEvents();
  const upcomingCount = allEvents.filter(event => new Date(event.date) >= new Date()).length;
  const pastCount = allEvents.filter(event => new Date(event.date) < new Date()).length;

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const handleEventPress = (event: Event) => {
    navigation.navigate('EventInfo', { event });
  };

  const handleCreateEvent = () => {
    navigation.navigate('CreateEvent');
  };

  const handleEditEvent = (event: Event) => {
    Alert.alert(
      'Editar Evento',
      `¿Deseas editar "${event.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Editar', onPress: () => console.log('Editar evento:', event.id) }
      ]
    );
  };

  const handleDeleteEvent = (event: Event) => {
    Alert.alert(
      'Eliminar Evento',
      `¿Estás seguro de que deseas eliminar "${event.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => console.log('Eliminar evento:', event.id) 
        }
      ]
    );
  };

  const getEventStatus = (event: Event) => {
    // Si el evento tiene un status definido en la base de datos, usarlo
    if (event.status) {
      switch (event.status) {
        case 'cancelled': return 'cancelled';
        case 'finished': return 'past';
        case 'published': 
          // Para eventos publicados, verificar si están agotados o activos
          if (event.ticket_stock === 0) return 'sold_out';
          return 'active';
        default: return 'active';
      }
    }
    
    // Fallback al cálculo manual si no hay status
    const eventDate = new Date(event.date);
    const today = new Date();
    
    if (eventDate < today) return 'past';
    if (event.ticket_stock === 0) return 'sold_out';
    return 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'past': return '#95A5A6';
      case 'cancelled': return '#E74C3C';
      case 'sold_out': return '#E74C3C';
      case 'active': return '#27AE60';
      default: return colors.primary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'past': return 'Finalizado';
      case 'cancelled': return 'Cancelado';
      case 'sold_out': return 'Agotado';
      case 'active': return 'Activo';
      default: return 'Activo';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header con gradiente */}
      <LinearGradient
        colors={theme === 'dark' ? ['#2C3E50', '#34495E'] : ['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={[styles.headerButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Mis Eventos</Text>
            <Text style={styles.headerSubtitle}>
              {loading ? 'Cargando...' : `${allEvents.length} eventos creados`}
            </Text>
          </View>
          
          <TouchableOpacity 
            onPress={handleCreateEvent}
            style={[styles.headerButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Cargando eventos...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Estadísticas */}
          <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#27AE60' }]}>{upcomingCount}</Text>
              <Text style={[styles.statLabel, { color: colors.subtext }]}>Próximos</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#95A5A6' }]}>{pastCount}</Text>
              <Text style={[styles.statLabel, { color: colors.subtext }]}>Finalizados</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {allEvents.reduce((sum, event) => sum + (event.ticket_stock || 0), 0) || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.subtext }]}>Entradas</Text>
            </View>
          </View>

          {/* Filtros */}
          <View style={[styles.filtersContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.filtersTitle, { color: colors.text }]}>Filtrar por:</Text>
            <View style={styles.filtersRow}>
              {[
                { key: 'all', label: 'Todos', count: allEvents.length },
                { key: 'upcoming', label: 'Próximos', count: upcomingCount },
                { key: 'past', label: 'Finalizados', count: pastCount }
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterButton,
                    {
                      backgroundColor: selectedFilter === filter.key 
                        ? colors.primary 
                        : colors.background,
                      borderColor: colors.border
                    }
                  ]}
                  onPress={() => setSelectedFilter(filter.key as any)}
                >
                  <Text style={[
                    styles.filterButtonText,
                    {
                      color: selectedFilter === filter.key 
                        ? '#fff' 
                        : colors.text
                    }
                  ]}>
                    {filter.label}
                  </Text>
                  <View style={[
                    styles.filterBadge,
                    {
                      backgroundColor: selectedFilter === filter.key 
                        ? 'rgba(255,255,255,0.3)' 
                        : colors.primary
                    }
                  ]}>
                    <Text style={[
                      styles.filterBadgeText,
                      {
                        color: selectedFilter === filter.key 
                          ? '#fff' 
                          : '#fff'
                      }
                    ]}>
                      {filter.count}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Lista de eventos mejorada */}
          {filteredEvents.length > 0 ? (
            <View style={[styles.eventsContainer, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {selectedFilter === 'all' && 'Todos los Eventos'}
                {selectedFilter === 'upcoming' && 'Eventos Próximos'}
                {selectedFilter === 'past' && 'Eventos Finalizados'}
              </Text>
              
              {filteredEvents.map((event, index) => {
                const status = getEventStatus(event);
                return (
                  <TouchableOpacity
                    key={event.id}
                    style={[styles.eventCard, { backgroundColor: colors.background }]}
                    onPress={() => handleEventPress(event)}
                  >
                    <View style={styles.eventCardContent}>
                      <View style={styles.eventInfo}>
                        <View style={styles.eventHeader}>
                          <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={1}>
                            {event.title}
                          </Text>
                          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
                            <Text style={styles.statusText}>{getStatusText(status)}</Text>
                          </View>
                        </View>
                        
                        <View style={styles.eventDetails}>
                          <View style={styles.eventDetailRow}>
                            <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                            <Text style={[styles.eventDetailText, { color: colors.subtext }]}>
                              {new Date(event.date).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })} • {event.time}
                            </Text>
                          </View>
                          
                          <View style={styles.eventDetailRow}>
                            <Ionicons name="location-outline" size={16} color={colors.primary} />
                            <Text style={[styles.eventDetailText, { color: colors.subtext }]} numberOfLines={1}>
                              {event.location}
                            </Text>
                          </View>
                          
                          <View style={styles.eventDetailRow}>
                            <Ionicons name="ticket-outline" size={16} color={colors.primary} />
                            <Text style={[styles.eventDetailText, { color: colors.subtext }]}>
                              ${event.ticket_price} • {event.ticket_stock || 0} disponibles
                            </Text>
                          </View>
                        </View>
                      </View>
                      
                      <View style={styles.eventActions}>
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
                          onPress={() => handleEditEvent(event)}
                        >
                          <Ionicons name="create-outline" size={20} color={colors.primary} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: '#E74C3C20' }]}
                          onPress={() => handleDeleteEvent(event)}
                        >
                          <Ionicons name="trash-outline" size={20} color="#E74C3C" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={[styles.emptyContainer, { backgroundColor: colors.surface }]}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.emptyIcon}
              >
                <Ionicons name="calendar-outline" size={40} color="#fff" />
              </LinearGradient>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {selectedFilter === 'all' && 'No tienes eventos creados'}
                {selectedFilter === 'upcoming' && 'No tienes eventos próximos'}
                {selectedFilter === 'past' && 'No tienes eventos finalizados'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.subtext }]}>
                {selectedFilter === 'all' 
                  ? 'Crea tu primer evento y comienza a organizar experiencias increíbles'
                  : 'Cambia el filtro para ver otros eventos'
                }
              </Text>
              {selectedFilter === 'all' && (
                <TouchableOpacity
                  style={[styles.createButton, { backgroundColor: colors.primary }]}
                  onPress={handleCreateEvent}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.createButtonText}>Crear Evento</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    margin: 16,
    marginTop: -10,
    borderRadius: 16,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: '80%',
    alignSelf: 'center',
    marginHorizontal: 16,
  },
  filtersContainer: {
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  eventsContainer: {
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  eventCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  eventCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventInfo: {
    flex: 1,
    marginRight: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  eventDetails: {
    gap: 4,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventDetailText: {
    fontSize: 12,
    flex: 1,
  },
  eventActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
  },
});

export default MyEventsScreen;