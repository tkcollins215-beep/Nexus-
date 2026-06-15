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
  replyCount?: number;
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  senderName: string;
  currentUserId?: string;
  onThreadPress?: () => void;
  onReact?: (emoji: string) => void;
  onReply?: () => void;
}

export function MessageBubble({
  message,
  isOwn,
  senderName,
  currentUserId,
  onThreadPress,
  onReact,
  onReply,
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
        </View>
        {showActions && (
          <MessageActions
            messageId={message._id}
            isOwn={isOwn}
            onReact={onReact}
            onReply={onReply}
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
    marginVertical: 4,
    marginHorizontal: 8,
    maxWidth: "78%",
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
    fontWeight: "500",
    color: "#00A884",
    marginBottom: 2,
    marginLeft: 12,
  },
  bubbleContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  containerOwn: {
    justifyContent: "flex-end",
  },
  containerOther: {
    justifyContent: "flex-start",
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 40,
  },
  bubbleOwn: {
    backgroundColor: AppTheme.colors.chatOwn,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: AppTheme.colors.chatOther,
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "400",
  },
  textOwn: {
    color: "#E9EDEF",
  },
  textOther: {
    color: "#111B21",
  },
  messageImage: {
    width: 220,
    height: 220,
    borderRadius: 12,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
    marginHorizontal: 8,
    alignSelf: "flex-end",
  },
  timestampOwn: {
    textAlign: "right",
    color: "rgba(233,237,239,0.8)",
  },
  editedLabel: {
    fontSize: 10,
    fontStyle: "italic",
  },
  metaContainer: {
    marginTop: 2,
    marginLeft: 4,
  },
});