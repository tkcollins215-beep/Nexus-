import { AppTheme } from "@/constants/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export function ThreadBadge({ replyCount, onPress }) {
  if (!replyCount || replyCount === 0) return null;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <MaterialCommunityIcons
        name="reply-all"
        size={14}
        color={AppTheme.colors.primary}
      />
      <Text style={styles.text}>{replyCount} reply</Text>
      {replyCount > 1 && <Text style={styles.plural}>ies</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: AppTheme.spacing.xs,
    marginTop: AppTheme.spacing.xs,
    paddingHorizontal: AppTheme.spacing.sm,
    paddingVertical: 2,
    backgroundColor: AppTheme.colors.primaryLight,
    borderRadius: AppTheme.radius.md,
    alignSelf: "flex-start",
  },
  text: {
    ...AppTheme.typography.caption,
    color: AppTheme.colors.primary,
    fontWeight: "600",
  },
  plural: {
    ...AppTheme.typography.caption,
    color: AppTheme.colors.primary,
  },
});
