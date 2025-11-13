/**
 * Session Screen
 * Manages focus session with countdown timer and background audio playback
 * Implements penalty mechanism for free users when app goes to background
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  AppState,
  AppStateStatus,
} from 'react-native';
import { Audio } from 'expo-av';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { getTrackAssetById } from '../components/MusicList';

type RootStackParamList = {
  Home: undefined;
  Session: {
    duration: number;
    trackId: string;
  };
};

type SessionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Session'>;
type SessionScreenRouteProp = RouteProp<RootStackParamList, 'Session'>;

interface SessionScreenProps {
  navigation: SessionScreenNavigationProp;
  route: SessionScreenRouteProp;
}

const GRACE_PERIOD_SECONDS = 10;

export default function SessionScreen({ navigation, route }: SessionScreenProps) {
  const { duration, trackId } = route.params;
  const { userData } = useAuth();
  const isPremium = userData?.isPremium ?? false;

  const [timeRemaining, setTimeRemaining] = useState(duration * 60); // convert to seconds
  const [isPlaying, setIsPlaying] = useState(true);
  const [graceTimeRemaining, setGraceTimeRemaining] = useState<number | null>(null);

  const soundRef = useRef<Audio.Sound | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const graceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundTimeRef = useRef<number | null>(null);

  // Initialize audio and start playback
  useEffect(() => {
    initializeAudio();
    startTimer();

    return () => {
      cleanup();
    };
  }, []);

  // Monitor app state for background detection
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isPremium, timeRemaining]);

  const initializeAudio = async () => {
    try {
      // Configure audio mode for background playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const trackAsset = getTrackAssetById(trackId);
      if (!trackAsset) {
        Alert.alert('Error', 'Music track not found');
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        trackAsset,
        { shouldPlay: true, isLooping: true }
      );

      soundRef.current = sound;
    } catch (error) {
      console.error('Error initializing audio:', error);
      Alert.alert('Error', 'Failed to load music track');
    }
  };

  const startTimer = () => {
    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSessionComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      // App went to background
      handleAppBackground();
    } else if (nextAppState === 'active') {
      // App came back to foreground
      handleAppForeground();
    }
  };

  const handleAppBackground = () => {
    if (!isPremium) {
      // Start grace period for free users
      backgroundTimeRef.current = Date.now();
      setGraceTimeRemaining(GRACE_PERIOD_SECONDS);

      graceTimerRef.current = setInterval(() => {
        setGraceTimeRemaining((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            // Grace period expired
            handleGracePeriodExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    // Premium users: do nothing, session continues
  };

  const handleAppForeground = () => {
    if (!isPremium && graceTimerRef.current) {
      // User returned within grace period
      clearGraceTimer();
      setGraceTimeRemaining(null);
      backgroundTimeRef.current = null;
    }
  };

  const handleGracePeriodExpired = () => {
    // Session failed - user didn't return in time
    clearGraceTimer();
    stopSession(false);
  };

  const clearGraceTimer = () => {
    if (graceTimerRef.current) {
      clearInterval(graceTimerRef.current);
      graceTimerRef.current = null;
    }
  };

  const handleSessionComplete = () => {
    stopSession(true);
  };

  const stopSession = async (success: boolean) => {
    // Clear all timers
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    clearGraceTimer();

    // Stop audio
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    // Show result and navigate back
    if (success) {
      Alert.alert(
        '🎉 Session Complete!',
        'Congratulations! You completed your focus session.',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } else {
      Alert.alert(
        '❌ Session Failed',
        'You left the app for too long. Session has been terminated.',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    }
  };

  const cleanup = async () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    clearGraceTimer();
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (error) {
        console.error('Error cleaning up audio:', error);
      }
    }
  };

  const handleSkip = () => {
    if (!isPremium) {
      Alert.alert(
        'Premium Feature',
        'Skipping is only available for premium users. Upgrade to unlock!'
      );
      return;
    }
    Alert.alert(
      'Skip Session',
      'Are you sure you want to end this session early?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip', onPress: () => stopSession(true) },
      ]
    );
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Focus Session</Text>

      {/* Premium Status Indicator */}
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>
          {isPremium ? '✨ Premium' : '🆓 Free'}
        </Text>
      </View>

      {/* Timer Display */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
      </View>

      {/* Grace Period Warning */}
      {graceTimeRemaining !== null && graceTimeRemaining > 0 && (
        <View style={styles.graceWarning}>
          <Text style={styles.graceWarningText}>
            ⚠️ Grace Period: {graceTimeRemaining}s
          </Text>
          <Text style={styles.graceWarningSubtext}>
            Return to the app or session will fail!
          </Text>
        </View>
      )}

      {/* Audio Status */}
      <Text style={styles.audioStatus}>
        {isPlaying ? '🎵 Music Playing' : '⏸️ Paused'}
      </Text>

      {/* Skip Button (disabled for free users) */}
      <TouchableOpacity
        style={[styles.skipButton, !isPremium && styles.skipButtonDisabled]}
        onPress={handleSkip}
      >
        <Text style={styles.skipButtonText}>
          {isPremium ? 'Skip Session' : 'Skip (Premium Only)'}
        </Text>
      </TouchableOpacity>

      {/* Info Text */}
      {!isPremium && (
        <Text style={styles.infoText}>
          💡 Session continues even when screen is locked. Audio keeps playing in
          background. Don't switch apps or session will fail after 10s!
        </Text>
      )}
      {isPremium && (
        <Text style={styles.infoText}>
          💡 As a premium user, you can switch apps freely. Your session will
          continue in the background.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 40,
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timerContainer: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderWidth: 8,
    borderColor: '#2196f3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  graceWarning: {
    backgroundColor: '#ff9800',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  graceWarningText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  graceWarningSubtext: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  audioStatus: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 30,
  },
  skipButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  skipButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.5,
  },
  skipButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    color: '#aaa',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
});
