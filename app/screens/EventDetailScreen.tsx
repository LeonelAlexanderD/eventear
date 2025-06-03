import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import React from 'react';
import {
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

type EventDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'EventDetail'>;
  route: RouteProp<RootStackParamList, 'EventDetail'>;
};

export const EventDetailScreen: React.FC<EventDetailScreenProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { event } = route.params;

  const formatDate = (date: string) => {
    return format(new Date(date), "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { 
        backgroundColor: colors.surface,
        borderBottomColor: colors.border
      }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Detalle del Evento</Text>
      </View>

      <ScrollView style={styles.content}>
        {event.image_url && (
          <Image 
            source={{ uri: event.image_url }} 
            style={styles.eventImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.eventInfo}>
          <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {formatDate(event.date)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {event.time}{event.end_time ? ` - ${event.end_time}` : ''}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {event.location}
            </Text>
          </View>

          {event.description && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Descripción</Text>
              <Text style={[styles.description, { color: colors.text }]}>
                {event.description}
              </Text>
            </View>
          )}

          {event.ticket_price !== null && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Información de Entradas</Text>
              <Text style={[styles.infoText, { color: colors.text }]}>
                Precio: ${event.ticket_price}
              </Text>
              {event.ticket_stock !== null && (
                <Text style={[styles.infoText, { color: colors.text }]}>
                  Stock disponible: {event.ticket_stock}
                </Text>
              )}
              {event.ticket_sale_location && (
                <Text style={[styles.infoText, { color: colors.text }]}>
                  Punto de venta: {event.ticket_sale_location}
                </Text>
              )}
            </View>
          )}

          {event.announcement && (
            <View style={[styles.announcement, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="megaphone" size={24} color={colors.primary} />
              <Text style={[styles.announcementText, { color: colors.text }]}>
                {event.announcement}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  eventImage: {
    width: '100%',
    height: 250,
  },
  eventInfo: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 8,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  announcement: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  announcementText: {
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
  },
}); 