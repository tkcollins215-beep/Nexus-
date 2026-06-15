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

export default function LoginScreen() {
  const navigation = useNavigation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    const result = await signIn(identifier.trim(), password);
    setIsLoading(false);

    if (!result.success) {
      Alert.alert('Login Failed', result.error ?? 'Login failed');
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
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          {/* Form */}
          <View style={styles.form}>
            {/* Identifier */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>USERNAME, EMAIL OR PHONE</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="account" size={20} color="#a78bfa" />
                <TextInput
                  style={styles.input}
                  placeholder="enter your details"
                  placeholderTextColor="#9ca3af"
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
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
                  placeholder="enter your password"
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
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={() => Alert.alert('Coming Soon', 'Password recovery coming soon')}
              disabled={isLoading}
              style={styles.forgotButton}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <LinearGradient
              colors={['#a855f7', '#9333ea']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.button, isLoading && styles.buttonDisabled]}
            >
              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoading}
                style={styles.buttonContent}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </LinearGradient>

            {/* Sign Up Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don&apos;t have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('signup')} disabled={isLoading}>
                <Text style={styles.footerLink}>Create one</Text>
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
    elevation: 0,
  },
  logoIcon: {
    fontSize: 40,
  },
  brand: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
    elevation: 0,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    elevation: 0,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#a1a5b4',
    marginBottom: 32,
    elevation: 0,
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
  forgotButton: {
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#a855f7',
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
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
