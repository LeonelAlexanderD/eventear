import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
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

type RootStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
};

type EditProfileScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;
};

type UserProfileData = {
  name: string;
  nickname: string;
  phone: string;
  birthYear: string;
  instagram: string;
  avatarUrl: string | null;
};

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ navigation }) => {
  const [profile, setProfile] = useState<UserProfileData>({
    name: '',
    nickname: '',
    phone: '',
    birthYear: '',
    instagram: '',
    avatarUrl: null
  });
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No se encontró usuario');

      setProfile({
        name: user.user_metadata.name || '',
        nickname: user.user_metadata.nickname || '',
        phone: user.user_metadata.phone || '',
        birthYear: user.user_metadata.birthYear || '',
        instagram: user.user_metadata.instagram || '',
        avatarUrl: user.user_metadata.avatarUrl || null
      });
    } catch (error) {
      console.error('Error cargando perfil:', error);
      Alert.alert('Error', 'No se pudo cargar el perfil');
    }
  };

  const uploadImageToSupabase = async (uri: string): Promise<string | null> => {
    try {
      // Leer el archivo como base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Generar un nombre único para el archivo
      const fileName = `${Date.now()}.jpg`;
      const filePath = `public/${fileName}`;

      // Subir la imagen a Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('profiles')
        .upload(filePath, decode(base64), {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Obtener la URL pública de la imagen
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      return null;
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setLoading(true);
        const imageUri = result.assets[0].uri;
        
        // Subir la imagen a Supabase Storage
        const publicUrl = await uploadImageToSupabase(imageUri);
        
        if (publicUrl) {
          setProfile(prev => ({ ...prev, avatarUrl: publicUrl }));
        } else {
          Alert.alert('Error', 'No se pudo subir la imagen');
        }
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        data: {
          name: profile.name,
          nickname: profile.nickname,
          phone: profile.phone,
          birthYear: profile.birthYear,
          instagram: profile.instagram,
          avatarUrl: profile.avatarUrl
        }
      });

      if (error) throw error;

      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      navigation.goBack();
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
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
          <Text style={[styles.title, { color: colors.text }]}>Editar Perfil</Text>
        </View>

        <ScrollView style={styles.content}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={handleImagePick}
          >
            {profile.avatarUrl ? (
              <Image 
                source={{ uri: profile.avatarUrl }} 
                style={[styles.avatar, { borderColor: colors.surface }]}
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.border }]}>
                <Ionicons name="camera" size={40} color={colors.subtext} />
              </View>
            )}
            <Text style={[styles.changePhotoText, { color: colors.primary }]}>
              Cambiar foto
            </Text>
          </TouchableOpacity>

          <View style={styles.form}>
            <Text style={[styles.label, { color: colors.subtext }]}>Nombre completo</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text
              }]}
              value={profile.name}
              onChangeText={(text) => setProfile(prev => ({ ...prev, name: text }))}
              placeholder="Tu nombre completo"
              placeholderTextColor={colors.subtext}
            />

            <Text style={[styles.label, { color: colors.subtext }]}>Nombre de usuario</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text
              }]}
              value={profile.nickname}
              onChangeText={(text) => setProfile(prev => ({ ...prev, nickname: text }))}
              placeholder="@usuario"
              placeholderTextColor={colors.subtext}
              autoCapitalize="none"
            />

            <Text style={[styles.label, { color: colors.subtext }]}>Teléfono</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text
              }]}
              value={profile.phone}
              onChangeText={(text) => setProfile(prev => ({ ...prev, phone: text }))}
              placeholder="Tu número de teléfono"
              placeholderTextColor={colors.subtext}
              keyboardType="phone-pad"
            />

            <Text style={[styles.label, { color: colors.subtext }]}>Año de nacimiento</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text
              }]}
              value={profile.birthYear}
              onChangeText={(text) => setProfile(prev => ({ ...prev, birthYear: text }))}
              placeholder="YYYY"
              placeholderTextColor={colors.subtext}
              keyboardType="number-pad"
              maxLength={4}
            />

            <Text style={[styles.label, { color: colors.subtext }]}>Instagram</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text
              }]}
              value={profile.instagram}
              onChangeText={(text) => setProfile(prev => ({ ...prev, instagram: text }))}
              placeholder="@tu_instagram"
              placeholderTextColor={colors.subtext}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity 
            style={[
              styles.saveButton,
              loading && styles.saveButtonDisabled
            ]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Guardando...' : 'Guardar cambios'}
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
  avatarContainer: {
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: {
    marginTop: 8,
    fontSize: 16,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 