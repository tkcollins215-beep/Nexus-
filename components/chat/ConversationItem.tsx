import { Avatar } from '@/components/ui/Avatar';
import { AppTheme } from '@/constants/theme';
import { ConversationItemProps } from '@/types';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function ConversationItem({ conversation, onPress }: ConversationItemProps) {
  const getLastMessagePreview = () => {
    if (!conversation.lastMessage) return 'No messages yet';
    if (conversation.lastMessage.mediaType === 'audio') {
      return `🎤 ${conversation.lastMessage.content || 'Voice message'}`;
    }
    if (conversation.lastMessage.mediaUrl) return '📎 Media';
    return conversation.lastMessage.content.substring(0, 50);
  };

  const getConversationName = () => {
    if (conversation.isGroupChat) {
      return conversation.groupName ?? 'Group';
    }
    const otherParticipant = conversation.participants.find(
      (p: { _id: string }) => p._id !== conversation.currentUserId
    );
    return otherParticipant?.username || 'Unknown User';
  };

  const getOtherParticipant = () => {
    if (conversation.isGroupChat) return null;
    return conversation.participants.find(
      (p: { _id: string; status?: string }) => p._id !== conversation.currentUserId
    );
  };

  const formatTime = (date: string) => {
    const messageDate = new Date(date);
    const today = new Date();
    const isToday = messageDate.toDateString() === today.toDateString();

    if (isToday) {
      return messageDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const name = getConversationName();
  const other = getOtherParticipant();
  const isGroup = conversation.isGroupChat;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <Avatar
        name={name}
        uri={isGroup ? conversation.groupImage : other?.avatar}
        size={52}
        showOnline={!isGroup && other?.status === 'online'}
      />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          {conversation.lastMessage ? (
            <Text style={styles.time}>{formatTime(conversation.lastMessage.createdAt)}</Text>
          ) : null}
        </View>
        <Text style={styles.preview} numberOfLines={1}>
          {isGroup ? `${conversation.participants?.length ?? 0} members · ` : ''}
          {getLastMessagePreview()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.md - 2,
    alignItems: 'center',
    backgroundColor: AppTheme.colors.surface,
    marginHorizontal: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.sm,
    borderRadius: AppTheme.radius.lg,
    ...AppTheme.shadow.card,
  },
  content: {
    flex: 1,
    marginLeft: AppTheme.spacing.md - 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.colors.text,
    marginRight: AppTheme.spacing.sm,
  },
  preview: {
    fontSize: 14,
    color: AppTheme.colors.textSecondary,
  },
  time: {
    fontSize: 12,
    color: AppTheme.colors.textMuted,
    fontWeight: '500',
  },
});
