/**
 * MusicList Component
 * Displays available music tracks and manages track selection
 * References local audio files from assets/music/
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export interface MusicTrack {
  id: string;
  title: string;
  asset: any; // require() returns 'any' type
}

// Music track list - references local files
// NOTE: Add focus1.mp3 and focus2.mp3 to assets/music/ directory
const musicTracks: MusicTrack[] = [
  {
    id: 'focus1',
    title: 'Focus Track 1',
    asset: require('../../assets/music/focus1.mp3'),
  },
  {
    id: 'focus2',
    title: 'Focus Track 2',
    asset: require('../../assets/music/focus2.mp3'),
  },
];

/**
 * Helper function to get track asset by ID
 */
export function getTrackAssetById(trackId: string): any {
  const track = musicTracks.find(t => t.id === trackId);
  return track ? track.asset : null;
}

interface MusicListProps {
  selectedTrackId: string | null;
  onSelectTrack: (trackId: string) => void;
}

export default function MusicList({ selectedTrackId, onSelectTrack }: MusicListProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Music Track:</Text>
      {musicTracks.map((track) => (
        <TouchableOpacity
          key={track.id}
          style={[
            styles.trackButton,
            selectedTrackId === track.id && styles.trackButtonSelected,
          ]}
          onPress={() => onSelectTrack(track.id)}
        >
          <Text
            style={[
              styles.trackText,
              selectedTrackId === track.id && styles.trackTextSelected,
            ]}
          >
            {track.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  trackButton: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  trackButtonSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  trackText: {
    fontSize: 14,
    color: '#666',
  },
  trackTextSelected: {
    color: '#2196f3',
    fontWeight: '600',
  },
});
