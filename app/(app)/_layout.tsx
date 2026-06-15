import { useAuth } from '@/context/AuthContext';
import { AppTheme } from '@/constants/theme';
import { Redirect, Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AppLayout() {
  const { state } = useAuth();
  const colorScheme = useColorScheme();

  if (state.isLoading) {
    return null;
  }

  if (!state.user || !state.token) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: AppTheme.colors.primary,
        tabBarInactiveTintColor: AppTheme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: AppTheme.colors.surface,
          borderTopColor: AppTheme.colors.borderLight,
          borderTopWidth: 1,
          paddingTop: 6,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="conversations"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="message.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="person.fill" color={color} />,
        }}
      />
      <Tabs.Screen name="chat" options={{ href: null }} />
      <Tabs.Screen name="selectUser" options={{ href: null }} />
      <Tabs.Screen name="createGroup" options={{ href: null }} />
    </Tabs>
  );
}
