import React from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
import { Event } from '../types/event';
import { EventCard } from './EventCard';

interface EventCarouselProps {
  events: Event[];
  onEventPress: (event: Event) => void;
}

const { width } = Dimensions.get('window');

export const EventCarousel: React.FC<EventCarouselProps> = ({ events, onEventPress }) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        renderItem={({ item }) => (
          <EventCard event={item} onPress={onEventPress} />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        snapToInterval={width - 32}
        decelerationRate="fast"
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 280,
    marginVertical: 16,
  },
  contentContainer: {
    paddingHorizontal: 8,
  },
}); 