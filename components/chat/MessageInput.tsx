import { AppTheme } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface MessageInputProps {
  onSend: (message: string) => void;
  onSendAudio?: (uri: string, duration: string) => void;
  isLoading?: boolean;
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(1, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function MessageInput({
  onSend,
  onSendAudio,
  isLoading = false,
}: MessageInputProps) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const canSend = message.trim().length > 0 && !isLoading && !isRecording;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recordingRef.current?.stopAndUnloadAsync();
    };
  }, []);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission needed",
          "Allow microphone access to send voice messages.",
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      await recording.startAsync();

      recordingRef.current = recording;
      setIsRecording(true);
      setRecordDuration(0);

      timerRef.current = setInterval(async () => {
        const status = await recording.getStatusAsync();
        if (status.isRecording && status.durationMillis) {
          setRecordDuration(status.durationMillis);
        }
      }, 200);
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Could not start recording");
    }
  };

  const cancelRecording = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      await recordingRef.current?.stopAndUnloadAsync();
    } catch {
      // ignore
    }
    recordingRef.current = null;
    setIsRecording(false);
    setRecordDuration(0);
  };

  const stopAndSendRecording = async () => {
    if (!recordingRef.current || !onSendAudio) return;

    if (timerRef.current) clearInterval(timerRef.current);

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      const duration = formatDuration(recordDuration);

      recordingRef.current = null;
      setIsRecording(false);
      setRecordDuration(0);

      if (uri) {
        onSendAudio(uri, duration);
      }
    } catch (error) {
      console.error("Failed to send recording:", error);
      Alert.alert("Error", "Could not send voice message");
      setIsRecording(false);
    }
  };

  const handleMicPress = () => {
    if (isRecording) {
      stopAndSendRecording();
    } else {
      startRecording();
    }
  };

  const containerStyle = [
    styles.container,
    { paddingBottom: Math.max(insets.bottom, 10) },
  ];

  if (isRecording) {
    return (
      <View style={containerStyle}>
        <View style={styles.recordingRow}>
          <TouchableOpacity
            onPress={cancelRecording}
            style={styles.cancelButton}
          >
            <MaterialIcons
              name="close"
              size={22}
              color={AppTheme.colors.danger}
            />
          </TouchableOpacity>
          <View style={styles.recordingCenter}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>
              Recording {formatDuration(recordDuration)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={stopAndSendRecording}
            style={styles.sendButton}
            disabled={isLoading}
          >
            <MaterialIcons
              name="send"
              size={22}
              color={AppTheme.colors.textInverse}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <View style={styles.inputRow}>
        {onSendAudio ? (
          <TouchableOpacity
            style={styles.micButton}
            onPress={handleMicPress}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <MaterialIcons
              name="mic"
              size={22}
              color={AppTheme.colors.primary}
            />
          </TouchableOpacity>
        ) : null}
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={AppTheme.colors.textMuted}
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.85}
        >
          <MaterialIcons
            name="send"
            size={22}
            color={AppTheme.colors.textInverse}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.md,
    backgroundColor: "rgba(248, 250, 252, 0.95)",
    borderTopWidth: 1,
    borderTopColor: AppTheme.colors.border,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: AppTheme.spacing.sm,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: AppTheme.radius.full,
    backgroundColor: AppTheme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    ...AppTheme.shadow.button,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.radius.xl,
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: 12,
    maxHeight: 120,
    fontSize: 15,
    fontWeight: "400",
    color: AppTheme.colors.text,
    backgroundColor: AppTheme.colors.surface,
    ...AppTheme.shadow.card,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: AppTheme.radius.full,
    backgroundColor: AppTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...AppTheme.shadow.button,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  recordingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: AppTheme.spacing.sm,
  },
  recordingCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: AppTheme.spacing.sm,
    backgroundColor: AppTheme.colors.dangerLight,
    borderRadius: AppTheme.radius.xl,
    paddingVertical: 14,
    ...AppTheme.shadow.card,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: AppTheme.colors.danger,
  },
  recordingText: {
    fontSize: 15,
    fontWeight: "600",
    color: AppTheme.colors.danger,
  },
  cancelButton: {
    width: 44,
    height: 44,
    borderRadius: AppTheme.radius.full,
    backgroundColor: AppTheme.colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    ...AppTheme.shadow.button,
  },
});
