import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Linking, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';

type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  EditProfile: undefined;
  CreateEvent: undefined;
};

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'>;
};

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { theme, colors } = useTheme();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No se encontró usuario');

      setProfile({
        name: user.user_metadata.name || 'Usuario',
        email: user.email || '',
        phone: user.user_metadata.phone || '',
        nickname: user.user_metadata.nickname || '',
        birthYear: user.user_metadata.birthYear || '',
        instagram: user.user_metadata.instagram || '',
        avatarUrl: user.user_metadata.avatarUrl || null,
        role: user.user_metadata.role || 'user'
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      navigation.goBack();
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sí, cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            navigation.goBack();
          },
        },
      ],
    );
  };

  const handleInstagramPress = () => {
    if (profile?.instagram) {
      const instagramUrl = `https://instagram.com/${profile.instagram.replace('@', '')}`;
      Linking.openURL(instagramUrl);
    }
  };

  const handleMenuItemPress = (title: string) => {
    switch (title) {
      case 'Preferencias':
        // Implementar navegación a preferencias
        break;
      case 'Favoritos':
        // Implementar navegación a favoritos
        break;
      case 'Suscripciones':
        // Implementar navegación a suscripciones
        break;
      case 'Notificaciones':
        // Implementar navegación a notificaciones
        break;
      case 'Mis Eventos':
        // Implementar navegación a mis eventos
        break;
      case 'Crear Evento':
        navigation.navigate('CreateEvent');
        break;
    }
  };

  const menuItems: MenuItem[] = [
    { icon: 'settings-outline', title: 'Preferencias' },
    { icon: 'heart-outline', title: 'Favoritos' },
    { icon: 'people-outline', title: 'Suscripciones' },
    { icon: 'notifications-outline', title: 'Notificaciones' },
    { icon: 'calendar-outline', title: 'Mis Eventos' },
    { icon: 'add-circle-outline', title: 'Crear Evento' }
  ];

  if (!profile) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Perfil</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('EditProfile')}
          style={styles.editButton}
        >
          <Ionicons name="create-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.profileSection, { backgroundColor: colors.surface }]}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarWrapper}>
            {profile.avatarUrl ? (
              <Image 
                source={{ uri: profile.avatarUrl }}
                style={[styles.avatar, { borderColor: colors.surface }]}
              />
            ) : (
              <Ionicons name="person-circle" size={80} color={colors.text} />
            )}
            <TouchableOpacity 
              style={[styles.editAvatarButton, { borderColor: colors.surface }]}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Ionicons name="pencil" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.userName, { color: colors.text }]}>{profile.name}</Text>
        {profile.nickname && (
          <Text style={[styles.userNickname, { color: colors.subtext }]}>@{profile.nickname}</Text>
        )}
        <Text style={[styles.userEmail, { color: colors.subtext }]}>{profile.email}</Text>

        <TouchableOpacity 
          style={[styles.editProfileButton, { backgroundColor: theme === 'dark' ? '#404040' : '#f0f0f0' }]}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Ionicons name="create-outline" size={20} color={colors.primary} />
          <Text style={[styles.editProfileText, { color: colors.primary }]}>Editar Perfil</Text>
        </TouchableOpacity>

        <View style={styles.userInfoContainer}>
          {profile.birthYear && (
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={20} color={colors.subtext} />
              <Text style={[styles.infoText, { color: colors.subtext }]}>{profile.birthYear}</Text>
            </View>
          )}
          {profile.phone && (
            <View style={styles.infoItem}>
              <Ionicons name="call-outline" size={20} color={colors.subtext} />
              <Text style={[styles.infoText, { color: colors.subtext }]}>{profile.phone}</Text>
            </View>
          )}
          {profile.instagram && (
            <TouchableOpacity 
              style={styles.infoItem}
              onPress={handleInstagramPress}
            >
              <Ionicons name="logo-instagram" size={20} color={colors.subtext} />
              <Text style={[styles.infoText, styles.instagramText, { color: colors.primary }]}>
                {profile.instagram}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={[styles.menuContainer, { backgroundColor: colors.surface }]}>
        <FlatList
          data={menuItems}
          keyExtractor={(item) => item.title}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.menuItem, { backgroundColor: colors.surface }]}
              onPress={() => handleMenuItemPress(item.title)}
            >
              <View style={styles.menuItemContent}>
                <Ionicons name={item.icon} size={24} color={colors.text} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  {item.title}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.text} />
            </TouchableOpacity>
          )}
        />

        <TouchableOpacity 
          style={[
            styles.menuItem, 
            styles.logoutButton, 
            { 
              borderTopColor: colors.border,
              borderBottomColor: colors.border 
            }
          ]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color={colors.error} />
          <Text style={[styles.menuItemText, styles.logoutText, { color: colors.error }]}>
            Cerrar sesión
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
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  editButton: {
    padding: 8,
  },
  profileSection: {
    alignItems: 'center',
    padding: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userNickname: {
    fontSize: 16,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 16,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  editProfileText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  userInfoContainer: {
    width: '100%',
    paddingHorizontal: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 8,
  },
  instagramText: {
    color: '#007AFF',
  },
  menuContainer: {
    marginTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
  },
  logoutButton: {
    marginTop: 16,
    borderTopWidth: 1,
  },
  logoutText: {
    color: '#FF3B30',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 