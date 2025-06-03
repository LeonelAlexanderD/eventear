import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { EventCardProps } from '../types/event';

export const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const { colors } = useTheme();
  const formattedDate = format(new Date(event.date), 'dd MMM yyyy', { locale: es });
  const [imageLoading, setImageLoading] = React.useState(true);
  const [imageError, setImageError] = React.useState(false);

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.surface }]} 
      onPress={() => onPress(event)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {!imageError ? (
          <>
            <Image
              source={{ 
                uri: event.image_url || 'https://via.placeholder.com/300x160?text=No+Image',
                cache: 'force-cache'
              }}
              style={styles.image}
              resizeMode="cover"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => setImageError(true)}
            />
            {imageLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
          </>
        ) : (
          <View style={[styles.errorContainer, { backgroundColor: colors.border }]}>
            <Ionicons name="image-outline" size={40} color={colors.subtext} />
            <Text style={[styles.errorText, { color: colors.subtext }]}>
              No se pudo cargar la imagen
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {event.title}
        </Text>
        <View style={styles.details}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={16} color={colors.primary} />
            <Text style={[styles.date, { color: colors.subtext }]}>{formattedDate}</Text>
          </View>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color={colors.primary} />
            <Text style={[styles.location, { color: colors.subtext }]} numberOfLines={1}>
              {event.location}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    margin: 8,
    width: 300,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
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
  },
  infoContainer: {
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  details: {
    gap: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: 14,
    fontWeight: '500',
  },
  location: {
    fontSize: 14,
    flex: 1,
  },
}); 