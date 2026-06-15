import { ConversationItem } from "@/components/chat/ConversationItem";
import { Avatar } from "@/components/ui/Avatar";
import { AppTheme } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { conversationsApi } from "@/utils/api";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ConversationsScreen() {
  const { state } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, []),
  );

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const response = await conversationsApi.getConversations();
      setConversations(response.data);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const handleConversationPress = (conversation) => {
    const title = conversation.isGroupChat
      ? conversation.groupName
      : conversation.participants.find(
          (p) => p._id !== (state.user?._id ?? state.user?.id),
        )?.username;

    router.push({
      pathname: "/(app)/chat",
      params: {
        conversationId: conversation._id,
        title: title ?? "Chat",
      },
    });
  };

  const renderConversation = ({ item }) => (
    <ConversationItem
      conversation={{
        ...item,
        currentUserId: state.user?._id ?? state.user?.id,
      }}
      onPress={() => handleConversationPress(item)}
    />
  );

  return (
    <LinearGradient
      colors={["#f8fafc", "#f1f5f9"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Avatar
                name={state.user?.username ?? "You"}
                uri={state.user?.avatar}
                size={44}
              />
              <View style={styles.userInfo}>
                <Text style={styles.greeting}>Nexus</Text>
                <Text style={styles.subtitle}>Messages</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.push("/(app)/selectUser")}
              >
                <MaterialCommunityIcons
                  name="plus"
                  size={24}
                  color={AppTheme.colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialCommunityIcons
                  name="magnify"
                  size={24}
                  color={AppTheme.colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Conversations List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={AppTheme.colors.primary} />
          </View>
        ) : conversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyCircle}>
              <Text style={styles.emptyIcon}>💬</Text>
            </View>
            <Text style={styles.emptyTitle}>No conversations</Text>
            <Text style={styles.emptyText}>
              Start a new conversation to chat
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push("/(app)/selectUser")}
            >
              <Text style={styles.emptyButtonText}>New Chat</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={conversations}
            renderItem={renderConversation}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={AppTheme.colors.primary}
                colors={[AppTheme.colors.primary]}
              />
            }
            scrollEventThrottle={16}
          />
        )}
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
  },
  header: {
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.md,
    backgroundColor: "transparent",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: AppTheme.spacing.md,
    flex: 1,
  },
  userInfo: {
    justifyContent: "center",
  },
  greeting: {
    ...AppTheme.typography.title,
    color: AppTheme.colors.text,
    marginBottom: 2,
  },
  subtitle: {
    ...AppTheme.typography.caption,
    color: AppTheme.colors.textSecondary,
  },
  headerActions: {
    flexDirection: "row",
    gap: AppTheme.spacing.md,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AppTheme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    ...AppTheme.shadow.card,
  },
  listContainer: {
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.sm,
    gap: AppTheme.spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: AppTheme.spacing.lg,
  },
  emptyCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: AppTheme.colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: AppTheme.spacing.lg,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    ...AppTheme.typography.title,
    color: AppTheme.colors.text,
    marginBottom: AppTheme.spacing.sm,
  },
  emptyText: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.textSecondary,
    marginBottom: AppTheme.spacing.lg,
    textAlign: "center",
  },
  emptyButton: {
    backgroundColor: AppTheme.colors.primary,
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.md,
    borderRadius: AppTheme.radius.md,
    ...AppTheme.shadow.button,
  },
  emptyButtonText: {
    color: AppTheme.colors.textInverse,
    ...AppTheme.typography.body,
    fontWeight: "600",
  },
});
