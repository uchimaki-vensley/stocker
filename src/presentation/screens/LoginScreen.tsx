import { StatusBar } from 'expo-status-bar';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type LoginScreenProps = {
  onLogin: () => void;
  loading: boolean;
  error: string | null;
};

export const LoginScreen = ({ onLogin, loading, error }: LoginScreenProps) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundBlobTop} />
      <View style={styles.backgroundBlobBottom} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.brand}>Stocker</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            日用品の在庫を一枚のボードで管理しよう。
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="you@example.com"
              placeholderTextColor="#9aa2a8"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#9aa2a8"
              secureTextEntry
              style={styles.input}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.primaryButton}
            onPress={() => {
              if (loading) return;
              onLogin();
            }}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? '読み込み中…' : 'Log in'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Alert.alert('Reset', 'Password reset is not wired yet.')}
          >
            <Text style={styles.link}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>No account yet?</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Alert.alert('Sign up', 'Sign-up flow coming soon.')}
          >
            <Text style={styles.footerLink}>Create one</Text>
          </TouchableOpacity>
        </View>
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f1eb',
  },
  backgroundBlobTop: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#f5c46b',
    opacity: 0.45,
  },
  backgroundBlobBottom: {
    position: 'absolute',
    bottom: -160,
    left: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#8cc6c0',
    opacity: 0.35,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  header: {
    gap: 10,
  },
  brand: {
    fontSize: 18,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#60666d',
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1d2329',
  },
  subtitle: {
    fontSize: 16,
    color: '#5b656d',
    lineHeight: 22,
  },
  form: {
    gap: 18,
    paddingVertical: 12,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#4b545b',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1d2329',
    borderWidth: 1,
    borderColor: '#e0ddd7',
  },
  primaryButton: {
    backgroundColor: '#1d2329',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryButtonText: {
    color: '#f8f4ee',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  link: {
    color: '#345b57',
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    color: '#5b656d',
  },
  footerLink: {
    color: '#1d2329',
    fontWeight: '700',
  },
  errorText: {
    color: '#c04848',
    fontWeight: '600',
  },
});
