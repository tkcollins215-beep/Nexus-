import { AppTheme } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const { state } = useAuth();

  if (state.isLoading) {
    return (
      <View style={styles.loading}>
        <View style={styles.logoBadge}>
          <Text style={styles.logo}>💬</Text>
        </View>
        <Text style={styles.brand}>Nexus</Text>
        <ActivityIndicator
          size="large"
          color={AppTheme.colors.primary}
          style={styles.spinner}
        />
      </View>
    );
  }

  if (state.user && state.token) {
    return <Redirect href="/(app)/conversations" />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppTheme.colors.background,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: AppTheme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: AppTheme.spacing.md,
  },
  logo: {
    fontSize: 40,
  },
  brand: {
    ...AppTheme.typography.title,
    color: AppTheme.colors.primary,
    marginBottom: AppTheme.spacing.lg,
  },
  spinner: {
    marginTop: AppTheme.spacing.sm,
  },
});
