import { Avatar } from '@/components/ui/Avatar';
import { AppTheme } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { authApi, getApiErrorMessage } from '@/utils/api';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function SettingsRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <MaterialIcons name={icon} size={20} color={AppTheme.colors.primary} />
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const { state, signOut, updateUser } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const userId = state.user?._id;

  const handleChangePhoto = async () => {
    if (!userId) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to set a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]?.uri) return;

    try {
      setIsUploadingPhoto(true);
      const response = await authApi.uploadAvatar(userId, result.assets[0].uri);
      updateUser(response.data);
      Alert.alert('Success', 'Profile photo updated');
    } catch (error) {
      Alert.alert('Error', getApiErrorMessage(error, 'Failed to upload photo'));
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          setIsLoggingOut(true);
          await signOut();
          setIsLoggingOut(false);
        },
      },
    ]);
  };

  const status = state.user?.status || 'offline';
  const statusColor = status === 'online' ? AppTheme.colors.success : AppTheme.colors.textMuted;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Profile</Text>

        <View style={styles.profileCard}>
          <TouchableOpacity onPress={handleChangePhoto} disabled={isUploadingPhoto} activeOpacity={0.85}>
            <View>
              <Avatar name={state.user?.username ?? 'User'} uri={state.user?.avatar} size={96} />
              <View style={styles.cameraBadge}>
                {isUploadingPhoto ? (
                  <ActivityIndicator size="small" color={AppTheme.colors.textInverse} />
                ) : (
                  <MaterialIcons name="camera-alt" size={16} color={AppTheme.colors.textInverse} />
                )}
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoHint}>Tap photo to change</Text>
          <Text style={styles.profileName}>{state.user?.username}</Text>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.card}>
          <SettingsRow icon="person" label="Username" value={state.user?.username ?? '—'} />
          <View style={styles.divider} />
          <SettingsRow icon="email" label="Email" value={state.user?.email ?? '—'} />
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, isLoggingOut && styles.buttonDisabled]}
          onPress={handleLogout}
          disabled={isLoggingOut}
          activeOpacity={0.85}
        >
          <MaterialIcons name="logout" size={20} color={AppTheme.colors.danger} />
          <Text style={styles.logoutText}>{isLoggingOut ? 'Logging out...' : 'Log Out'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  scroll: {
    padding: AppTheme.spacing.md,
    paddingBottom: AppTheme.spacing.xl,
  },
  pageTitle: {
    ...AppTheme.typography.title,
    color: AppTheme.colors.text,
    marginBottom: AppTheme.spacing.lg,
  },
  profileCard: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radius.xl,
    padding: AppTheme.spacing.lg,
    alignItems: 'center',
    marginBottom: AppTheme.spacing.lg,
    ...AppTheme.shadow.card,
  },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: AppTheme.colors.surface,
  },
  changePhotoHint: {
    fontSize: 12,
    color: AppTheme.colors.textMuted,
    marginTop: AppTheme.spacing.sm,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: AppTheme.colors.text,
    marginTop: AppTheme.spacing.sm,
    marginBottom: AppTheme.spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppTheme.colors.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: AppTheme.radius.full,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: AppTheme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: AppTheme.spacing.sm,
    marginLeft: 4,
  },
  card: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radius.lg,
    marginBottom: AppTheme.spacing.lg,
    overflow: 'hidden',
    ...AppTheme.shadow.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: AppTheme.spacing.md,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: AppTheme.radius.md,
    backgroundColor: AppTheme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: AppTheme.spacing.md - 4,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 12,
    color: AppTheme.colors.textMuted,
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '600',
    color: AppTheme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: AppTheme.colors.borderLight,
    marginLeft: 68,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: AppTheme.spacing.sm,
    backgroundColor: AppTheme.colors.dangerLight,
    borderRadius: AppTheme.radius.md,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.colors.danger,
  },
});
