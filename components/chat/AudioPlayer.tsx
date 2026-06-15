import { AppTheme } from '@/constants/theme';
import { resolveMediaUrl } from '@/utils/mediaUrl';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AudioPlayerProps {
  mediaUrl: string;
  durationLabel?: string;
  isOwn: boolean;
}

export function AudioPlayer({ mediaUrl, durationLabel, isOwn }: AudioPlayerProps) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  const togglePlayback = async () => {
    const uri = resolveMediaUrl(mediaUrl);
    if (!uri) return;

    try {
      if (isPlaying && soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setIsPlaying(false);
        return;
      }

      setIsLoading(true);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { sound } = await Audio.Sound.createAsync({ uri });
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          sound.unloadAsync();
          soundRef.current = null;
        }
      });
      await sound.playAsync();
      setIsPlaying(true);
    } catch (error) {
      console.error('Audio playback error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const iconColor = isOwn ? AppTheme.colors.textInverse : AppTheme.colors.primary;
  const labelColor = isOwn ? 'rgba(255,255,255,0.9)' : AppTheme.colors.textSecondary;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={togglePlayback}
      activeOpacity={0.85}
      disabled={isLoading}
    >
      <View style={[styles.iconWrap, isOwn && styles.iconWrapOwn]}>
        {isLoading ? (
          <ActivityIndicator size="small" color={iconColor} />
        ) : (
          <MaterialIcons name={isPlaying ? 'pause' : 'play-arrow'} size={24} color={iconColor} />
        )}
      </View>
      <View style={styles.waveform}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              styles.bar,
              isOwn && styles.barOwn,
              { height: 8 + (i % 3) * 6 },
              isPlaying && styles.barActive,
            ]}
          />
        ))}
      </View>
      {durationLabel ? (
        <Text style={[styles.duration, { color: labelColor }]}>{durationLabel}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 160,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppTheme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapOwn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flex: 1,
  },
  bar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: AppTheme.colors.primary,
    opacity: 0.5,
  },
  barOwn: {
    backgroundColor: AppTheme.colors.textInverse,
  },
  barActive: {
    opacity: 1,
  },
  duration: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 36,
  },
});
