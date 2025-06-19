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

  // Array de imágenes de respaldo por categoría
  const fallbackImages = {
    musica: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop',
    concierto: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
    festival: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop',
    deportes: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop',
    arte: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    comida: 'https://images.unsplash.com/photo-1414016642750-7fdd78dc33d9?w=800&h=600&fit=crop',
    default: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop'
  };

  const getEventImage = () => {
    // Si el evento tiene una image_url, usarla
    if (event.image_url) {
      return event.image_url;
    }

    // Si no tiene imagen, usar una imagen de respaldo según la primera categoría
    if (event.categories && event.categories.length > 0) {
      const category = event.categories[0].name.toLowerCase();
      return fallbackImages[category as keyof typeof fallbackImages] || fallbackImages.default;
    }

    return fallbackImages.default;
  };

  const getCategoryColor = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'música': return '#FF6B6B';
      case 'deportes': return '#4ECDC4';
      case 'arte': return '#45B7D1';
      case 'gastronomía': return '#96CEB4';
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
            
            {/* Badges de categorías */}
            <View style={styles.categoriesContainer}>
              {event.categories?.map((category, index) => (
                <View 
                  key={category.id}
                  style={[
                    styles.categoryBadge, 
                    { backgroundColor: getCategoryColor(category.name) }
                  ]}
                >
                  <Text style={styles.categoryText}>{category.name}</Text>
                </View>
              ))}
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
            <View style={[styles.dateCard, { backgroundColor: event.categories?.[0] ? getCategoryColor(event.categories[0].name) : colors.primary }]}>
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
            <Text style={[styles.priceLabel, { color: colors.subtext }]}>
              {event.ticket_price ? `$${event.ticket_price}` : 'Gratis'}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.actionButton, { 
              backgroundColor: event.categories?.[0] 
                ? getCategoryColor(event.categories[0].name) 
                : colors.primary 
            }]}
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
  categoriesContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBadge: {
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
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 60,
  },
  dayText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  monthText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  dateTimeInfo: {
    marginLeft: 12,
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  locationText: {
    marginLeft: 6,
    fontSize: 14,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  popularityIndicator: {
    position: 'absolute',
    top: 180,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  popularityText: {
    fontSize: 12,
    fontWeight: '500',
  },
});