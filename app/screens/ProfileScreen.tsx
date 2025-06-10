import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  EditProfile: undefined;
  CreateEvent: undefined;
  MyEvents: undefined;
  Favorites: undefined;
  Notifications: undefined;
  Settings: undefined;
};

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'>;
};

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  color?: string;
  badge?: number;
};

type UserProfile = {
  name: string;
  email: string;
  phone: string;
  nickname: string;
  birthYear: string;
  instagram: string;
  avatarUrl: string | null;
  role: string;
  bio?: string;
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme, colors, toggleTheme } = useTheme();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
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
        role: user.user_metadata.role || 'user',
        bio: user.user_metadata.bio || 'Amante de los eventos y experiencias únicas. ¡Siempre buscando nuevas aventuras!'
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'No se pudo cargar el perfil');
      navigation.goBack();
    } finally {
      setLoading(false);
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
            navigation.navigate('Home');
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
        navigation.navigate('Settings');
        break;
      case 'Favoritos':
        navigation.navigate('Favorites');
        break;
      case 'Mis Eventos':
        navigation.navigate('MyEvents');
        break;
      case 'Notificaciones':
        navigation.navigate('Notifications');
        break;
      case 'Crear Evento':
        navigation.navigate('CreateEvent');
        break;
      case 'Modo Oscuro':
        toggleTheme();
        break;
    }
  };

  const menuItems: MenuItem[] = [
    { icon: 'calendar-outline', title: 'Mis Eventos', color: '#FF6B6B', badge: 2 },
    { icon: 'heart-outline', title: 'Favoritos', color: '#FF8E72', badge: 5 },
    { icon: 'notifications-outline', title: 'Notificaciones', color: '#4ECDC4', badge: 3 },
    { icon: 'add-circle-outline', title: 'Crear Evento', color: '#45B7D1' },
    { icon: 'settings-outline', title: 'Preferencias', color: '#96CEB4' },
    { icon: theme === 'dark' ? 'sunny-outline' : 'moon-outline', title: 'Modo Oscuro', color: '#FFCC5C' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Cargando perfil...</Text>
      </SafeAreaView>
    );
  }

  if (!profile) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
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
            
            <Text style={styles.headerTitle}>Mi Perfil</Text>
            
            <TouchableOpacity 
              onPress={() => navigation.navigate('EditProfile')}
              style={[styles.headerButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
            >
              <Ionicons name="create-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Tarjeta de perfil */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              {profile.avatarUrl ? (
                <Image 
                  source={{ uri: profile.avatarUrl }}
                  style={styles.avatar}
                />
              ) : (
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.avatarPlaceholder}
                >
                  <Text style={styles.avatarInitial}>
                    {profile.name.charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
              )}
              <TouchableOpacity 
                style={styles.editAvatarButton}
                onPress={() => navigation.navigate('EditProfile')}
              >
                <Ionicons name="camera" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>{profile.name}</Text>
              {profile.nickname && (
                <Text style={[styles.userNickname, { color: colors.subtext }]}>@{profile.nickname}</Text>
              )}
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{profile.role === 'admin' ? 'Administrador' : 'Usuario'}</Text>
              </View>
            </View>
          </View>

          {/* Bio */}
          {profile.bio && (
            <View style={styles.bioContainer}>
              <Text style={[styles.bioText, { color: colors.text }]}>
                {profile.bio}
              </Text>
            </View>
          )}

          {/* Estadísticas */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>12</Text>
              <Text style={[styles.statLabel, { color: colors.subtext }]}>Eventos</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>48</Text>
              <Text style={[styles.statLabel, { color: colors.subtext }]}>Seguidores</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>156</Text>
              <Text style={[styles.statLabel, { color: colors.subtext }]}>Siguiendo</Text>
            </View>
          </View>

          {/* Información de contacto */}
          <View style={styles.contactContainer}>
            <View style={styles.contactItem}>
              <View style={[styles.contactIconContainer, { backgroundColor: '#4ECDC4' + '20' }]}>
                <Ionicons name="mail-outline" size={20} color="#4ECDC4" />
              </View>
              <Text style={[styles.contactText, { color: colors.text }]}>{profile.email}</Text>
            </View>
            
            {profile.phone && (
              <View style={styles.contactItem}>
                <View style={[styles.contactIconContainer, { backgroundColor: '#FF6B6B' + '20' }]}>
                  <Ionicons name="call-outline" size={20} color="#FF6B6B" />
                </View>
                <Text style={[styles.contactText, { color: colors.text }]}>{profile.phone}</Text>
              </View>
            )}
            
            {profile.instagram && (
              <TouchableOpacity 
                style={styles.contactItem}
                onPress={handleInstagramPress}
              >
                <View style={[styles.contactIconContainer, { backgroundColor: '#E1306C' + '20' }]}>
                  <Ionicons name="logo-instagram" size={20} color="#E1306C" />
                </View>
                <Text style={[styles.contactText, { color: '#E1306C' }]}>
                  {profile.instagram}
                </Text>
              </TouchableOpacity>
            )}
            
            {profile.birthYear && (
              <View style={styles.contactItem}>
                <View style={[styles.contactIconContainer, { backgroundColor: '#FFCC5C' + '20' }]}>
                  <Ionicons name="calendar-outline" size={20} color="#FFCC5C" />
                </View>
                <Text style={[styles.contactText, { color: colors.text }]}>{profile.birthYear}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Menú de opciones */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Opciones</Text>
          
          <View style={[styles.menuContainer, { backgroundColor: colors.surface }]}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.title}
                style={[
                  styles.menuItem, 
                  { 
                    backgroundColor: colors.surface,
                    borderBottomWidth: index === menuItems.length - 1 ? 0 : 1,
                    borderBottomColor: colors.border
                  }
                ]}
                onPress={() => handleMenuItemPress(item.title)}
              >
                <View style={styles.menuItemContent}>
                  <View style={[styles.menuIconContainer, { backgroundColor: item.color + '20' }]}>
                    <Ionicons name={item.icon} size={22} color={item.color} />
                  </View>
                  <Text style={[styles.menuItemText, { color: colors.text }]}>
                    {item.title}
                  </Text>
                </View>
                
                <View style={styles.menuItemRight}>
                  {item.badge && (
                    <View style={[styles.badgeContainer, { backgroundColor: item.color }]}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={22} color={colors.subtext} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Botón de cerrar sesión */}
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: colors.surface }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>
            Cerrar sesión
          </Text>
        </TouchableOpacity>

        {/* Versión de la app */}
        <Text style={[styles.versionText, { color: colors.subtext }]}>
          Evente-Ar v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileCard: {
    marginTop: -20,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#667eea',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userNickname: {
    fontSize: 16,
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  bioContainer: {
    marginTop: 20,
    marginBottom: 16,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: '80%',
    alignSelf: 'center',
  },
  contactContainer: {
    marginBottom: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactText: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 24,
  },
  menuContainer: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeContainer: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    paddingHorizontal: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  menuSection: {
    marginBottom: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 30,
  },
});