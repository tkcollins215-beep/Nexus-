import { AppTheme } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

interface AuthTextFieldProps extends TextInputProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  showToggle?: boolean;
  secureVisible?: boolean;
  onToggleSecure?: () => void;
}

export function AuthTextField({
  icon,
  showToggle,
  secureVisible,
  onToggleSecure,
  style,
  editable = true,
  ...props
}: AuthTextFieldProps) {
  return (
    <View style={[styles.wrapper, !editable && styles.disabled]}>
      <MaterialIcons name={icon} size={20} color={AppTheme.colors.primary} style={styles.icon} />
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={AppTheme.colors.textMuted}
        editable={editable}
        {...props}
      />
      {showToggle ? (
        <TouchableOpacity onPress={onToggleSecure} style={styles.toggle} disabled={!editable}>
          <MaterialIcons
            name={secureVisible ? 'visibility' : 'visibility-off'}
            size={22}
            color={AppTheme.colors.textMuted}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.radius.md,
    backgroundColor: AppTheme.colors.surfaceMuted,
    marginBottom: AppTheme.spacing.md,
    paddingHorizontal: AppTheme.spacing.xs,
  },
  disabled: {
    opacity: 0.6,
  },
  icon: {
    paddingHorizontal: AppTheme.spacing.sm + 4,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: AppTheme.colors.text,
  },
  toggle: {
    padding: AppTheme.spacing.sm + 4,
  },
});
