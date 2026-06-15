import { AppTheme } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface AuthScreenLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthScreenLayout({ title, subtitle, children }: AuthScreenLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[AppTheme.colors.gradientStart, AppTheme.colors.gradientEnd]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.branding}>
              <View style={styles.logoBadge}>
                <Text style={styles.logoIcon}>💬</Text>
              </View>
              <Text style={styles.brandTitle}>{title}</Text>
              <Text style={styles.brandSubtitle}>{subtitle}</Text>
            </View>
            <View style={styles.card}>{children}</View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    padding: AppTheme.spacing.lg,
    justifyContent: 'center',
  },
  branding: {
    alignItems: 'center',
    marginBottom: AppTheme.spacing.lg,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: AppTheme.spacing.md,
  },
  logoIcon: {
    fontSize: 36,
  },
  brandTitle: {
    ...AppTheme.typography.hero,
    color: AppTheme.colors.textInverse,
    marginBottom: AppTheme.spacing.xs,
  },
  brandSubtitle: {
    ...AppTheme.typography.subtitle,
    color: 'rgba(255,255,255,0.85)',
  },
  card: {
    backgroundColor: AppTheme.colors.surface,
    borderRadius: AppTheme.radius.xl,
    padding: AppTheme.spacing.lg,
    ...AppTheme.shadow.card,
  },
});
