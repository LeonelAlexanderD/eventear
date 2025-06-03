import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
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

const RequiredLabel: React.FC<{ label: string }> = ({ label }) => (
  <Text style={styles.label}>
    {label} <Text style={styles.required}>*</Text>
  </Text>
);

export const CreateEventScreen: React.FC<CreateEventScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
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
    }
  };

  const handleImagePick = async () => {
    try {
      // Solicitar permisos primero
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

      console.log('ImagePicker result:', result);

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        console.log('Selected image URI:', imageUri);
        setPreviewImage(imageUri);
      }
    } catch (error) {
      console.error('Error detallado al seleccionar imagen:', error);
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

      Alert.alert('Éxito', 'Evento creado correctamente');
      navigation.goBack();
    } catch (error: any) {
      console.error('Error creando evento:', error);
      Alert.alert('Error', error.message || 'No se pudo crear el evento');
    } finally {
      setLoading(false);
    }
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
        <Text style={[styles.title, { color: colors.text }]}>Crear Evento</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView 
          style={styles.content}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <TouchableOpacity 
            style={[styles.imageContainer, { backgroundColor: colors.border }]}
            onPress={handleImagePick}
          >
            {(previewImage || eventData.image_url) ? (
              <Image 
                source={{ uri: previewImage || eventData.image_url! }} 
                style={styles.eventImage}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={40} color={colors.subtext} />
                <Text style={[styles.imagePlaceholderText, { color: colors.subtext }]}>
                  Toca para agregar una imagen *
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.form}>
            <RequiredLabel label="Título del evento" />
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text
              }]}
              value={eventData.title}
              onChangeText={(text) => setEventData(prev => ({ ...prev, title: text }))}
              placeholder="Nombre del evento"
              placeholderTextColor={colors.subtext}
            />

            <Text style={[styles.label, { color: colors.subtext }]}>Descripción</Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text
              }]}
              value={eventData.description}
              onChangeText={(text) => setEventData(prev => ({ ...prev, description: text }))}
              placeholder="Describe tu evento"
              placeholderTextColor={colors.subtext}
              multiline
              numberOfLines={4}
            />

            <View style={styles.dateTimeContainer}>
              <View style={styles.dateContainer}>
                <RequiredLabel label="Fecha" />
                <TouchableOpacity
                  style={[styles.dateTimeButton, { 
                    backgroundColor: colors.surface,
                    borderColor: colors.border
                  }]}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text style={[styles.dateTimeText, { color: colors.text }]}>
                    {eventData.date}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.timeContainer}>
                <RequiredLabel label="Hora inicio" />
                <TouchableOpacity
                  style={[styles.dateTimeButton, { 
                    backgroundColor: colors.surface,
                    borderColor: colors.border
                  }]}
                  onPress={() => setShowStartTimePicker(true)}
                >
                  <Text style={[styles.dateTimeText, { color: colors.text }]}>
                    {eventData.time}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.timeContainer}>
              <Text style={[styles.label, { color: colors.subtext }]}>Hora fin</Text>
              <TouchableOpacity
                style={[styles.dateTimeButton, { 
                  backgroundColor: colors.surface,
                  borderColor: colors.border
                }]}
                onPress={() => setShowEndTimePicker(true)}
              >
                <Text style={[styles.dateTimeText, { color: colors.text }]}>
                  {eventData.end_time || 'Seleccionar hora fin'}
                </Text>
              </TouchableOpacity>
            </View>

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

            <RequiredLabel label="Ubicación" />
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text
              }]}
              value={eventData.location}
              onChangeText={(text) => setEventData(prev => ({ ...prev, location: text }))}
              placeholder="Dirección del evento"
              placeholderTextColor={colors.subtext}
            />

            <Text style={[styles.label, { color: colors.subtext }]}>Precio de entrada</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface,
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
              placeholder="Dejar vacío si es gratuito"
              placeholderTextColor={colors.subtext}
              keyboardType="numeric"
            />

            <Text style={[styles.label, { color: colors.subtext }]}>Stock de entradas</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface,
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
              placeholder="Dejar vacío si no aplica"
              placeholderTextColor={colors.subtext}
              keyboardType="numeric"
            />

            <Text style={[styles.label, { color: colors.subtext }]}>Punto de venta</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text
              }]}
              value={eventData.ticket_sale_location}
              onChangeText={(text) => setEventData(prev => ({ ...prev, ticket_sale_location: text }))}
              placeholder="Requerido si el evento es pago"
              placeholderTextColor={colors.subtext}
            />

            <Text style={[styles.label, { color: colors.subtext }]}>Anuncio especial</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text
              }]}
              value={eventData.announcement}
              onChangeText={(text) => setEventData(prev => ({ ...prev, announcement: text }))}
              placeholder="Anuncio opcional"
              placeholderTextColor={colors.subtext}
            />
          </View>

          <TouchableOpacity 
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
              { backgroundColor: colors.primary }
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Creando evento...' : 'Crear evento'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  imageContainer: {
    aspectRatio: 16 / 9,
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 16,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  required: {
    color: '#ff0000',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateContainer: {
    flex: 1,
    marginRight: 8,
  },
  timeContainer: {
    flex: 1,
    marginLeft: 8,
  },
  dateTimeButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  dateTimeText: {
    fontSize: 16,
  },
  submitButton: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 90 : 70
  },
}); 