import { AppTheme } from '@/constants/theme';
import { resolveMediaUrl } from '@/utils/mediaUrl';
import { Image, StyleSheet, Text, View } from 'react-native';

interface AvatarProps {
  name: string;
  uri?: string | null;
  size?: number;
  showOnline?: boolean;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B'];

function getColorFromName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function Avatar({ name, uri, size = 48, showOnline }: AvatarProps) {
  const bg = getColorFromName(name);
  const imageUri = resolveMediaUrl(uri);

  return (
    <View style={{ width: size, height: size }}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]} />
      ) : (
        <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
          <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{getInitials(name)}</Text>
        </View>
      )}
      {showOnline ? <View style={[styles.online, { right: 0, bottom: 0 }]} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: AppTheme.colors.border,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: AppTheme.colors.textInverse,
    fontWeight: '700',
  },
  online: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: AppTheme.colors.success,
    borderWidth: 2,
    borderColor: AppTheme.colors.surface,
  },
});
