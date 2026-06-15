import { AppTheme } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
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
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface ActionItem {
  _id: string;
  conversationId: string;
  messageId: string;
  text: string;
  priority: "low" | "medium" | "high";
  assignedTo: Array<{ _id: string; username: string }>;
  dueDate?: string;
  isCompleted: boolean;
  completedAt?: string;
  extractedBy: { _id: string; username: string };
  createdAt: string;
}

interface ActionItemsListProps {
  visible: boolean;
  conversationId: string;
  onClose?: () => void;
}

export function ActionItemsList({
  visible,
  conversationId,
  onClose,
}: ActionItemsListProps) {
  const { state } = useAuth();
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (visible) {
        loadActionItems();
      }
    }, [visible, conversationId]),
  );

  const loadActionItems = async () => {
    try {
      setIsLoading(true);
      const response = await conversationsApi.getActionItems(conversationId);
      setActionItems(response.data);
    } catch (error) {
      console.error("Failed to load action items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleComplete = async (itemId: string, isCompleted: boolean) => {
    try {
      await conversationsApi.updateActionItem(itemId, {
        isCompleted: !isCompleted,
      });
      setActionItems((prev) =>
        prev.map((item) =>
          item._id === itemId ? { ...item, isCompleted: !isCompleted } : item,
        ),
      );
    } catch (error) {
      Alert.alert("Error", "Could not update action item");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return AppTheme.colors.danger;
      case "medium":
        return "#f59e0b";
      case "low":
        return AppTheme.colors.primary;
      default:
        return AppTheme.colors.textMuted;
    }
  };

  const formatDueDate = (date?: string) => {
    if (!date) return "No due date";
    const dueDate = new Date(date);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `${diffDays}d away`;
    return dueDate.toLocaleDateString();
  };

  const isAssignedToMe = (item: ActionItem) => {
    const userId = state.user?._id ?? state.user?.id;
    return item.assignedTo.some((person) => person._id === userId);
  };

  const renderActionItem = ({ item }: { item: ActionItem }) => (
    <View
      style={[styles.itemContainer, item.isCompleted && styles.itemCompleted]}
    >
      <TouchableOpacity
        onPress={() => handleToggleComplete(item._id, item.isCompleted)}
        style={styles.checkboxContainer}
      >
        <MaterialCommunityIcons
          name={item.isCompleted ? "check-circle" : "circle-outline"}
          size={24}
          color={
            item.isCompleted ? AppTheme.colors.primary : AppTheme.colors.border
          }
        />
      </TouchableOpacity>

      <View style={styles.itemContent}>
        <Text
          style={[
            styles.itemText,
            item.isCompleted && styles.itemTextCompleted,
          ]}
          numberOfLines={2}
        >
          {item.text}
        </Text>

        <View style={styles.itemMeta}>
          <View style={styles.metaRow}>
            <View
              style={[
                styles.priorityBadge,
                { borderColor: getPriorityColor(item.priority) },
              ]}
            >
              <Text
                style={[
                  styles.priorityText,
                  { color: getPriorityColor(item.priority) },
                ]}
              >
                {item.priority}
              </Text>
            </View>

            <Text style={styles.dueDateText}>
              {formatDueDate(item.dueDate)}
            </Text>
          </View>

          {item.assignedTo.length > 0 && (
            <Text style={styles.assignedText}>
              Assigned to: {item.assignedTo.map((p) => p.username).join(", ")}
            </Text>
          )}
        </View>
      </View>

      {isAssignedToMe(item) && (
        <MaterialCommunityIcons
          name="account-circle"
          size={20}
          color={AppTheme.colors.primary}
          style={styles.assignedIcon}
        />
      )}
    </View>
  );

  const pendingItems = actionItems.filter((item) => !item.isCompleted);
  const completedItems = actionItems.filter((item) => item.isCompleted);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={["#f8fafc", "#f1f5f9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Action Items</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={AppTheme.colors.primary}
              />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={AppTheme.colors.primary} />
            </View>
          ) : actionItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No action items</Text>
              <Text style={styles.emptyText}>
                Action items will appear here
              </Text>
            </View>
          ) : (
            <FlatList
              data={pendingItems.length > 0 ? pendingItems : actionItems}
              renderItem={renderActionItem}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.listContainer}
              ListHeaderComponent={
                completedItems.length > 0 && pendingItems.length > 0 ? (
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Active</Text>
                  </View>
                ) : null
              }
              ListFooterComponent={
                completedItems.length > 0 && pendingItems.length > 0 ? (
                  <>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>Completed</Text>
                    </View>
                    <FlatList
                      scrollEnabled={false}
                      data={completedItems}
                      renderItem={renderActionItem}
                      keyExtractor={(item) => item._id}
                    />
                  </>
                ) : null
              }
              scrollEventThrottle={16}
            />
          )}
        </View>
      </LinearGradient>
    </Modal>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.md,
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  title: {
    ...AppTheme.typography.title,
    color: AppTheme.colors.text,
  },
  closeButton: {
    padding: AppTheme.spacing.xs,
  },
  listContainer: {
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.md,
    gap: AppTheme.spacing.sm,
  },
  itemContainer: {
    flexDirection: "row",
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radius.lg,
    padding: AppTheme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: AppTheme.colors.primary,
    alignItems: "flex-start",
    gap: AppTheme.spacing.md,
    ...AppTheme.shadow.card,
  },
  itemCompleted: {
    borderLeftColor: AppTheme.colors.textMuted,
    opacity: 0.6,
  },
  checkboxContainer: {
    marginTop: 2,
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    fontSize: 14,
    fontWeight: "500",
    color: AppTheme.colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  itemTextCompleted: {
    textDecorationLine: "line-through",
    color: AppTheme.colors.textMuted,
  },
  itemMeta: {
    gap: AppTheme.spacing.xs,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: AppTheme.spacing.sm,
  },
  priorityBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  dueDateText: {
    fontSize: 11,
    color: AppTheme.colors.textMuted,
  },
  assignedText: {
    fontSize: 11,
    color: AppTheme.colors.textSecondary,
  },
  assignedIcon: {
    marginTop: 2,
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
    fontSize: 48,
    marginBottom: AppTheme.spacing.lg,
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
  sectionHeader: {
    marginVertical: AppTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: AppTheme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
