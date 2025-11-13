/**
 * Home Screen
 * Allows user to select session duration and music track
 * Displays premium status and provides authentication controls
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import MusicList from '../components/MusicList';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Session: {
    duration: number;
    trackId: string;
  };
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const DURATION_OPTIONS = [30, 60, 90, 120]; // minutes

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user, userData, signOut } = useAuth();
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>('focus1');

  const handleStart = () => {
    if (!selectedTrackId) {
      Alert.alert('Error', 'Please select a music track');
      return;
    }

    navigation.navigate('Session', {
      duration: selectedDuration,
      trackId: selectedTrackId,
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign out');
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Please log in to continue</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Lock-in Beat</Text>

        {/* Premium Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Account Status:</Text>
          <Text
            style={[
              styles.statusValue,
              userData?.isPremium ? styles.premiumText : styles.freeText,
            ]}
          >
            {userData?.isPremium ? '✨ Premium' : '🆓 Free'}
          </Text>
        </View>

        {!userData?.isPremium && (
          <Text style={styles.warningText}>
            ⚠️ Free users: Leaving the app during a session will trigger a 10-second
            grace period. If you don't return, the session will fail.
          </Text>
        )}

        {/* Duration Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Select Duration:</Text>
          <View style={styles.durationContainer}>
            {DURATION_OPTIONS.map((duration) => (
              <TouchableOpacity
                key={duration}
                style={[
                  styles.durationButton,
                  selectedDuration === duration && styles.durationButtonSelected,
                ]}
                onPress={() => setSelectedDuration(duration)}
              >
                <Text
                  style={[
                    styles.durationText,
                    selectedDuration === duration && styles.durationTextSelected,
                  ]}
                >
                  {duration} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Music Selection */}
        <MusicList
          selectedTrackId={selectedTrackId}
          onSelectTrack={setSelectedTrackId}
        />

        {/* Start Button */}
        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startButtonText}>Start Session</Text>
        </TouchableOpacity>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.userEmail}>{user.email}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2196f3',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 16,
    marginRight: 10,
    color: '#666',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  premiumText: {
    color: '#4caf50',
  },
  freeText: {
    color: '#ff9800',
  },
  warningText: {
    fontSize: 12,
    color: '#ff9800',
    textAlign: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff3e0',
    borderRadius: 8,
  },
  section: {
    marginVertical: 15,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  durationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  durationButton: {
    flex: 1,
    minWidth: '45%',
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  durationButtonSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  durationText: {
    fontSize: 14,
    color: '#666',
  },
  durationTextSelected: {
    color: '#2196f3',
    fontWeight: '600',
  },
  startButton: {
    height: 60,
    backgroundColor: '#4caf50',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signOutButton: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  signOutButtonText: {
    color: '#666',
    fontSize: 16,
  },
  userEmail: {
    textAlign: 'center',
    marginTop: 15,
    color: '#999',
    fontSize: 12,
  },
});
