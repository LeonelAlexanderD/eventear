import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Session } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../../App';
import { EventCarousel } from '../../components/EventCarousel';
import { EventList } from '../../components/EventList';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { Event } from '../../types/event';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

type SectionType = {
  type: 'carousel' | 'list';
  data: Event[];
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [nextMonthEvents, setNextMonthEvents] = useState<Event[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { theme, toggleTheme, colors } = useTheme();

  useEffect(() => {
    fetchEvents();
    checkSession();

    // Suscribirse a cambios en la sesión
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

      // Separar eventos próximos (próximos 7 días) y eventos del mes
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

  const sections: SectionType[] = [
    { type: 'carousel', data: upcomingEvents },
    { type: 'list', data: nextMonthEvents }
  ];

  const renderItem = ({ item }: { item: SectionType }) => {
    if (item.type === 'carousel') {
      return (
        <EventCarousel 
          events={item.data} 
          onEventPress={handleEventPress} 
        />
      );
    } else {
      return (
        <EventList 
          title="Próximos eventos"
          events={item.data}
          onEventPress={handleEventPress}
        />
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: '#E5F3FF' }]}>
        <TouchableOpacity 
          onPress={toggleTheme}
          style={styles.themeButton}
        >
          <Ionicons 
            name={theme === 'dark' ? 'sunny' : 'moon'} 
            size={24} 
            color="#333"
          />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Ionicons name="calendar" size={24} color="#333" />
          <Text style={[styles.title, { color: '#333' }]}>Evente-Ar</Text>
        </View>
        <TouchableOpacity 
          onPress={handleAccountPress} 
          style={styles.profileButton}
        >
          <Ionicons 
            name={session ? "person-circle-outline" : "person-circle"} 
            size={28} 
            color="#333"
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sections}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.type + index}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity style={styles.footerButton}>
          <Ionicons name="search" size={24} color={colors.subtext} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.footerButton, 
            styles.footerButtonActive,
            { backgroundColor: theme === 'dark' ? '#404040' : '#f0f0f0' }
          ]}
        >
          <Ionicons name="home" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Ionicons name="compass" size={24} color={colors.subtext} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  themeButton: {
    padding: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  profileButton: {
    padding: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  footerButton: {
    padding: 12,
  },
  footerButtonActive: {
    borderRadius: 24,
    padding: 16,
  },
}); 