import { AppTheme } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { type ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: ReactNode;
  subtitle?: string;
}

export function ScreenHeader({ title, showBack, rightAction, subtitle }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
            <MaterialIcons name="arrow-back" size={24} color={AppTheme.colors.text} />
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.side}>{rightAction ?? null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.sm + 4,
    backgroundColor: AppTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.borderLight,
  },
  side: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: AppTheme.radius.full,
    backgroundColor: AppTheme.colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...AppTheme.typography.subtitle,
    fontWeight: '700',
    color: AppTheme.colors.text,
  },
  subtitle: {
    ...AppTheme.typography.caption,
    color: AppTheme.colors.textSecondary,
    marginTop: 2,
  },
});
