import { AppTheme } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

export function ReactionsList({ reactions, currentUserId }) {
  if (!reactions || reactions.length === 0) return null;

  const reactionCounts = reactions.map((r) => ({
    emoji: r.emoji,
    count: r.users.length,
    hasReacted: r.users.some((u) => u.toString() === currentUserId),
  }));

  return (
    <View style={styles.container}>
      {reactionCounts.map((reaction) => (
        <View
          key={reaction.emoji}
          style={[
            styles.reactionBadge,
            reaction.hasReacted && styles.reactionBadgeActive,
          ]}
        >
          <Text style={styles.emoji}>{reaction.emoji}</Text>
          {reaction.count > 1 && (
            <Text style={styles.count}>{reaction.count}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: AppTheme.spacing.xs,
    marginTop: AppTheme.spacing.xs,
  },
  reactionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: AppTheme.spacing.sm,
    paddingVertical: 2,
    borderRadius: AppTheme.radius.full,
    backgroundColor: AppTheme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  reactionBadgeActive: {
    backgroundColor: AppTheme.colors.primaryLight,
    borderColor: AppTheme.colors.primary,
  },
  emoji: {
    fontSize: 14,
  },
  count: {
    ...AppTheme.typography.caption,
    color: AppTheme.colors.textMuted,
  },
});
