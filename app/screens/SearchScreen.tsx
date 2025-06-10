import { RootStackParamList } from '@/App';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { EventList } from '../../components/EventList';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { Event } from '../../types/event';
type SearchScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Search'>;
  };
  

const SearchScreen = ({ navigation }: SearchScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Event[]>([]);
  const { colors } = useTheme();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .ilike('title', `%${searchQuery}%`);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching events:', error);
    }
  };

  const handleEventPress = (event: Event) => {
    navigation.navigate('EventDetail', { event });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.surface, color: colors.text }]}
          placeholder="Buscar eventos..."
          placeholderTextColor={colors.subtext}
          value={searchQuery}
          onChangeText={(e) => {
            setSearchQuery(e)
            handleSearch()
          }}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Ionicons name="search" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {searchResults.length > 0 ? (
        <EventList
          title="Resultados"
          events={searchResults}
          onEventPress={handleEventPress}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.subtext }]}>
            {searchQuery ? 'No se encontraron resultados' : 'Busca eventos por título'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 20,
    marginRight: 8,
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});

export default SearchScreen;