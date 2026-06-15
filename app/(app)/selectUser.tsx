import { Avatar } from '@/components/ui/Avatar';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AppTheme } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { conversationsApi, getApiErrorMessage, usersApi } from '@/utils/api';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function getCurrentUserId(user: { _id?: string; id?: string } | null | undefined) {
  return user?._id ?? user?.id;
}

export default function SelectUserScreen() {
  const { state } = useAuth();
  const currentUserId = getCurrentUserId(state.user);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [startingChatId, setStartingChatId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await usersApi.getAllUsers();
      const others = response.data.filter((user: { _id: string }) => user._id !== currentUserId);
      setUsers(others);
    } catch (error) {
      Alert.alert('Error', getApiErrorMessage(error, 'Failed to load users'));
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (user: { username: string; email: string }) =>
        user.username.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
    );
  }, [search, users]);

  const handleSelectUser = async (user: { _id: string; username: string }) => {
    try {
      setStartingChatId(user._id);
      const response = await conversationsApi.createConversation([user._id]);
      const conversation = response.data;

      router.push({
        pathname: '/(app)/chat',
        params: {
          conversationId: conversation._id,
          title: user.username,
        },
      });
    } catch (error) {
      Alert.alert('Error', getApiErrorMessage(error, 'Could not start chat'));
    } finally {
      setStartingChatId(null);
    }
  };

  const renderUser = ({
    item,
  }: {
    item: { _id: string; username: string; email: string; avatar?: string; status?: string };
  }) => {
    const isStarting = startingChatId === item._id;

    return (
      <TouchableOpacity
        style={styles.userRow}
        onPress={() => handleSelectUser(item)}
        disabled={!!startingChatId}
        activeOpacity={0.7}
      >
        <Avatar name={item.username} uri={item.avatar} size={48} showOnline={item.status === 'online'} />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.email}>{item.email}</Text>
        </View>
        {isStarting ? (
          <ActivityIndicator size="small" color={AppTheme.colors.primary} />
        ) : (
          <View style={styles.chatBadge}>
            <MaterialIcons name="chat" size={18} color={AppTheme.colors.primary} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="New Chat" showBack />

      <View style={styles.searchWrapper}>
        <MaterialIcons name="search" size={20} color={AppTheme.colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email"
          placeholderTextColor={AppTheme.colors.textMuted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={AppTheme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item._id}
          renderItem={renderUser}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.centered}>
              <MaterialIcons name="people-outline" size={48} color={AppTheme.colors.textMuted} />
              <Text style={styles.emptyText}>
                {users.length === 0
                  ? 'No other users registered yet'
                  : 'No users match your search'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: AppTheme.spacing.md,
    paddingHorizontal: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radius.md,
    borderWidth: 1.5,
    borderColor: AppTheme.colors.border,
    gap: AppTheme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: AppTheme.colors.text,
  },
  list: {
    paddingHorizontal: AppTheme.spacing.md,
    paddingBottom: AppTheme.spacing.lg,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.sm,
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radius.lg,
    ...AppTheme.shadow.card,
  },
  userInfo: {
    flex: 1,
    marginLeft: AppTheme.spacing.md - 4,
  },
  username: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.colors.text,
    marginBottom: 2,
  },
  email: {
    fontSize: 13,
    color: AppTheme.colors.textSecondary,
  },
  chatBadge: {
    width: 40,
    height: 40,
    borderRadius: AppTheme.radius.full,
    backgroundColor: AppTheme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: AppTheme.spacing.xl,
    gap: AppTheme.spacing.md,
  },
  emptyText: {
    fontSize: 15,
    color: AppTheme.colors.textSecondary,
    textAlign: 'center',
  },
});
