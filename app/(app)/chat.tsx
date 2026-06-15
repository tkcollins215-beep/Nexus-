import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput";
import { SearchBar } from "@/components/chat/SearchBar";
import { ThreadView } from "@/components/chat/ThreadView";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useAuth } from "@/context/AuthContext";
import { conversationsApi } from "@/utils/api";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function ChatScreen() {
  const { conversationId, title } = useLocalSearchParams<{
    conversationId: string;
    title?: string;
  }>();
  const { state } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showThreadView, setShowThreadView] = useState(false);
  const [selectedThreadMessageId, setSelectedThreadMessageId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadConversation();
  }, [conversationId]);

  useEffect(() => {
    const event =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const subscription = Keyboard.addListener(event, () => {
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        80,
      );
    });
    return () => subscription.remove();
  }, []);

  const loadConversation = async () => {
    try {
      setIsLoading(true);
      const response = await conversationsApi.getConversation(conversationId);
      setMessages(response.data.messages);
    } catch (error) {
      console.error("Failed to load conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    try {
      setIsSending(true);
      const response = await conversationsApi.sendMessage(
        conversationId,
        content,
      );
      setMessages((prev) => [...prev, response.data]);
      await conversationsApi.markAsRead(conversationId);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendAudio = async (uri: string, duration: string) => {
    try {
      setIsSending(true);
      const response = await conversationsApi.sendAudioMessage(
        conversationId,
        uri,
        duration,
      );
      setMessages((prev) => [...prev, response.data]);
      await conversationsApi.markAsRead(conversationId);
    } catch (error) {
      Alert.alert("Error", "Failed to send voice message");
    } finally {
      setIsSending(false);
    }
  };

  const handleReactToMessage = async (messageId: string, emoji: string) => {
    try {
      await conversationsApi.addReaction(conversationId, messageId, emoji);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                reactions: [...(msg.reactions || []), { emoji, users: [state.user?._id ?? state.user?.id] }],
              }
            : msg,
        ),
      );
    } catch (error) {
      console.error("Failed to add reaction:", error);
    }
  };

  const renderMessage = ({ item }: any) => (
    <MessageBubble
      message={item}
      isOwn={item.sender._id === (state.user?._id ?? state.user?.id)}
      senderName={item.sender.username}
      currentUserId={state.user?._id ?? state.user?.id}
      onThreadPress={() => {
        setSelectedThreadMessageId(item._id);
        setShowThreadView(true);
      }}
      onReact={(emoji) => handleReactToMessage(item._id, emoji)}
      onReply={() => {
        setSelectedThreadMessageId(item._id);
        setShowThreadView(true);
      }}
    />
  );

  const keyboardVerticalOffset = Platform.OS === "ios" ? insets.top + 56 : 0;

  if (showThreadView && selectedThreadMessageId) {
    return (
      <ThreadView
        conversationId={conversationId}
        messageId={selectedThreadMessageId}
        title={`${title} - Thread`}
        onClose={() => {
          setShowThreadView(false);
          setSelectedThreadMessageId(null);
        }}
      />
    );
  }

  return (
    <LinearGradient
      colors={["#1a0f3f", "#2d1b69", "#1a0f3f"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <ScreenHeader title={title ?? "Chat"} />
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => setShowSearch(true)}
              style={styles.headerButton}
            >
              <MaterialCommunityIcons
                name="magnify"
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#A855F7" />
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyCircle}>
                <Text style={styles.emptyIcon}>💬</Text>
              </View>
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptyText}>Start a conversation now</Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.messagesList}
              onEndReached={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              scrollEventThrottle={16}
            />
          )}

          <MessageInput
            onSend={handleSendMessage}
            onSendAudio={handleSendAudio}
            isLoading={isSending}
          />
        </KeyboardAvoidingView>

        <SearchBar
          visible={showSearch}
          conversationId={conversationId}
          onClose={() => setShowSearch(false)}
          onResultPress={(messageId) => {
            setShowSearch(false);
          }}
        />
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  headerActions: {
    flexDirection: "row",
    gap: 4,
  },
  headerButton: {
    padding: 8,
  },
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesList: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(168, 85, 247, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 56,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: "#A1A5B4",
    textAlign: "center",
  },
});
