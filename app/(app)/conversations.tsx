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
    <View style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Avatar
                name={state.user?.username ?? "You"}
                uri={state.user?.avatar}
                size={40}
              />
              <View style={styles.userInfo}>
                <Text style={styles.greeting}>Nexus</Text>
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
                  color="#FFFFFF"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialCommunityIcons
                  name="magnify"
                  size={22}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialCommunityIcons
                  name="qrcode-scan"
                  size={22}
                  color="#FFFFFF"
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
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    backgroundColor: "#EAE6DB",
  },
  container: {
    flex: 1,
    backgroundColor: "#EAE6DB",
  },
  header: {
    backgroundColor: "#00A884",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userInfo: {
    justifyContent: "center",
    marginLeft: 12,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexGrow: 1,
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
    paddingHorizontal: 24,
  },
  emptyCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#00A884",
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
    color: "#111B21",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: "#3B4A54",
    marginBottom: 20,
    textAlign: "center",
  },
  emptyButton: {
    backgroundColor: "#00A884",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
