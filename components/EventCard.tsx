import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { EventCardProps } from '../types/event';

const { width } = Dimensions.get('window');

export const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const { colors, theme } = useTheme();
  const formattedDate = format(new Date(event.date), 'dd MMM yyyy', { locale: es });
  const formattedTime = format(new Date(event.date), 'HH:mm', { locale: es });
  const [imageLoading, setImageLoading] = React.useState(true);
  const [imageError, setImageError] = React.useState(false);

  // Array de imágenes hardcodeadas para diferentes tipos de eventos
  const eventImages = [
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop', // Música
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop', // Concierto
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop', // Festival
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop', // Deportes
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop', // Arte
    'https://images.unsplash.com/photo-1414016642750-7fdd78dc33d9?w=800&h=600&fit=crop', // Comida
  ];

  // Seleccionar imagen basada en el ID del evento o usar una por defecto
  const getEventImage = () => {
    const index = event.id ? parseInt(event.id.toString()) % eventImages.length : 0;
    return eventImages[index];
  };

  // Determinar categoría del evento basado en el título (ejemplo)
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

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.surface }]} 
      onPress={() => onPress(event)}
      activeOpacity={0.9}
    >
      {/* Imagen con overlay */}
      <View style={styles.imageContainer}>
        {!imageError ? (
          <>
            <Image
              source={{ 
                uri: getEventImage(),
                cache: 'force-cache'
              }}
              style={styles.image}
              resizeMode="cover"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => setImageError(true)}
            />
            
            {/* Overlay gradiente */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.imageOverlay}
            />
            
            {/* Badge de categoría */}
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor() }]}>
              <Text style={styles.categoryText}>{getEventCategory()}</Text>
            </View>

            {/* Indicador de favorito */}
            <TouchableOpacity style={styles.favoriteButton}>
              <Ionicons name="heart-outline" size={20} color="#fff" />
            </TouchableOpacity>

            {imageLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
          </>
        ) : (
          <LinearGradient
            colors={theme === 'dark' ? ['#2C3E50', '#34495E'] : ['#667eea', '#764ba2']}
            style={styles.errorContainer}
          >
            <Ionicons name="image-outline" size={50} color="#fff" />
            <Text style={styles.errorText}>Imagen no disponible</Text>
          </LinearGradient>
        )}
      </View>
      
      {/* Información del evento */}
      <View style={styles.infoContainer}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {event.title}
        </Text>
        
        <Text style={[styles.description, { color: colors.subtext }]} numberOfLines={2}>
          {event.description || 'Únete a este increíble evento y vive una experiencia única.'}
        </Text>
        
        <View style={styles.detailsContainer}>
          {/* Fecha y hora */}
          <View style={styles.dateTimeContainer}>
            <View style={[styles.dateCard, { backgroundColor: getCategoryColor() }]}>
              <Text style={styles.dayText}>
                {format(new Date(event.date), 'dd', { locale: es })}
              </Text>
              <Text style={styles.monthText}>
                {format(new Date(event.date), 'MMM', { locale: es }).toUpperCase()}
              </Text>
            </View>
            <View style={styles.dateTimeInfo}>
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={16} color={colors.primary} />
                <Text style={[styles.timeText, { color: colors.text }]}>{formattedTime}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={16} color={colors.primary} />
                <Text style={[styles.locationText, { color: colors.subtext }]} numberOfLines={1}>
                  {event.location}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer con precio y botón */}
        <View style={styles.footerContainer}>
          <View style={styles.priceContainer}>
            <Text style={[styles.priceLabel, { color: colors.subtext }]}>Desde</Text>
            {/* <Text style={[styles.priceText, { color: getCategoryColor() }]}>
              ${event.price || '2,500'}
            </Text> */}
          </View>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: getCategoryColor() }]}
            onPress={() => onPress(event)}
          >
            <Text style={styles.actionButtonText}>Ver más</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Indicador de popularidad */}
      <View style={[styles.popularityIndicator, { backgroundColor: colors.surface }]}>
        <Ionicons name="people" size={14} color={colors.primary} />
        <Text style={[styles.popularityText, { color: colors.primary }]}>
          {Math.floor(Math.random() * 500) + 50}+ interesados
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    margin: 8,
    width: width * 0.85,
    maxWidth: 350,
    overflow: 'hidden',
    position: 'relative',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: 8,
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  infoContainer: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 26,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateCard: {
    width: 50,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  dayText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  monthText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  dateTimeInfo: {
    flex: 1,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  locationText: {
    fontSize: 14,
    flex: 1,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
  },
  priceText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  popularityIndicator: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  popularityText: {
    fontSize: 10,
    fontWeight: '500',
  },
});