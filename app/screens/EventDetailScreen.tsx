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
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { RootStackParamList } from '../../App';
import { useTheme } from '../../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

type EventDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'EventDetail'>;
  route: RouteProp<RootStackParamList, 'EventDetail'>;
};

export const EventDetailScreen: React.FC<EventDetailScreenProps> = ({ navigation, route }) => {
  const { colors, theme } = useTheme();
  const { event } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInterested, setIsInterested] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

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

  const formatTime = (time: string) => {
    return format(new Date(`2000-01-01T${time}`), 'HH:mm', { locale: es });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `¡Mira este evento increíble! ${event.title} - ${formatDate(event.date)} en ${event.location}`,
        title: event.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Aquí implementarías la lógica para guardar en favoritos
  };

  const handleInterested = () => {
    setIsInterested(!isInterested);
    Alert.alert(
      isInterested ? 'Ya no estás interesado' : '¡Genial!',
      isInterested 
        ? 'Has sido removido de la lista de interesados' 
        : 'Te hemos agregado a la lista de interesados. Te notificaremos sobre actualizaciones.'
    );
  };

  const handleBuyTickets = () => {
    Alert.alert(
      'Comprar Entradas',
      '¿Deseas proceder con la compra de entradas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Continuar', onPress: () => console.log('Redirect to payment') }
      ]
    );
  };

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
            onPress={handleShare}
            style={[styles.headerButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
          >
            <Ionicons name="share-outline" size={24} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleFavorite}
            style={[styles.headerButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite ? "#FF6B6B" : "#fff"} 
            />
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
              
              {/* Badge de categoría */}
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor() }]}>
                <Text style={styles.categoryText}>{getEventCategory()}</Text>
              </View>

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
          
          {/* Stats rápidas */}
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Ionicons name="people" size={16} color={colors.primary} />
              <Text style={[styles.statText, { color: colors.subtext }]}>
                {Math.floor(Math.random() * 500) + 50} interesados
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={[styles.statText, { color: colors.subtext }]}>
                4.{Math.floor(Math.random() * 9) + 1}/5.0
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
                {event.location}
              </Text>
              <TouchableOpacity style={styles.mapButton}>
                <Text style={[styles.mapButtonText, { color: getCategoryColor() }]}>
                  Ver en mapa
                </Text>
                <Ionicons name="map" size={16} color={getCategoryColor()} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Precio */}
          {event.ticket_price !== null && (
            <View style={styles.infoCard}>
              <View style={[styles.infoIconContainer, { backgroundColor: getCategoryColor() + '20' }]}>
                <Ionicons name="ticket" size={24} color={getCategoryColor()} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.subtext }]}>Entradas</Text>
                <Text style={[styles.priceText, { color: getCategoryColor() }]}>
                  ${event.ticket_price}
                </Text>
                {event.ticket_stock !== null && (
                  <Text style={[styles.infoSubValue, { color: colors.subtext }]}>
                    {event.ticket_stock} disponibles
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Descripción */}
        {event.description && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Sobre el Evento</Text>
            <Text style={[styles.description, { color: colors.text }]}>
              {event.description}
            </Text>
          </View>
        )}

        {/* Anuncio especial */}
        {event.announcement && (
          <View style={[styles.announcement, { 
            backgroundColor: getCategoryColor() + '15',
            borderColor: getCategoryColor() + '30'
          }]}>
            <View style={[styles.announcementIcon, { backgroundColor: getCategoryColor() }]}>
              <Ionicons name="megaphone" size={20} color="#fff" />
            </View>
            <View style={styles.announcementContent}>
              <Text style={[styles.announcementTitle, { color: colors.text }]}>
                Anuncio Importante
              </Text>
              <Text style={[styles.announcementText, { color: colors.text }]}>
                {event.announcement}
              </Text>
            </View>
          </View>
        )}

        {/* Organizador */}
        <View style={[styles.organizerSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Organizador</Text>
          <View style={styles.organizerCard}>
            <View style={[styles.organizerAvatar, { backgroundColor: getCategoryColor() }]}>
              {/* <Text style={styles.organizerInitial}>
                {event.organizer ? event.organizer.charAt(0).toUpperCase() : 'E'}
              </Text> */}
            </View>
            <View style={styles.organizerInfo}>
              {/* <Text style={[styles.organizerName, { color: colors.text }]}>
                {event.organizer || 'Evente-Ar'}
              </Text> */}
              <Text style={[styles.organizerRole, { color: colors.subtext }]}>
                Organizador del evento
              </Text>
            </View>
            <TouchableOpacity style={styles.contactButton}>
              <Ionicons name="chatbubble-outline" size={20} color={getCategoryColor()} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Espacio para botones flotantes */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Botones de acción flotantes */}
      <View style={[styles.actionButtons, { backgroundColor: colors.surface }]}>
        <TouchableOpacity 
          onPress={handleInterested}
          style={[
            styles.secondaryButton, 
            { 
              backgroundColor: isInterested ? getCategoryColor() + '20' : colors.border,
              borderColor: getCategoryColor()
            }
          ]}
        >
          <Ionicons 
            name={isInterested ? "checkmark" : "add"} 
            size={20} 
            color={isInterested ? getCategoryColor() : colors.subtext} 
          />
          <Text style={[
            styles.secondaryButtonText, 
            { color: isInterested ? getCategoryColor() : colors.subtext }
          ]}>
            {isInterested ? 'Interesado' : 'Me interesa'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleBuyTickets}
          style={[styles.primaryButton, { backgroundColor: getCategoryColor() }]}
        >
          <Ionicons name="ticket" size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>
            {event.ticket_price ? `Comprar - $${event.ticket_price}` : 'Obtener Entrada'}
          </Text>
        </TouchableOpacity>
      </View>
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
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: height * 0.4,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 4,
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  errorContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  mainInfo: {
    padding: 24,
    marginTop: -30,
    marginHorizontal: 16,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 36,
  },
  quickStats: {
    flexDirection: 'row',
    gap: 24,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailsContainer: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  infoIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoSubValue: {
    fontSize: 14,
  },
  priceText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  announcement: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  announcementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  announcementContent: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  announcementText: {
    fontSize: 14,
    lineHeight: 20,
  },
  organizerSection: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  organizerInitial: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  organizerInfo: {
    flex: 1,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  organizerRole: {
    fontSize: 14,
    marginTop: 2,
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSpacer: {
    height: 100,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 40,
    gap: 12,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 1,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 25,
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});