import { useAuth } from '@/context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SignupScreen() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return Math.min(strength, 100);
  };

  const getStrengthColor = () => {
    const strength = getPasswordStrength();
    if (strength < 25) return '#EF4444';
    if (strength < 50) return '#F59E0B';
    if (strength < 75) return '#FBBF24';
    return '#22C55E';
  };

  const handleSignup = async () => {
    if (!username.trim() || !email.trim() || !phone.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    const normalizedPhone = phone.replace(/\D/g, '');
    if (normalizedPhone.length < 10 || normalizedPhone.length > 15) {
      Alert.alert('Error', 'Enter a valid phone number (10–15 digits)');
      return;
    }

    setIsLoading(true);
    const result = await signUp(username.trim(), email.trim().toLowerCase(), normalizedPhone, password);
    setIsLoading(false);

    if (!result.success) {
      Alert.alert('Signup Failed', result.error ?? 'Registration failed');
    }
  };

  return (
    <LinearGradient
      colors={['#1a0f3f', '#2d1b69', '#1a0f3f']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#a855f7', '#ec4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBadge}
            >
              <Text style={styles.logoIcon}>💬</Text>
            </LinearGradient>
            <Text style={styles.brand}>Nexus</Text>
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join the conversation today</Text>

          {/* Form */}
          <View style={styles.form}>
            {/* Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>USERNAME</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="account" size={20} color="#a78bfa" />
                <TextInput
                  style={styles.input}
                  placeholder="choose a username"
                  placeholderTextColor="#9ca3af"
                  value={username}
                  onChangeText={setUsername}
                  editable={!isLoading}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="email" size={20} color="#a78bfa" />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PHONE NUMBER</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="phone" size={20} color="#a78bfa" />
                <TextInput
                  style={styles.input}
                  placeholder="+1234 567 8900"
                  placeholderTextColor="#9ca3af"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="lock" size={20} color="#a78bfa" />
                <TextInput
                  style={styles.input}
                  placeholder="min. 6 characters"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#a78bfa"
                  />
                </TouchableOpacity>
              </View>
              {password && (
                <View style={styles.strengthContainer}>
                  <View
                    style={[
                      styles.strengthBar,
                      { width: `${getPasswordStrength()}%`, backgroundColor: getStrengthColor() },
                    ]}
                  />
                </View>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CONFIRM PASSWORD</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="lock-outline" size={20} color="#a78bfa" />
                <TextInput
                  style={styles.input}
                  placeholder="repeat your password"
                  placeholderTextColor="#9ca3af"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <MaterialCommunityIcons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#a78bfa"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Create Button */}
            <LinearGradient
              colors={['#a855f7', '#9333ea']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.button, isLoading && styles.buttonDisabled]}
            >
              <TouchableOpacity
                onPress={handleSignup}
                disabled={isLoading}
                style={styles.buttonContent}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Create account</Text>
                )}
              </TouchableOpacity>
            </LinearGradient>

            {/* Sign In Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('login')} disabled={isLoading}>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 40,
  },
  brand: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#a1a5b4',
    marginBottom: 32,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d1d5db',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: '#ffffff',
  },
  strengthContainer: {
    height: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
    flexDirection: 'row',
    gap: 4,
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9ca3af',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#a855f7',
  },
});
