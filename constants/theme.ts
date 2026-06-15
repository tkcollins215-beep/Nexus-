import { Platform } from 'react-native';

const tintColorLight = '#5B4CFF';
const tintColorDark = '#A5B4FC';

export const Colors = {
  light: {
    text: '#111B21',
    background: '#EAE6DB',
    tint: '#00A884',
    icon: '#54656F',
    tabIconDefault: '#AEBAC1',
    tabIconSelected: '#00A884',
  },
  dark: {
    text: '#E9EDEF',
    background: '#0C1317',
    tint: '#25D366',
    icon: '#818A91',
    tabIconDefault: '#818A91',
    tabIconSelected: '#25D366',
  },
};

export const AppTheme = {
  colors: {
    primary: '#00A884',
    primaryDark: '#008069',
    primaryLight: '#D9FDD3',
    secondary: '#25D366',
    gradientStart: '#00A884',
    gradientEnd: '#25D366',
    background: '#EAE6DB',
    backgroundDark: '#0C1317',
    surface: '#FFFFFF',
    surfaceMuted: '#F8F9FA',
    border: '#D1D7DB',
    borderLight: '#E7E9EB',
    text: '#111B21',
    textDark: '#E9EDEF',
    textSecondary: '#3B4A54',
    textMuted: '#667781',
    textInverse: '#FFFFFF',
    success: '#00A884',
    danger: '#EF4444',
    dangerLight: '#FEF2F2',
    chatOwn: '#005E48',
    chatOther: '#FFFFFF',
    chatOtherText: '#111B21',
    overlay: 'rgba(17, 27, 33, 0.4)',
    statusGreen: '#25D366',
    statusBlue: '#00A884',
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
