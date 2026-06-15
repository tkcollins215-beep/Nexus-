import { MessageBubble } from "@/components/chat/MessageBubble";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { AppTheme } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { conversationsApi } from "@/utils/api";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import { MessageInput } from "./MessageInput";

interface ThreadViewProps {
  conversationId: string;
  messageId: string;
  title?: string;
  onClose?: () => void;
}

export function ThreadView({
  conversationId,
  messageId,
  title,
  onClose,
}: ThreadViewProps) {
  const { state } = useAuth();
  const insets = useSafeAreaInsets();
  const [thread, setThread] = useState<any>(null);
  const [replies, setReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadThread();
  }, [messageId]);

  const loadThread = async () => {
    try {
      setIsLoading(true);
      const response = await conversationsApi.getThread(
        conversationId,
        messageId,
      );
      setThread(response.data.message);
      setReplies(response.data.replies || []);
    } catch (error) {
      console.error("Failed to load thread:", error);
      Alert.alert("Error", "Could not load thread");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReply = async (content: string) => {
    if (!content.trim()) return;

    try {
      setIsSending(true);
      const response = await conversationsApi.sendReply(
        conversationId,
        messageId,
        content,
      );
      setReplies((prev) => [...prev, response.data]);
    } catch (error) {
      console.error("Failed to send reply:", error);
      Alert.alert("Error", "Could not send reply");
    } finally {
      setIsSending(false);
    }
  };

  const renderReply = ({ item }: any) => (
    <MessageBubble
      message={item}
      isOwn={item.sender._id === (state.user?._id ?? state.user?.id)}
      senderName={item.sender.username}
      currentUserId={state.user?._id ?? state.user?.id}
    />
  );

  const keyboardVerticalOffset = Platform.OS === "ios" ? insets.top + 56 : 0;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppTheme.colors.primary} />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#f8fafc", "#f1f5f9"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <MaterialIcons
              name="close"
              size={24}
              color={AppTheme.colors.primary}
            />
          </TouchableOpacity>
          <ScreenHeader title={title || "Thread"} />
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          {thread && (
            <View style={styles.originalMessage}>
              <MessageBubble
                message={thread}
                isOwn={
                  thread.sender._id === (state.user?._id ?? state.user?.id)
                }
                senderName={thread.sender.username}
                currentUserId={state.user?._id ?? state.user?.id}
              />
            </View>
          )}

          <View style={styles.divider} />

          <FlatList
            data={replies}
            renderItem={renderReply}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.repliesList}
            scrollEventThrottle={16}
          />

          <MessageInput onSend={handleSendReply} isLoading={isSending} />
        </KeyboardAvoidingView>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.sm,
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerSpacer: {
    width: 40,
  },
  flex: {
    flex: 1,
  },
  originalMessage: {
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.md,
    backgroundColor: "rgba(248, 250, 252, 0.5)",
  },
  divider: {
    height: 1,
    backgroundColor: AppTheme.colors.border,
    marginVertical: AppTheme.spacing.sm,
  },
  repliesList: {
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.md,
    gap: AppTheme.spacing.sm,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppTheme.colors.background,
  },
});
