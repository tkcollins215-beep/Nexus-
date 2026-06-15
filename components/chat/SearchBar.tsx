import { AppTheme } from "@/constants/theme";
import { conversationsApi } from "@/utils/api";
import { MaterialIcons } from "@expo/vector-icons";
import { useCallback, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface SearchResult {
  _id: string;
  content?: string;
  sender: {
    username: string;
    avatar?: string;
  };
  createdAt: string;
  conversationId: string;
}

interface SearchBarProps {
  visible: boolean;
  conversationId: string;
  onClose?: () => void;
  onResultPress?: (messageId: string, conversationId: string) => void;
}

export function SearchBar({
  visible,
  conversationId,
  onClose,
  onResultPress,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(async () => {
        if (!searchQuery.trim()) {
          setResults([]);
          setHasSearched(false);
          return;
        }

        try {
          setIsSearching(true);
          const response = await conversationsApi.searchMessages(
            conversationId,
            searchQuery,
          );
          setResults(response.data);
          setHasSearched(true);
        } catch (error) {
          console.error("Failed to search:", error);
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    },
    [conversationId],
  );

  const handleQueryChange = (text: string) => {
    setQuery(text);
    performSearch(text);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
  };

  const renderResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => {
        onResultPress?.(item._id, item.conversationId);
        onClose?.();
      }}
    >
      <View style={styles.resultContent}>
        <Text style={styles.resultSender}>{item.sender.username}</Text>
        <Text style={styles.resultText} numberOfLines={2}>
          {item.content || "Message"}
        </Text>
        <Text style={styles.resultTime}>
          {new Date(item.createdAt).toLocaleDateString()} at{" "}
          {new Date(item.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
      <MaterialIcons
        name="chevron-right"
        size={20}
        color={AppTheme.colors.textMuted}
      />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <MaterialIcons
            name="search"
            size={24}
            color={AppTheme.colors.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages..."
            placeholderTextColor={AppTheme.colors.textMuted}
            value={query}
            onChangeText={handleQueryChange}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear}>
              <MaterialIcons
                name="close"
                size={24}
                color={AppTheme.colors.textMuted}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {isSearching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={AppTheme.colors.primary} />
          </View>
        ) : !hasSearched ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="search"
              size={48}
              color={AppTheme.colors.textMuted}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>Search messages</Text>
            <Text style={styles.emptyText}>
              Type to find messages in this conversation
            </Text>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="search-off"
              size={48}
              color={AppTheme.colors.textMuted}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>No results</Text>
            <Text style={styles.emptyText}>
              Try different keywords or check your spelling
            </Text>
          </View>
        ) : (
          <FlatList
            data={results}
            renderItem={renderResult}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            scrollEventThrottle={16}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
    gap: AppTheme.spacing.sm,
  },
  searchIcon: {
    marginLeft: AppTheme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radius.lg,
    paddingHorizontal: AppTheme.spacing.md,
    fontSize: 14,
    color: AppTheme.colors.text,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  cancelButton: {
    paddingHorizontal: AppTheme.spacing.sm,
  },
  cancelText: {
    color: AppTheme.colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.md,
    gap: AppTheme.spacing.sm,
  },
  resultItem: {
    flexDirection: "row",
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radius.lg,
    padding: AppTheme.spacing.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    alignItems: "center",
    justifyContent: "space-between",
    ...AppTheme.shadow.card,
  },
  resultContent: {
    flex: 1,
    marginRight: AppTheme.spacing.md,
  },
  resultSender: {
    fontSize: 13,
    fontWeight: "600",
    color: AppTheme.colors.primary,
    marginBottom: 4,
  },
  resultText: {
    fontSize: 14,
    color: AppTheme.colors.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  resultTime: {
    fontSize: 11,
    color: AppTheme.colors.textMuted,
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
  emptyIcon: {
    marginBottom: AppTheme.spacing.lg,
    opacity: 0.5,
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
