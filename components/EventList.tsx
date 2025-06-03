import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Event } from '../types/event';
import { EventCard } from './EventCard';

interface EventListProps {
  events: Event[];
  onEventPress: (event: Event) => void;
  title: string;
}

export const EventList: React.FC<EventListProps> = ({ events, onEventPress, title }) => {
  const { colors } = useTheme();

  if (events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.subtext }]}>
          No hay eventos disponibles
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <FlatList
        data={events}
        renderItem={({ item }) => (
          <EventCard event={item} onPress={onEventPress} />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  contentContainer: {
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
}); 