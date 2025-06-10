import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Session } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';
import { 
  FlatList, 
  RefreshControl, 
  SafeAreaView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  Image,
  Dimensions,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../App';
// import { EventCarousel } from '../../components/EventCarousel';
import { EventList } from '../../components/EventList';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { Event } from '../../types/event';

const { width } = Dimensions.get('window');

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

type SectionType = {
  type: 'banner' | 'carousel' | 'list' | 'categories';
  data?: Event[];
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [nextMonthEvents, setNextMonthEvents] = useState<Event[]>([]);
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { theme, toggleTheme, colors } = useTheme();

  useEffect(() => {
    fetchEvents();
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
  };

  const fetchEvents = async () => {
    try {
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .gte('date', today.toISOString().split('T')[0])
        .lte('date', thirtyDaysFromNow.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(today.getDate() + 7);

      const upcoming = events?.filter((event: Event) => 
        new Date(event.date) <= sevenDaysFromNow
      ) || [];
      const nextMonth = events?.filter((event: Event) => 
        new Date(event.date) > sevenDaysFromNow
      ) || [];

      setUpcomingEvents(upcoming);
      setNextMonthEvents(nextMonth);
      
      // Establecer evento destacado (el más próximo o uno específico)
      if (upcoming.length > 0) {
        setFeaturedEvent(upcoming[0]);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching events:', error.message);
      } else {
        console.error('Error desconocido al obtener eventos');
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  const handleEventPress = (event: Event) => {
    navigation.navigate('EventDetail', { event });
  };

  const handleAccountPress = () => {
    if (session) {
      navigation.navigate('Profile');
    } else {
      navigation.navigate('Auth');
    }
  };

  const renderPromoBanner = () => (
    <View style={styles.bannerContainer}>
      <LinearGradient
        colors={theme === 'dark' ? ['#1a1a2e', '#16213e'] : ['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.promoBanner}
      >
        <View style={styles.bannerContent}>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>🎉 ¡Evento Especial!</Text>
            <Text style={styles.bannerSubtitle}>
              {featuredEvent ? featuredEvent.title : 'Descubre eventos increíbles'}
            </Text>
            <TouchableOpacity 
              style={styles.bannerButton}
              onPress={() => featuredEvent && handleEventPress(featuredEvent)}
            >
              <Text style={styles.bannerButtonText}>Ver Detalles</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.bannerIconContainer}>
            <Ionicons name="star" size={40} color="#FFD700" />
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Categorías</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
        {[
          { name: 'Música', icon: 'musical-notes', color: '#FF6B6B' },
          { name: 'Deportes', icon: 'football', color: '#4ECDC4' },
          { name: 'Arte', icon: 'brush', color: '#45B7D1' },
          { name: 'Comida', icon: 'restaurant', color: '#96CEB4' },
          { name: 'Tecnología', icon: 'laptop', color: '#FFEAA7' },
          { name: 'Cultura', icon: 'library', color: '#DDA0DD' },
        ].map((category, index) => (
          <TouchableOpacity key={index} style={[styles.categoryCard, { backgroundColor: category.color }]}>
            <Ionicons name={category.icon as any} size={24} color="#fff" />
            <Text style={styles.categoryText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderStatsCard = () => (
    <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: colors.primary }]}>{upcomingEvents.length}</Text>
        <Text style={[styles.statLabel, { color: colors.subtext }]}>Esta semana</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: colors.primary }]}>{nextMonthEvents.length}</Text>
        <Text style={[styles.statLabel, { color: colors.subtext }]}>Este mes</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: colors.primary }]}>12</Text>
        <Text style={[styles.statLabel, { color: colors.subtext }]}>Favoritos</Text>
      </View>
    </View>
  );

  const sections: SectionType[] = [
    { type: 'banner' },
    { type: 'categories' },
    { type: 'carousel', data: upcomingEvents },
    { type: 'list', data: nextMonthEvents }
  ];

  const renderItem = ({ item }: { item: SectionType }) => {
    switch (item.type) {
      case 'banner':
        return (
          <View>
            {renderPromoBanner()}
            {renderStatsCard()}
          </View>
        );
      case 'categories':
        return renderCategories();
      case 'carousel':
        return item.data && item.data.length > 0 ? (
          <View style={styles.sectionContainer}>
          <EventList 
            title="Eventos Próximos"
            events={item.data}
            onEventPress={handleEventPress}
          />
        </View>
        ) : null;
      case 'list':
        return item.data && item.data.length > 0 ? (
          <View style={styles.sectionContainer}>
            <EventList 
              title="Más Eventos"
              events={item.data}
              onEventPress={handleEventPress}
            />
          </View>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header mejorado */}
      <LinearGradient
        colors={theme === 'dark' ? ['#2C3E50', '#34495E'] : ['#E5F3FF', '#F8FBFF']}
        style={styles.header}
      >
        <TouchableOpacity 
          onPress={toggleTheme}
          style={styles.themeButton}
        >
          <Ionicons 
            name={theme === 'dark' ? 'sunny' : 'moon'} 
            size={24} 
            color={theme === 'dark' ? '#F39C12' : '#333'}
          />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <View style={styles.logoContainer}>
            <Ionicons name="calendar" size={28} color="#667eea" />
          </View>
          <View>
            <Text style={[styles.title, { color: theme === 'dark' ? '#fff' : '#333' }]}>
              Evente-Ar
            </Text>
            <Text style={[styles.subtitle, { color: theme === 'dark' ? '#BDC3C7' : '#666' }]}>
              Descubre eventos increíbles
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          onPress={handleAccountPress} 
          style={[styles.profileButton, { backgroundColor: session ? '#27AE60' : '#E74C3C' }]}
        >
          <Ionicons 
            name={session ? "person" : "person-add"} 
            size={20} 
            color="#fff"
          />
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        data={sections}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.type + index}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

      {/* Footer mejorado */}
      <LinearGradient
        colors={theme === 'dark' ? ['#2C3E50', '#34495E'] : ['#fff', '#f8f9fa']}
        style={styles.footer}
      >
        <TouchableOpacity 
          style={styles.footerButton}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="search" size={24} color={colors.subtext} />
          <Text style={[styles.footerButtonText, { color: colors.subtext }]}>Buscar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.footerButton, styles.footerButtonActive]}
        >
          <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />
          <Ionicons name="home" size={24} color={colors.primary} />
          <Text style={[styles.footerButtonText, { color: colors.primary }]}>Inicio</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.footerButton}>
          <Ionicons name="compass" size={24} color={colors.subtext} />
          <Text style={[styles.footerButtonText, { color: colors.subtext }]}>Explorar</Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 48,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  themeButton: {
    padding: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 16,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  bannerContainer: {
    margin: 16,
    marginBottom: 8,
  },
  promoBanner: {
    borderRadius: 16,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginRight: 8,
  },
  bannerIconContainer: {
    marginLeft: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  categoriesContainer: {
    marginVertical: 8,
  },
  categoriesScroll: {
    paddingLeft: 16,
  },
  categoryCard: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  categoryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  sectionContainer: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingBottom: 32,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  footerButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    position: 'relative',
  },
  footerButtonActive: {
    transform: [{ scale: 1.1 }],
  },
  footerButtonText: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
  activeIndicator: {
    position: 'absolute',
    top: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});