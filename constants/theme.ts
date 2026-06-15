import { Platform } from 'react-native';

const tintColorLight = '#5B4CFF';
const tintColorDark = '#A5B4FC';

export const Colors = {
  light: {
    text: '#0F172A',
    background: '#F4F6FB',
    tint: tintColorLight,
    icon: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#F8FAFC',
    background: '#0F172A',
    tint: tintColorDark,
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: tintColorDark,
  },
};

export const AppTheme = {
  colors: {
    primary: '#5B4CFF',
    primaryDark: '#4338CA',
    primaryLight: '#EEF2FF',
    secondary: '#8B5CF6',
    gradientStart: '#6366F1',
    gradientEnd: '#8B5CF6',
    background: '#F4F6FB',
    surface: '#FFFFFF',
    surfaceMuted: '#F8FAFC',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    text: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    textInverse: '#FFFFFF',
    success: '#22C55E',
    danger: '#EF4444',
    dangerLight: '#FEF2F2',
    chatOwn: '#5B4CFF',
    chatOther: '#F1F5F9',
    chatOtherText: '#0F172A',
    overlay: 'rgba(15, 23, 42, 0.4)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,
  },
  typography: {
    hero: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.5 },
    title: { fontSize: 24, fontWeight: '700' as const },
    subtitle: { fontSize: 16, fontWeight: '500' as const },
    body: { fontSize: 15, fontWeight: '400' as const },
    caption: { fontSize: 13, fontWeight: '400' as const },
    small: { fontSize: 11, fontWeight: '500' as const },
  },
  shadow: {
  card: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
    },
    android: { elevation: 6 },
    default: {},
  }),
  button: Platform.select({
    ios: {
      shadowColor: '#5B4CFF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
    },
    android: { elevation: 4 },
    default: {},
  }),
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
