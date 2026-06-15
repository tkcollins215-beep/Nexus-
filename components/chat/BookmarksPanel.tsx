import { AppTheme } from "@/constants/theme";
import { conversationsApi } from "@/utils/api";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Bookmark {
  _id: string;
  content?: string;
  mediaUrl?: string;
  mediaType?: string;
  sender: {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
  conversationId: string;
}

interface BookmarksPanelProps {
  conversationId: string;
  onMessagePress?: (messageId: string) => void;
  visible?: boolean;
  onClose?: () => void;
}

export function BookmarksPanel({
  conversationId,
  onMessagePress,
}: BookmarksPanelProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadBookmarks();
    }, [conversationId]),
  );

  const loadBookmarks = async () => {
    try {
      setIsLoading(true);
      const response = await conversationsApi.getBookmarks(conversationId);
      setBookmarks(response.data);
    } catch (error) {
      console.error("Failed to load bookmarks:", error);
      Alert.alert("Error", "Could not load bookmarks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookmarks();
    setRefreshing(false);
  };

  const renderBookmark = ({ item }: { item: Bookmark }) => {
    const preview = item.content
      ? item.content.substring(0, 100)
      : item.mediaType === "audio"
        ? "🎙️ Voice message"
        : "📸 Image";

    return (
      <TouchableOpacity
        style={styles.bookmarkItem}
        onPress={() => onMessagePress?.(item._id)}
      >
        <View style={styles.bookmarkContent}>
          <Text style={styles.bookmarkSender}>{item.sender.username}</Text>
          <Text style={styles.bookmarkText} numberOfLines={2}>
            {preview}
          </Text>
          <Text style={styles.bookmarkTime}>
            {new Date(item.createdAt).toLocaleDateString()} at{" "}
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        <MaterialCommunityIcons
          name="bookmark"
          size={20}
          color={AppTheme.colors.primary}
          style={styles.bookmarkIcon}
        />
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={["#f8fafc", "#f1f5f9"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Saved Messages</Text>
          <Text style={styles.headerSubtitle}>
            {bookmarks.length} message{bookmarks.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={AppTheme.colors.primary} />
          </View>
        ) : bookmarks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyCircle}>
              <Text style={styles.emptyIcon}>📌</Text>
            </View>
            <Text style={styles.emptyTitle}>No saved messages</Text>
            <Text style={styles.emptyText}>
              Bookmark messages to find them later
            </Text>
          </View>
        ) : (
          <FlatList
            data={bookmarks}
            renderItem={renderBookmark}
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
  headerTitle: {
    ...AppTheme.typography.title,
    color: AppTheme.colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    ...AppTheme.typography.caption,
    color: AppTheme.colors.textSecondary,
  },
  listContainer: {
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.sm,
    gap: AppTheme.spacing.sm,
  },
  bookmarkItem: {
    flexDirection: "row",
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radius.lg,
    padding: AppTheme.spacing.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    alignItems: "center",
    gap: AppTheme.spacing.md,
    ...AppTheme.shadow.card,
  },
  bookmarkContent: {
    flex: 1,
  },
  bookmarkSender: {
    fontSize: 13,
    fontWeight: "600",
    color: AppTheme.colors.primary,
    marginBottom: 4,
  },
  bookmarkText: {
    fontSize: 14,
    color: AppTheme.colors.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  bookmarkTime: {
    fontSize: 11,
    color: AppTheme.colors.textMuted,
  },
  bookmarkIcon: {
    marginLeft: AppTheme.spacing.sm,
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
    textAlign: "center",
  },
});
