import { RootStackParamList } from '@/App';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { eventServices } from '../../lib/services';
import { Event } from '../../types/event';

const { width } = Dimensions.get('window');

type FavoritesScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Favorites'>;
};

type Category = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

const FavoritesScreen = ({ navigation }: FavoritesScreenProps) => {
  const { colors, theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const searchOpacity = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadFavoriteEvents();
  }, []);

  const loadFavoriteEvents = async () => {
    try {
      setLoading(true);
      const events = await eventServices.getFavoriteEvents();
      setFavoriteEvents(events);
    } catch (error) {
      console.error('Error cargando eventos favoritos:', error);
      Alert.alert('Error', 'No se pudieron cargar los eventos favoritos');
    } finally {
      setLoading(false);
    }
  };

  const categories: Category[] = [
    { id: 'all', name: 'Todos', icon: 'grid-outline', color: '#667eea' },
    { id: 'music', name: 'Música', icon: 'musical-notes-outline', color: '#FF6B6B' },
    { id: 'food', name: 'Gastronomía', icon: 'restaurant-outline', color: '#96CEB4' },
    { id: 'art', name: 'Arte', icon: 'brush-outline', color: '#45B7D1' },
    { id: 'sports', name: 'Deportes', icon: 'football-outline', color: '#4ECDC4' },
    { id: 'tech', name: 'Tecnología', icon: 'laptop-outline', color: '#FFCC5C' }
  ];

  const toggleSearch = () => {
    if (showSearch) {
      Animated.timing(searchOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start(() => {
        setShowSearch(false);
        setSearchQuery('');
      });
    } else {
      setShowSearch(true);
      Animated.timing(searchOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavoriteEvents();
    setRefreshing(false);
  };

  const handleEventPress = (event: Event) => {
    navigation.navigate('EventDetail', { event });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleRemoveFavorite = (event: Event) => {
    Alert.alert(
      'Eliminar de favoritos',
      `¿Estás seguro de que deseas eliminar "${event.title}" de tus favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => console.log('Eliminar de favoritos:', event.id) 
        }
      ]
    );
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId === 'all' ? null : categoryId);
  };

  const getFilteredEvents = () => {
    let filtered = favoriteEvents;
    
    // Filtrar por categoría
    // if (selectedCategory) {
    //   filtered = filtered.filter(event => event.category === selectedCategory);
    // }
    
    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        event => 
          event.title.toLowerCase().includes(query) || 
          event.location.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  const filteredEvents = getFilteredEvents();

  const renderEventCard = ({ item }: { item: Event }) => {
    const eventDate = new Date(item.date);
    const today = new Date();
    const isPast = eventDate < today;
    
    // const category = categories.find(cat => cat.id === item.category) || categories[0];
    
    return (
      <TouchableOpacity
        style={[styles.eventCard, { backgroundColor: colors.surface }]}
        onPress={() => handleEventPress(item)}
        activeOpacity={0.9}
      >
        <View style={styles.eventImageContainer}>
          <Image 
            source={{ uri: item.image_url || 'https://via.placeholder.com/400x200' }} 
            style={styles.eventImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageOverlay}
          />
          {/* <View style={[styles.categoryBadge, { backgroundColor: category.color }]}>
            <Ionicons name={category.icon} size={12} color="#fff" />
            <Text style={styles.categoryText}>{category.name}</Text>
          </View> */}
          
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={() => handleRemoveFavorite(item)}
          >
            <Ionicons name="heart" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.eventContent}>
          <Text 
            style={[styles.eventTitle, { color: colors.text }]} 
            numberOfLines={1}
          >
            {item.title}
          </Text>
          
          <View style={styles.eventDetails}>
            <View style={styles.eventDetailRow}>
              <Ionicons name="calendar-outline" size={14} color={colors.primary} />
              <Text style={[styles.eventDetailText, { color: colors.subtext }]}>
                {new Date(item.date).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </Text>
            </View>
            
            <View style={styles.eventDetailRow}>
              <Ionicons name="time-outline" size={14} color={colors.primary} />
              <Text style={[styles.eventDetailText, { color: colors.subtext }]}>
                {item.time}
              </Text>
            </View>
            
            <View style={styles.eventDetailRow}>
              <Ionicons name="location-outline" size={14} color={colors.primary} />
              <Text 
                style={[styles.eventDetailText, { color: colors.subtext }]}
                numberOfLines={1}
              >
                {item.location}
              </Text>
            </View>
          </View>
          
          <View style={styles.eventFooter}>
            <Text style={[
              styles.eventPrice, 
              { color: item.ticket_price === 0 ? '#27AE60' : colors.text }
            ]}>
              {item.ticket_price === 0 ? 'Gratis' : `$${item.ticket_price}`}
            </Text>
            
            <View style={[
              styles.eventStatus, 
              { 
                backgroundColor: isPast ? '#95A5A6' : '#27AE60',
                opacity: isPast ? 0.7 : 1
              }
            ]}>
              <Text style={styles.eventStatusText}>
                {isPast ? 'Finalizado' : 'Próximo'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
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
            onPress={handleBackPress} 
            style={[styles.headerButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Mis Favoritos</Text>
            <Text style={styles.headerSubtitle}>
              {loading ? 'Cargando...' : `${favoriteEvents.length} eventos guardados`}
            </Text>
          </View>
          
          <TouchableOpacity 
            onPress={toggleSearch}
            style={[styles.headerButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
          >
            <Ionicons name={showSearch ? "close" : "search"} size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {/* Barra de búsqueda animada */}
        {showSearch && (
          <Animated.View 
            style={[
              styles.searchContainer, 
              { opacity: searchOpacity, transform: [{ translateY: searchOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0]
              }) }] }
            ]}
          >
            <View style={[styles.searchInputContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name="search" size={20} color="rgba(255,255,255,0.8)" />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar eventos..."
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                returnKeyType="search"
                selectionColor="#fff"
                clearButtonMode="while-editing"
              />
            </View>
          </Animated.View>
        )}
      </LinearGradient>

      {loading ? (
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Cargando favoritos...</Text>
        </View>
      ) : (
        <>
          {/* Categorías */}
          <View style={[styles.categoriesContainer, { backgroundColor: colors.surface }]}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScrollContent}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.id && { backgroundColor: category.color },
                    selectedCategory === null && category.id === 'all' && { backgroundColor: category.color }
                  ]}
                  onPress={() => handleCategorySelect(category.id)}
                >
                  <Ionicons 
                    name={category.icon} 
                    size={18} 
                    color={(selectedCategory === category.id || (selectedCategory === null && category.id === 'all')) 
                      ? '#fff' 
                      : category.color} 
                  />
                  <Text 
                    style={[
                      styles.categoryButtonText,
                      { color: (selectedCategory === category.id || (selectedCategory === null && category.id === 'all')) 
                        ? '#fff' 
                        : colors.text }
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Lista de eventos */}
          {filteredEvents.length > 0 ? (
            <FlatList
              data={filteredEvents}
              renderItem={renderEventCard}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.eventsList}
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
          ) : (
            <ScrollView 
              contentContainerStyle={styles.emptyContainer}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                />
              }
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.emptyIcon}
              >
                <Ionicons name="heart-outline" size={40} color="#fff" />
              </LinearGradient>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {searchQuery 
                  ? 'No se encontraron resultados' 
                  : selectedCategory 
                    ? 'No hay favoritos en esta categoría' 
                    : 'No tienes favoritos guardados'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.subtext }]}>
                {searchQuery 
                  ? 'Intenta con otra búsqueda o cambia los filtros' 
                  : 'Guarda eventos que te interesen para acceder rápidamente a ellos'}
              </Text>
              <TouchableOpacity
                style={[styles.exploreButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('Home')}
              >
                <Ionicons name="search-outline" size={20} color="#fff" />
                <Text style={styles.exploreButtonText}>Explorar Eventos</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </>
      )}
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
  searchContainer: {
    marginTop: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#fff',
  },
  categoriesContainer: {
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  eventsList: {
    padding: 16,
    paddingBottom: 32,
  },
  eventCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventImageContainer: {
    height: 150,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  categoryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventDetails: {
    marginBottom: 12,
    gap: 6,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventDetailText: {
    fontSize: 14,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventStatusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
  },
});

export default FavoritesScreen;