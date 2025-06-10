import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { Event } from '../../types/event';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Profile: undefined;
  CreateEvent: undefined;
};

type CreateEventScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateEvent'>;
};

type EventFormData = Omit<Event, 'id' | 'creator_id' | 'created_at' | 'updated_at'> & {
  end_time?: string;
};

const RequiredLabel: React.FC<{ label: string; icon?: keyof typeof Ionicons.glyphMap }> = ({ label, icon }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.labelContainer}>
      {icon && <Ionicons name={icon} size={18} color={colors.primary} style={styles.labelIcon} />}
      <Text style={[styles.label, { color: colors.text }]}>
        {label} <Text style={styles.required}>*</Text>
      </Text>
    </View>
  );
};

const OptionalLabel: React.FC<{ label: string; icon?: keyof typeof Ionicons.glyphMap }> = ({ label, icon }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.labelContainer}>
      {icon && <Ionicons name={icon} size={18} color={colors.subtext} style={styles.labelIcon} />}
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </View>
  );
};

export const CreateEventScreen: React.FC<CreateEventScreenProps> = ({ navigation }) => {
  const { colors, theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  
  const [eventData, setEventData] = useState<EventFormData>({
    title: '',
    description: '',
    image_url: null,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].slice(0, 5),
    end_time: '',
    location: '',
    ticket_price: undefined,
    ticket_stock: undefined,
    ticket_sale_location: '',
    announcement: ''
  });

  const uploadImageToSupabase = async (uri: string): Promise<string | null> => {
    try {
      setImageLoading(true);
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
        length: 524288,
      });

      const fileName = `${Date.now()}.jpg`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('events')
        .upload(filePath, decode(base64), {
          contentType: 'image/jpeg',
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('events')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      return null;
    } finally {
      setImageLoading(false);
    }
  };

  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Error', 'Se necesita permiso para acceder a la galería');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setPreviewImage(imageUri);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        Alert.alert('Error', 'No se puede seleccionar una fecha pasada');
        return;
      }
      
      setEventData(prev => ({
        ...prev,
        date: selectedDate.toISOString().split('T')[0]
      }));
    }
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      const timeString = selectedTime.toTimeString().split(' ')[0].slice(0, 5);
      setEventData(prev => ({
        ...prev,
        time: timeString
      }));
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      const timeString = selectedTime.toTimeString().split(' ')[0].slice(0, 5);
      if (timeString <= eventData.time) {
        Alert.alert('Error', 'La hora de finalización debe ser posterior a la hora de inicio');
        return;
      }
      setEventData(prev => ({
        ...prev,
        end_time: timeString
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!eventData.title.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return false;
    }
    if (!eventData.location.trim()) {
      Alert.alert('Error', 'La ubicación es obligatoria');
      return false;
    }
    if (!previewImage && !eventData.image_url) {
      Alert.alert('Error', 'La imagen es obligatoria');
      return false;
    }
    if (eventData.ticket_price !== undefined && eventData.ticket_price < 0) {
      Alert.alert('Error', 'El precio no puede ser negativo');
      return false;
    }
    if (eventData.ticket_stock !== undefined && eventData.ticket_stock < 0) {
      Alert.alert('Error', 'El stock no puede ser negativo');
      return false;
    }
    if (eventData.ticket_price !== undefined && !eventData.ticket_sale_location) {
      Alert.alert('Error', 'Si el evento es pago, debe especificar el punto de venta');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const [{ data: { user }, error: authError }, finalImageUrl] = await Promise.all([
        supabase.auth.getUser(),
        previewImage ? uploadImageToSupabase(previewImage) : Promise.resolve(eventData.image_url)
      ]);

      if (authError || !user) {
        throw new Error('Usuario no autenticado');
      }

      if (previewImage && !finalImageUrl) {
        throw new Error('Error al subir la imagen');
      }

      const { error: insertError } = await supabase
        .from('events')
        .insert({
          title: eventData.title,
          description: eventData.description,
          image_url: finalImageUrl,
          date: eventData.date,
          time: eventData.time,
          end_time: eventData.end_time || null,
          location: eventData.location,
          ticket_price: eventData.ticket_price || null,
          ticket_stock: eventData.ticket_stock || null,
          ticket_sale_location: eventData.ticket_sale_location || null,
          announcement: eventData.announcement || null,
          creator_id: user.id
        });

      if (insertError) throw insertError;

      Alert.alert('¡Éxito!', 'Evento creado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Error creando evento:', error);
      Alert.alert('Error', error.message || 'No se pudo crear el evento');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
            <Text style={styles.headerTitle}>Crear Evento</Text>
            <Text style={styles.headerSubtitle}>Comparte tu experiencia</Text>
          </View>
          
          <View style={styles.headerButton} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView 
          style={styles.content}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Sección de imagen */}
          <View style={[styles.imageSection, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Imagen del Evento</Text>
            <TouchableOpacity 
              style={[styles.imageContainer, { borderColor: colors.border }]}
              onPress={handleImagePick}
              disabled={imageLoading}
            >
              {(previewImage || eventData.image_url) ? (
                <View style={styles.imageWrapper}>
                  <Image 
                    source={{ uri: previewImage || eventData.image_url! }} 
                    style={styles.eventImage}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.imageOverlay}
                  >
                    <View style={styles.imageActions}>
                      <TouchableOpacity 
                        style={styles.changeImageButton}
                        onPress={handleImagePick}
                      >
                        <Ionicons name="camera" size={20} color="#fff" />
                        <Text style={styles.changeImageText}>Cambiar</Text>
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>
                </View>
              ) : (
                <View style={styles.imagePlaceholder}>
                  {imageLoading ? (
                    <ActivityIndicator size="large" color={colors.primary} />
                  ) : (
                    <>
                      <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        style={styles.imagePlaceholderIcon}
                      >
                        <Ionicons name="image-outline" size={40} color="#fff" />
                      </LinearGradient>
                      <Text style={[styles.imagePlaceholderTitle, { color: colors.text }]}>
                        Agregar Imagen
                      </Text>
                      <Text style={[styles.imagePlaceholderText, { color: colors.subtext }]}>
                        Toca para seleccionar una imagen atractiva para tu evento
                      </Text>
                    </>
                  )}
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Información básica */}
          <View style={[styles.formSection, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Información Básica</Text>
            
            <View style={styles.inputGroup}>
              <RequiredLabel label="Título del evento" icon="text-outline" />
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text
                }]}
                value={eventData.title}
                onChangeText={(text) => setEventData(prev => ({ ...prev, title: text }))}
                placeholder="Ej: Concierto de Rock en el Parque"
                placeholderTextColor={colors.subtext}
              />
            </View>

            <View style={styles.inputGroup}>
              <OptionalLabel label="Descripción" icon="document-text-outline" />
              <TextInput
                style={[styles.textArea, { 
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text
                }]}
                value={eventData.description}
                onChangeText={(text) => setEventData(prev => ({ ...prev, description: text }))}
                placeholder="Describe tu evento, qué pueden esperar los asistentes..."
                placeholderTextColor={colors.subtext}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <RequiredLabel label="Ubicación" icon="location-outline" />
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text
                }]}
                value={eventData.location}
                onChangeText={(text) => setEventData(prev => ({ ...prev, location: text }))}
                placeholder="Ej: Teatro Municipal, Calle Principal 123"
                placeholderTextColor={colors.subtext}
              />
            </View>
          </View>

          {/* Fecha y hora */}
          <View style={[styles.formSection, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Fecha y Horario</Text>
            
            <View style={styles.dateTimeRow}>
              <View style={styles.dateTimeItem}>
                <RequiredLabel label="Fecha" icon="calendar-outline" />
                <TouchableOpacity
                  style={[styles.dateTimeButton, { 
                    backgroundColor: colors.background,
                    borderColor: colors.border
                  }]}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <View style={styles.dateTimeContent}>
                    <Text style={[styles.dateTimeText, { color: colors.text }]}>
                      {new Date(eventData.date).toLocaleDateString('es-ES', { 
                        day: '2-digit', 
                        month: 'short' 
                      })}
                    </Text>
                    <Text style={[styles.dateTimeSubText, { color: colors.subtext }]}>
                      {new Date(eventData.date).getFullYear()}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.dateTimeItem}>
                <RequiredLabel label="Hora inicio" icon="time-outline" />
                <TouchableOpacity
                  style={[styles.dateTimeButton, { 
                    backgroundColor: colors.background,
                    borderColor: colors.border
                  }]}
                  onPress={() => setShowStartTimePicker(true)}
                >
                  <View style={styles.dateTimeContent}>
                    <Text style={[styles.dateTimeText, { color: colors.text }]}>
                      {eventData.time}
                    </Text>
                    <Text style={[styles.dateTimeSubText, { color: colors.subtext }]}>
                      Inicio
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <OptionalLabel label="Hora de finalización" icon="time-outline" />
              <TouchableOpacity
                style={[styles.dateTimeButton, { 
                  backgroundColor: colors.background,
                  borderColor: colors.border
                }]}
                onPress={() => setShowEndTimePicker(true)}
              >
                <View style={styles.dateTimeContent}>
                  <Text style={[styles.dateTimeText, { color: colors.text }]}>
                    {eventData.end_time || 'Sin hora de fin'}
                  </Text>
                  <Text style={[styles.dateTimeSubText, { color: colors.subtext }]}>
                    {eventData.end_time ? 'Finalización' : 'Toca para agregar'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Entradas y precios */}
          <View style={[styles.formSection, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Entradas y Precios</Text>
            
            <View style={styles.priceRow}>
              <View style={styles.priceItem}>
                <OptionalLabel label="Precio" icon="card-outline" />
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text
                  }]}
                  value={eventData.ticket_price?.toString() || ''}
                  onChangeText={(text) => {
                    const price = text === '' ? undefined : parseFloat(text);
                    if (text === '' || (!isNaN(price!) && price! >= 0)) {
                      setEventData(prev => ({ ...prev, ticket_price: price }));
                    }
                  }}
                  placeholder="Gratuito"
                  placeholderTextColor={colors.subtext}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.priceItem}>
                <OptionalLabel label="Stock" icon="ticket-outline" />
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text
                  }]}
                  value={eventData.ticket_stock?.toString() || ''}
                  onChangeText={(text) => {
                    const stock = text === '' ? undefined : parseInt(text);
                    if (text === '' || (!isNaN(stock!) && stock! >= 0)) {
                      setEventData(prev => ({ ...prev, ticket_stock: stock }));
                    }
                  }}
                  placeholder="Ilimitado"
                  placeholderTextColor={colors.subtext}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {eventData.ticket_price && (
              <View style={styles.inputGroup}>
                <RequiredLabel label="Punto de venta" icon="storefront-outline" />
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text
                  }]}
                  value={eventData.ticket_sale_location}
                  onChangeText={(text) => setEventData(prev => ({ ...prev, ticket_sale_location: text }))}
                  placeholder="Ej: Boletería del teatro, Online en eventbrite.com"
                  placeholderTextColor={colors.subtext}
                />
              </View>
            )}
          </View>

          {/* Información adicional */}
          <View style={[styles.formSection, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Información Adicional</Text>
            
            <View style={styles.inputGroup}>
              <OptionalLabel label="Anuncio especial" icon="megaphone-outline" />
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text
                }]}
                value={eventData.announcement}
                onChangeText={(text) => setEventData(prev => ({ ...prev, announcement: text }))}
                placeholder="Ej: ¡Últimas entradas disponibles!"
                placeholderTextColor={colors.subtext}
              />
            </View>
          </View>

          {/* Date/Time Pickers */}
          {showStartDatePicker && (
            <DateTimePicker
              value={new Date(eventData.date)}
              mode="date"
              display="default"
              onChange={handleStartDateChange}
              minimumDate={new Date()}
            />
          )}

          {showStartTimePicker && (
            <DateTimePicker
              value={new Date(`${eventData.date}T${eventData.time}`)}
              mode="time"
              display="default"
              onChange={handleStartTimeChange}
            />
          )}

          {showEndTimePicker && (
            <DateTimePicker
              value={new Date(`${eventData.date}T${eventData.end_time || eventData.time}`)}
              mode="time"
              display="default"
              onChange={handleEndTimeChange}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Botón de crear evento flotante */}
      <View style={[styles.bottomContainer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity 
          style={[
            styles.submitButton,
            loading && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <LinearGradient
            colors={loading ? ['#ccc', '#999'] : ['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitButtonGradient}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="add-circle" size={24} color="#fff" />
            )}
            <Text style={styles.submitButtonText}>
              {loading ? 'Creando evento...' : 'Crear Evento'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  imageSection: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    aspectRatio: 16 / 9,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  imageWrapper: {
    flex: 1,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  imageActions: {
    padding: 16,
    alignItems: 'flex-end',
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  changeImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imagePlaceholderIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePlaceholderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  imagePlaceholderText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  formSection: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelIcon: {
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  required: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  dateTimeItem: {
    flex: 1,
  },
  dateTimeButton: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  dateTimeContent: {
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateTimeSubText: {
    fontSize: 12,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  priceItem: {
    flex: 1,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  submitButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});