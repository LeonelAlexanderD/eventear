import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { RootStackParamList } from '../../App';
import { useTheme } from '../../contexts/ThemeContext';
import { eventServices } from '../../lib/services';

const { width, height } = Dimensions.get('window');

type EventInfoScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'EventInfo'>;
  route: RouteProp<RootStackParamList, 'EventInfo'>;
};

export const EventInfoScreen: React.FC<EventInfoScreenProps> = ({ navigation, route }) => {
  const { colors, theme } = useTheme();
  const { event } = route.params;
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Imágenes hardcodeadas mejoradas
  const eventImages = [
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&h=800&fit=crop', // Música
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=800&fit=crop', // Concierto
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=800&fit=crop', // Festival
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&h=800&fit=crop', // Deportes
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=800&fit=crop', // Arte
  ];

  const getEventImage = () => {
    const index = event.id ? parseInt(event.id.toString()) % eventImages.length : 0;
    return eventImages[index];
  };

  const getEventCategory = () => {
    const title = event.title.toLowerCase();
    if (title.includes('música') || title.includes('concierto')) return 'Música';
    if (title.includes('deporte') || title.includes('fútbol')) return 'Deportes';
    if (title.includes('arte') || title.includes('exposición')) return 'Arte';
    if (title.includes('comida') || title.includes('gastronómico')) return 'Gastronomía';
    return 'Evento';
  };

  const getCategoryColor = () => {
    const category = getEventCategory();
    switch (category) {
      case 'Música': return '#FF6B6B';
      case 'Deportes': return '#4ECDC4';
      case 'Arte': return '#45B7D1';
      case 'Gastronomía': return '#96CEB4';
      default: return colors.primary;
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
  };

  const getEventStatus = () => {
    if (event.status) {
      switch (event.status) {
        case 'cancelled': return { text: 'Cancelado', color: '#E74C3C' };
        case 'finished': return { text: 'Finalizado', color: '#95A5A6' };
        case 'published': 
          if (event.ticket_stock === 0) return { text: 'Agotado', color: '#E74C3C' };
          return { text: 'Publicado', color: '#27AE60' };
        default: return { text: 'Borrador', color: '#F39C12' };
      }
    }
    
    const eventDate = new Date(event.date);
    const today = new Date();
    
    if (eventDate < today) return { text: 'Finalizado', color: '#95A5A6' };
    if (event.ticket_stock === 0) return { text: 'Agotado', color: '#E74C3C' };
    return { text: 'Activo', color: '#27AE60' };
  };

  const handleCancelEvent = () => {
    Alert.alert(
      'Cancelar Evento',
      `¿Estás seguro de que deseas cancelar "${event.title}"?\n\nEsta acción no se puede deshacer y se notificará a todos los participantes.`,
      [
        { text: 'No cancelar', style: 'cancel' },
        { 
          text: 'Sí, cancelar', 
          style: 'destructive',
          onPress: () => cancelEvent()
        }
      ]
    );
  };

  const cancelEvent = async () => {
    try {
      setLoading(true);
      await eventServices.cancelEvent(event.id);
      
      Alert.alert(
        'Evento Cancelado',
        'El evento ha sido cancelado exitosamente.',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error cancelando evento:', error);
      Alert.alert('Error', 'No se pudo cancelar el evento. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = () => {
    Alert.alert(
      'Editar Evento',
      `¿Deseas editar "${event.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Editar', 
          onPress: () => navigation.navigate('CreateEvent', { event })
        }
      ]
    );
  };

  const handleDeleteEvent = () => {
    Alert.alert(
      'Eliminar Evento',
      `¿Estás seguro de que deseas eliminar "${event.title}"?\n\nEsta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => deleteEvent()
        }
      ]
    );
  };

  const deleteEvent = async () => {
    try {
      setLoading(true);
      await eventServices.deleteEvent(event.id);
      
      Alert.alert(
        'Evento Eliminado',
        'El evento ha sido eliminado exitosamente.',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error eliminando evento:', error);
      Alert.alert('Error', 'No se pudo eliminar el evento. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const status = getEventStatus();
  const isEventFree = event.ticket_price === null || event.ticket_price === 0 || event.ticket_price === undefined;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header flotante */}
      <View style={styles.floatingHeader}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={[styles.headerButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={handleEditEvent}
            style={[styles.headerButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
          >
            <Ionicons name="create-outline" size={24} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleDeleteEvent}
            style={[styles.headerButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
          >
            <Ionicons name="trash-outline" size={24} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Imagen principal con overlay */}
        <View style={styles.imageContainer}>
          {!imageError ? (
            <>
              <Image 
                source={{ uri: event.image_url || getEventImage() }} 
                style={styles.eventImage}
                resizeMode="cover"
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                onError={() => setImageError(true)}
              />
              
              {/* Overlay gradiente */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.imageOverlay}
              />
              
              {/* Badge de estado */}
              <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                <Text style={styles.statusText}>{status.text}</Text>
              </View>

              {/* Badge de evento gratuito */}
              {isEventFree && (
                <View style={styles.freeEventBadge}>
                  <LinearGradient
                    colors={['#4CAF50', '#45a049']}
                    style={styles.freeEventGradient}
                  >
                    <Ionicons name="gift" size={16} color="#fff" />
                    <Text style={styles.freeEventText}>GRATUITO</Text>
                  </LinearGradient>
                </View>
              )}

              {imageLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              )}
            </>
          ) : (
            <LinearGradient
              colors={[getCategoryColor(), getCategoryColor() + '80']}
              style={styles.errorContainer}
            >
              <Ionicons name="image-outline" size={60} color="#fff" />
              <Text style={styles.errorText}>Imagen no disponible</Text>
            </LinearGradient>
          )}
        </View>

        {/* Información principal */}
        <View style={[styles.mainInfo, { backgroundColor: colors.surface }]}>
          <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
          
          {/* Estadísticas rápidas */}
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Ionicons name="eye" size={16} color={colors.primary} />
              <Text style={[styles.statText, { color: colors.subtext }]}>
                {Math.floor(Math.random() * 1000) + 100} vistas
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people" size={16} color={colors.primary} />
              <Text style={[styles.statText, { color: colors.subtext }]}>
                {Math.floor(Math.random() * 200) + 20} interesados
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="ticket" size={16} color={colors.primary} />
              <Text style={[styles.statText, { color: colors.subtext }]}>
                {event.ticket_stock || 0} disponibles
              </Text>
            </View>
          </View>
        </View>

        {/* Información detallada */}
        <View style={[styles.detailsContainer, { backgroundColor: colors.surface }]}>
          {/* Fecha y hora */}
          <View style={styles.infoCard}>
            <View style={[styles.infoIconContainer, { backgroundColor: getCategoryColor() + '20' }]}>
              <Ionicons name="calendar" size={24} color={getCategoryColor()} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.subtext }]}>Fecha y Hora</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {formatDate(event.date)}
              </Text>
              {event.time && (
                <Text style={[styles.infoSubValue, { color: colors.subtext }]}>
                  {event.time}{event.end_time ? ` - ${event.end_time}` : ''}
                </Text>
              )}
            </View>
          </View>

          {/* Ubicación */}
          <View style={styles.infoCard}>
            <View style={[styles.infoIconContainer, { backgroundColor: getCategoryColor() + '20' }]}>
              <Ionicons name="location" size={24} color={getCategoryColor()} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.subtext }]}>Ubicación</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {event.location || 'Ubicación por confirmar'}
              </Text>
            </View>
          </View>

          {/* Precio */}
          <View style={styles.infoCard}>
            <View style={[styles.infoIconContainer, { backgroundColor: getCategoryColor() + '20' }]}>
              <Ionicons name="card" size={24} color={getCategoryColor()} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.subtext }]}>Precio</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {isEventFree ? 'Gratuito' : `$${event.ticket_price}`}
              </Text>
            </View>
          </View>

          {/* Descripción */}
          {event.description && (
            <View style={styles.infoCard}>
              <View style={[styles.infoIconContainer, { backgroundColor: getCategoryColor() + '20' }]}>
                <Ionicons name="document-text" size={24} color={getCategoryColor()} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.subtext }]}>Descripción</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {event.description}
                </Text>
              </View>
            </View>
          )}

          {/* Categoría */}
          <View style={styles.infoCard}>
            <View style={[styles.infoIconContainer, { backgroundColor: getCategoryColor() + '20' }]}>
              <Ionicons name="pricetag" size={24} color={getCategoryColor()} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.subtext }]}>Categoría</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {getEventCategory()}
              </Text>
            </View>
          </View>
        </View>

        {/* Botones de acción */}
        <View style={[styles.actionButtons, { backgroundColor: colors.surface }]}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]}
            onPress={handleCancelEvent}
            disabled={loading}
          >
            <Ionicons name="close-circle" size={20} color="#E74C3C" />
            <Text style={styles.cancelButtonText}>Cancelar Evento</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Procesando...
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingHeader: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1000,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    height: height * 0.4,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  statusBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  freeEventBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  freeEventGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  freeEventText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  mainInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    lineHeight: 34,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailsContainer: {
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 15,
  },
  infoIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  infoSubValue: {
    fontSize: 14,
    marginTop: 2,
  },
  actionButtons: {
    padding: 20,
    paddingBottom: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E74C3C',
  },
  cancelButtonText: {
    color: '#E74C3C',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
});
