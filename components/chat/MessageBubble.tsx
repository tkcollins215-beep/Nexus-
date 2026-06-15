import { AudioPlayer } from "@/components/chat/AudioPlayer";
import { MessageActions } from "@/components/chat/MessageActions";
import { ReactionsList } from "@/components/chat/ReactionsList";
import { ThreadBadge } from "@/components/chat/ThreadBadge";
import { AppTheme } from "@/constants/theme";
import { resolveMediaUrl } from "@/utils/mediaUrl";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface Message {
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
  isEdited?: boolean;
  editedAt?: string;
  reactions?: Array<{ emoji: string; users: string[] }>;
  bookmarkedBy?: string[];
  replyCount?: number;
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  senderName: string;
  currentUserId?: string;
  onThreadPress?: () => void;
  onReact?: (emoji: string) => void;
  onBookmark?: () => void;
  onReply?: () => void;
  onPin?: () => void;
  onRemind?: () => void;
  isBookmarked?: boolean;
}

export function MessageBubble({
  message,
  isOwn,
  senderName,
  currentUserId,
  onThreadPress,
  onReact,
  onBookmark,
  onReply,
  onPin,
  onRemind,
  isBookmarked: propIsBookmarked = false,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);

  const formatTime = (date: string | Date) =>
    new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const isAudio = message.mediaType === "audio" && message.mediaUrl;
  const isImage =
    message.mediaUrl &&
    message.mediaType !== "audio" &&
    resolveMediaUrl(message.mediaUrl);

  const isBookmarked = propIsBookmarked || message.bookmarkedBy?.includes(currentUserId || "");

  return (
    <Pressable
      style={[styles.wrapper, isOwn ? styles.wrapperOwn : styles.wrapperOther]}
      onPress={() => setShowActions((prev) => !prev)}
    >
      {!isOwn && senderName ? (
        <Text style={styles.senderName}>{senderName}</Text>
      ) : null}
      <View
        style={[
          styles.bubbleContainer,
          isOwn ? styles.containerOwn : styles.containerOther,
        ]}
      >
        <View
          style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}
        >
          {isAudio ? (
            <AudioPlayer
              mediaUrl={message.mediaUrl!}
              durationLabel={message.content || undefined}
              isOwn={isOwn}
            />
          ) : null}
          {isImage ? (
            <Image source={{ uri: isImage }} style={styles.messageImage} />
          ) : null}
          {message.content && !isAudio ? (
            <Text
              style={[styles.text, isOwn ? styles.textOwn : styles.textOther]}
            >
              {message.content}
            </Text>
          ) : null}
          {isBookmarked && (
            <View style={styles.bookmarkBadge}>
              <Text style={styles.bookmarkEmoji}>📌</Text>
            </View>
          )}
        </View>
        {showActions && (
          <MessageActions
            messageId={message._id}
            isOwn={isOwn}
            onReact={onReact}
            onBookmark={onBookmark}
            onReply={onReply}
            onPin={onPin}
            onRemind={onRemind}
            isBookmarked={isBookmarked}
          />
        )}
      </View>

      {/* Reactions & Thread */}
      <View style={styles.metaContainer}>
        {message.reactions && message.reactions.length > 0 && (
          <ReactionsList
            reactions={message.reactions}
            currentUserId={currentUserId}
          />
        )}
        {message.replyCount ? (
          <ThreadBadge
            replyCount={message.replyCount}
            onPress={onThreadPress}
          />
        ) : null}
      </View>

      <Text style={[styles.timestamp, isOwn && styles.timestampOwn]}>
        {formatTime(message.createdAt)}
        {message.isEdited && <Text style={styles.editedLabel}> (edited)</Text>}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 6,
    marginHorizontal: AppTheme.spacing.md,
    maxWidth: "82%",
  },
  wrapperOwn: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  wrapperOther: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    color: AppTheme.colors.primary,
    marginBottom: 4,
    marginLeft: 4,
  },
  bubbleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: AppTheme.spacing.sm,
  },
  containerOwn: {
    justifyContent: "flex-end",
  },
  containerOther: {
    justifyContent: "flex-start",
  },
  bubble: {
    borderRadius: AppTheme.radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...AppTheme.shadow.card,
  },
  bubbleOwn: {
    backgroundColor: AppTheme.colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: AppTheme.colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
  },
  textOwn: {
    color: AppTheme.colors.textInverse,
  },
  textOther: {
    color: AppTheme.colors.text,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: AppTheme.radius.md,
    marginBottom: 6,
  },
  bookmarkBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: AppTheme.colors.textInverse,
    borderRadius: 20,
    padding: 4,
    ...AppTheme.shadow.button,
  },
  bookmarkEmoji: {
    fontSize: 16,
  },
  metaContainer: {
    marginTop: AppTheme.spacing.xs,
    gap: AppTheme.spacing.xs,
  },
  timestamp: {
    fontSize: 11,
    color: AppTheme.colors.textMuted,
    marginTop: 6,
    marginHorizontal: 4,
  },
  timestampOwn: {
    textAlign: "right",
  },
  editedLabel: {
    fontSize: 10,
    fontStyle: "italic",
  },
});
