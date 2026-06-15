import { Avatar } from "@/components/ui/Avatar";
import { AppTheme } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { authApi, getApiErrorMessage } from "@/utils/api";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    <LinearGradient
      colors={["#1a0f3f", "#2d1b69", "#1a0f3f"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.pageTitle}>Profile</Text>

          <View style={styles.profileCard}>
            <TouchableOpacity onPress={handleChangePhoto} disabled={isUploadingPhoto} activeOpacity={0.85}>
              <View>
                <Avatar name={state.user?.username ?? "User"} uri={state.user?.avatar} size={96} />
                <View style={styles.cameraBadge}>
                  {isUploadingPhoto ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <MaterialIcons name="camera-alt" size={16} color="#FFFFFF" />
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
            <SettingsRow icon="person" label="Username" value={state.user?.username ?? "—"} />
            <View style={styles.divider} />
            <SettingsRow icon="email" label="Email" value={state.user?.email ?? "—"} />
          </View>

          <TouchableOpacity
            style={[styles.logoutButton, isLoggingOut && styles.buttonDisabled]}
            onPress={handleLogout}
            disabled={isLoggingOut}
            activeOpacity={0.85}
          >
            <MaterialIcons name="logout" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>{isLoggingOut ? "Logging out..." : "Log Out"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 24,
  },
  profileCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  cameraBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#A855F7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#1a0f3f",
  },
  changePhotoHint: {
    fontSize: 12,
    color: "#A1A5B4",
    marginTop: 8,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 8,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(168, 85, 247, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#A1A5B4",
    textTransform: "capitalize",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#A1A5B4",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    marginBottom: 24,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(168, 85, 247, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 12,
    color: "#A1A5B4",
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginLeft: 68,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#EF4444",
  },
});
