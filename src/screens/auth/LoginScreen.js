import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { authService } from '../../services/authService';
import { googleAuthService } from '../../services/googleAuthService';
import Icon from 'react-native-vector-icons/Ionicons';
import logoImage from '../../../assets/logo.png';

const LoginScreen = ({ navigation }) => {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const { login } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const offerSignUp = (identifier) => {
    if (Platform.OS === 'web') {
      // Alert.alert is a no-op on web; go straight to sign-up with the
      // identifier prefilled (the register screen links back to sign-in).
      navigation.navigate('Register', { identifier });
      return;
    }
    Alert.alert(
      'No account found',
      `We couldn't find an account for "${identifier}". Would you like to create one?`,
      [
        { text: 'Not now', style: 'cancel' },
        { text: 'Create account', onPress: () => navigation.navigate('Register', { identifier }) },
      ]
    );
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setIsLoading(true);
    try {
      // Mirror the web flow: probe whether the account exists first so we can
      // send new users straight to sign-up instead of a dead-end error.
      const probe = await authService.checkAccount(username.trim());
      if (probe && probe.exists === false) {
        setIsLoading(false);
        offerSignUp(username.trim());
        return;
      }
      await login(username, password);
    } catch (error) {
      const status = error.response?.status;
      if (status === 400 || status === 401 || status === 404) {
        offerSignUp(username.trim());
      } else {
        Alert.alert('Login Failed', error.response?.data?.detail || 'Invalid credentials');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { idToken } = await googleAuthService.signIn();
      await authService.googleAuth(idToken);
    } catch (error) {
      // Don't show alert if user cancelled
      if (error.message !== 'Google sign-in was cancelled') {
        Alert.alert('Google Sign-In Failed', error.message || 'Something went wrong');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: '#f6f7fb' }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.authCard, { backgroundColor: '#fff' }]}>
          <View style={styles.authHead}>
            <Image source={logoImage} style={styles.logo} resizeMode="contain" />
            <Text style={[styles.title, { color: '#1f2a37' }]}>
              Welcome back
            </Text>
            <Text style={[styles.subtitle, { color: '#64748b' }]}>
              Sign in to continue to ThinkValley Store
            </Text>
          </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: '#94a3b8' }]}>Email or Username</Text>
            <View style={[styles.inputWrapper, { borderColor: '#e3e7ee', backgroundColor: '#fbfcfe' }]}>
              <Icon name="person-outline" size={18} color="#b4bcc8" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: '#1f2a37' }]}
                placeholder="Enter email or username"
                placeholderTextColor="#94a3b8"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: '#94a3b8' }]}>Password</Text>
            <View style={[styles.inputWrapper, { borderColor: '#e3e7ee', backgroundColor: '#fbfcfe' }]}>
              <Icon name="lock-closed-outline" size={18} color="#b4bcc8" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: '#1f2a37' }]}
                placeholder="Enter password"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color="#94a3b8"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={[styles.forgotPasswordText, { color: '#D2620F' }]}>
              Forgot password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: '#F47A20' }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: '#e2e8f0' }]} />
            <Text style={[styles.dividerText, { color: '#94a3b8' }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: '#e2e8f0' }]} />
          </View>

          <TouchableOpacity
            style={[styles.googleButton, { borderColor: '#e2e8f0', backgroundColor: '#fff' }]}
            onPress={handleGoogleSignIn}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <ActivityIndicator size="small" color="#1f2a37" />
            ) : (
              <>
                <Image source={{ uri: 'https://www.google.com/favicon.ico' }} style={styles.googleIcon} />
                <Text style={[styles.googleButtonText, { color: '#1f2a37' }]}>
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={[styles.registerText, { color: '#64748b' }]}>
              New to ThinkValley?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.registerLink, { color: '#D2620F' }]}>Create an account</Text>
            </TouchableOpacity>
          </View>
        </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  authCard: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.32,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#eef0f4',
    overflow: 'hidden',
  },
  authHead: {
    padding: 16,
    paddingTop: 28,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  formContainer: {
    padding: 22,
    paddingTop: 0,
  },
  inputContainer: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 11,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '600',
  },
  loginButton: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 11,
    marginTop: 4,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: '#94a3b8',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderWidth: 1.5,
    borderRadius: 11,
    marginBottom: 14,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    fontSize: 13,
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '700',
  },
});

export default LoginScreen;
