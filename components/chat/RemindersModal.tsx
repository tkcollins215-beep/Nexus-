import { AppTheme } from "@/constants/theme";
import { conversationsApi } from "@/utils/api";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
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

interface Reminder {
  _id: string;
  messageId: string;
  conversationId: string;
  remindAt: string;
  isCompleted: boolean;
  message?: {
    _id: string;
    content?: string;
    sender: {
      username: string;
    };
  };
}

interface RemindersModalProps {
  visible: boolean;
  onClose?: () => void;
}

export function RemindersModal({ visible, onClose }: RemindersModalProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadReminders();
    }
  }, [visible]);

  const loadReminders = async () => {
    try {
      setIsLoading(true);
      const response = await conversationsApi.getReminders();
      setReminders(response.data);
    } catch (error) {
      console.error("Failed to load reminders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteReminder = async (reminderId: string) => {
    try {
      await conversationsApi.completeReminder(reminderId);
      setReminders((prev) =>
        prev.map((r) =>
          r._id === reminderId ? { ...r, isCompleted: true } : r,
        ),
      );
    } catch (error) {
      Alert.alert("Error", "Could not mark reminder as complete");
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    try {
      setReminders((prev) => prev.filter((r) => r._id !== reminderId));
    } catch (error) {
      Alert.alert("Error", "Could not delete reminder");
    }
  };

  const formatReminderTime = (date: string) => {
    const reminderDate = new Date(date);
    const now = new Date();
    const diffMs = reminderDate.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 0) return "Overdue";
    if (diffMins < 60) return `in ${diffMins}m`;
    if (diffHours < 24) return `in ${diffHours}h`;
    if (diffDays < 7) return `in ${diffDays}d`;
    return reminderDate.toLocaleDateString();
  };

  const renderReminder = ({ item }: { item: Reminder }) => (
    <View
      style={[
        styles.reminderItem,
        item.isCompleted && styles.reminderCompleted,
      ]}
    >
      <View style={styles.reminderContent}>
        <View style={styles.reminderHeader}>
          <Text style={styles.reminderTime}>
            {formatReminderTime(item.remindAt)}
          </Text>
          {item.isCompleted && (
            <Text style={styles.completedBadge}>Completed</Text>
          )}
        </View>
        <Text style={styles.reminderMessage} numberOfLines={2}>
          {item.message?.content || "Voice message"}
        </Text>
        <Text style={styles.reminderFrom}>
          from {item.message?.sender.username || "Unknown"}
        </Text>
      </View>
      <View style={styles.reminderActions}>
        <TouchableOpacity
          onPress={() => handleCompleteReminder(item._id)}
          disabled={item.isCompleted}
        >
          <MaterialCommunityIcons
            name="check-circle"
            size={24}
            color={
              item.isCompleted
                ? AppTheme.colors.textMuted
                : AppTheme.colors.primary
            }
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteReminder(item._id)}>
          <MaterialCommunityIcons
            name="close-circle"
            size={24}
            color={AppTheme.colors.danger}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const activeReminders = reminders.filter((r) => !r.isCompleted);
  const completedReminders = reminders.filter((r) => r.isCompleted);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Reminders</Text>
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
        ) : reminders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No reminders</Text>
            <Text style={styles.emptyText}>
              Set reminders on messages to stay organized
            </Text>
          </View>
        ) : (
          <FlatList
            data={activeReminders.length > 0 ? activeReminders : reminders}
            renderItem={renderReminder}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            ListHeaderComponent={
              completedReminders.length > 0 && activeReminders.length > 0 ? (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Active Reminders</Text>
                </View>
              ) : null
            }
            ListFooterComponent={
              completedReminders.length > 0 && activeReminders.length > 0 ? (
                <>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Completed</Text>
                  </View>
                  <FlatList
                    scrollEnabled={false}
                    data={completedReminders}
                    renderItem={renderReminder}
                    keyExtractor={(item) => item._id}
                  />
                </>
              ) : null
            }
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
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
  reminderItem: {
    flexDirection: "row",
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radius.lg,
    padding: AppTheme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: AppTheme.colors.primary,
    justifyContent: "space-between",
    alignItems: "center",
    ...AppTheme.shadow.card,
  },
  reminderCompleted: {
    borderLeftColor: AppTheme.colors.textMuted,
    opacity: 0.6,
  },
  reminderContent: {
    flex: 1,
    marginRight: AppTheme.spacing.md,
  },
  reminderHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: AppTheme.spacing.sm,
    marginBottom: 4,
  },
  reminderTime: {
    fontSize: 13,
    fontWeight: "600",
    color: AppTheme.colors.primary,
  },
  completedBadge: {
    fontSize: 11,
    fontWeight: "500",
    color: AppTheme.colors.textMuted,
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reminderMessage: {
    fontSize: 14,
    color: AppTheme.colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  reminderFrom: {
    fontSize: 12,
    color: AppTheme.colors.textSecondary,
  },
  reminderActions: {
    flexDirection: "row",
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
