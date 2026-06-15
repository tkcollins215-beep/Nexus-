import { AppTheme } from "@/constants/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRef, useState } from "react";
import {
    Animated,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const EMOJI_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "👏", "⭐"];

export function MessageActions({
  messageId,
  isOwn,
  onReact,
  onBookmark,
  onReply,
  onPin,
  onRemind,
  isBookmarked = false,
}) {
  const [showActions, setShowActions] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const toggleActions = () => {
    setShowActions(!showActions);
    Animated.spring(scaleAnim, {
      toValue: showActions ? 0 : 1,
      useNativeDriver: true,
    }).start();
  };

  const handleReact = (emoji) => {
    onReact?.(emoji);
    setShowEmojis(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={toggleActions}
        hitSlop={8}
      >
        <MaterialCommunityIcons
          name="dots-vertical"
          size={20}
          color={AppTheme.colors.textMuted}
        />
      </TouchableOpacity>

      {showActions && (
        <View style={styles.actionsMenu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowEmojis(true);
              setShowActions(false);
            }}
          >
            <MaterialCommunityIcons
              name="emoticon-happy-outline"
              size={20}
              color={AppTheme.colors.primary}
            />
            <Text style={styles.menuText}>React</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onBookmark?.();
              setShowActions(false);
            }}
          >
            <MaterialCommunityIcons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={20}
              color={AppTheme.colors.primary}
            />
            <Text style={styles.menuText}>
              {isBookmarked ? "Saved" : "Save"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onReply?.();
              setShowActions(false);
            }}
          >
            <MaterialCommunityIcons
              name="reply"
              size={20}
              color={AppTheme.colors.primary}
            />
            <Text style={styles.menuText}>Reply</Text>
          </TouchableOpacity>

          {!isOwn && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onRemind?.();
                setShowActions(false);
              }}
            >
              <MaterialCommunityIcons
                name="bell-outline"
                size={20}
                color={AppTheme.colors.primary}
              />
              <Text style={styles.menuText}>Remind</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onPin?.();
              setShowActions(false);
            }}
          >
            <MaterialCommunityIcons
              name="pin-outline"
              size={20}
              color={AppTheme.colors.primary}
            />
            <Text style={styles.menuText}>Pin</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={showEmojis}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEmojis(false)}
      >
        <TouchableOpacity
          style={styles.emojiBackdrop}
          onPress={() => setShowEmojis(false)}
        >
          <View style={styles.emojiPicker}>
            {EMOJI_REACTIONS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={styles.emojiButton}
                onPress={() => handleReact(emoji)}
              >
                <Text style={styles.emoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    padding: AppTheme.spacing.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  actionsMenu: {
    position: "absolute",
    top: 0,
    right: 32,
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radius.md,
    overflow: "hidden",
    ...AppTheme.shadow.card,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.sm,
    gap: AppTheme.spacing.sm,
  },
  menuText: {
    ...AppTheme.typography.body,
    color: AppTheme.colors.text,
  },
  emojiBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  emojiPicker: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radius.lg,
    padding: AppTheme.spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
    width: "80%",
    ...AppTheme.shadow.card,
  },
  emojiButton: {
    width: "25%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: AppTheme.radius.md,
  },
  emoji: {
    fontSize: 32,
  },
});
