import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { CalendarEvent } from '../../types';

interface EventCardProps {
  event: CalendarEvent;
}

const EventCard = ({ event }: EventCardProps) => {
  const { colors, typography, spacing, radius } = useTheme();

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card style={styles.card}>
      <View style={styles.container}>
        <View style={styles.left}>
          <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>
            {formatTime(event.startTime)}
          </Text>
          <Text style={[typography.bodySmall, { color: colors.textTertiary }]}>
            {formatTime(event.endTime)}
          </Text>
        </View>
        <View style={styles.main}>
          <View style={styles.header}>
            <Text style={[typography.h4, { color: colors.textPrimary }]} numberOfLines={1}>
              {event.title}
            </Text>
            {event.hasConflict && <View style={[styles.conflictDot, { backgroundColor: '#FF4444' }]} />}
          </View>
          <View style={styles.footer}>
            <Badge label={event.type} type={event.type} />
            {event.location && (
              <Text style={[typography.bodySmall, { color: colors.textTertiary, marginLeft: 8 }]} numberOfLines={1}>
                • {event.location}
              </Text>
            )}
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  left: {
    width: 60,
    marginRight: 16,
    gap: 4,
  },
  main: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  conflictDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default EventCard;
