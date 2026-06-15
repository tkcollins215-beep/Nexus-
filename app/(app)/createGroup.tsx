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

export default function CreateGroupScreen() {
  const { state } = useAuth();
  const currentUserId = getCurrentUserId(state.user);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await usersApi.getAllUsers();
      setUsers(response.data.filter((u: { _id: string }) => u._id !== currentUserId));
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
      (u: { username: string; email: string }) =>
        u.username.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)
    );
  }, [search, users]);

  const toggleUser = (userId: string) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Enter a group name');
      return;
    }
    if (selectedIds.length < 2) {
      Alert.alert('Error', 'Select at least 2 members');
      return;
    }

    try {
      setIsCreating(true);
      const response = await conversationsApi.createConversation(
        selectedIds,
        true,
        groupName.trim()
      );
      const conversation = response.data;

      router.replace({
        pathname: '/(app)/chat',
        params: {
          conversationId: conversation._id,
          title: groupName.trim(),
        },
      });
    } catch (error) {
      Alert.alert('Error', getApiErrorMessage(error, 'Could not create group'));
    } finally {
      setIsCreating(false);
    }
  };

  const renderUser = ({
    item,
  }: {
    item: { _id: string; username: string; email: string; avatar?: string };
  }) => {
    const selected = selectedIds.includes(item._id);

    return (
      <TouchableOpacity
        style={[styles.userRow, selected && styles.userRowSelected]}
        onPress={() => toggleUser(item._id)}
        activeOpacity={0.7}
      >
        <Avatar name={item.username} uri={item.avatar} size={44} />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.email}>{item.email}</Text>
        </View>
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected ? (
            <MaterialIcons name="check" size={16} color={AppTheme.colors.textInverse} />
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="New Group" showBack />

      <View style={styles.form}>
        <Text style={styles.label}>Group name</Text>
        <TextInput
          style={styles.groupNameInput}
          placeholder="e.g. Project Team"
          placeholderTextColor={AppTheme.colors.textMuted}
          value={groupName}
          onChangeText={setGroupName}
        />
        <Text style={styles.hint}>
          {selectedIds.length} selected · minimum 2 members
        </Text>
      </View>

      <View style={styles.searchWrapper}>
        <MaterialIcons name="search" size={20} color={AppTheme.colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search members"
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
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.createButton, isCreating && styles.buttonDisabled]}
          onPress={handleCreateGroup}
          disabled={isCreating}
        >
          {isCreating ? (
            <ActivityIndicator color={AppTheme.colors.textInverse} />
          ) : (
            <>
              <MaterialIcons name="groups" size={22} color={AppTheme.colors.textInverse} />
              <Text style={styles.createButtonText}>Create Group</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  form: {
    paddingHorizontal: AppTheme.spacing.md,
    paddingTop: AppTheme.spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: AppTheme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: AppTheme.spacing.sm,
  },
  groupNameInput: {
    backgroundColor: AppTheme.colors.surface,
    borderWidth: 1.5,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.radius.md,
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: AppTheme.colors.text,
  },
  hint: {
    fontSize: 13,
    color: AppTheme.colors.textSecondary,
    marginTop: AppTheme.spacing.sm,
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
    paddingBottom: 100,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.sm,
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    ...AppTheme.shadow.card,
  },
  userRowSelected: {
    borderColor: AppTheme.colors.primary,
    backgroundColor: AppTheme.colors.primaryLight,
  },
  userInfo: {
    flex: 1,
    marginLeft: AppTheme.spacing.md - 4,
  },
  username: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.colors.text,
  },
  email: {
    fontSize: 13,
    color: AppTheme.colors.textSecondary,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: AppTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: AppTheme.colors.borderLight,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: AppTheme.spacing.sm,
    backgroundColor: AppTheme.colors.primary,
    borderRadius: AppTheme.radius.md,
    paddingVertical: 16,
    ...AppTheme.shadow.button,
  },
  createButtonText: {
    color: AppTheme.colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
