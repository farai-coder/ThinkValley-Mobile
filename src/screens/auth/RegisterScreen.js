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
import { useRoute } from '@react-navigation/native';
import { Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import logoImage from '../../../assets/logo.png';

const SITE_URL = 'https://wetradeafrica.co.zw';

const RegisterScreen = ({ navigation }) => {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const { register } = useAuth();
  const route = useRoute();

  const [email, setEmail] = useState(route.params?.identifier || '');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+263');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const openTerms = () => Linking.openURL(`${SITE_URL}/terms/`);
  const openPrivacy = () => Linking.openURL(`${SITE_URL}/privacy/`);

  const handleRegister = async () => {
    if (!email || !password || !firstName || !lastName || !phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!acceptTerms) {
      Alert.alert('Error', 'Please accept the Terms of Service and Privacy Policy');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        email: email.trim(),
        username: email.trim(),
        password,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: countryCode + phone,
      });
    } catch (error) {
      const detail = error.response?.data?.detail
        || (typeof error.response?.data === 'object'
          ? Object.values(error.response?.data || {}).flat().join(' ')
          : null);
      Alert.alert('Registration Failed', detail || 'Something went wrong');
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
              Create your account
            </Text>
            <Text style={[styles.subtitle, { color: '#64748b' }]}>
              Join ThinkValley Store in a few seconds
            </Text>
          </View>

        <View style={styles.formContainer}>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.inputLabel, { color: '#94a3b8' }]}>First name</Text>
              <View style={[styles.inputWrapper, { borderColor: '#e3e7ee', backgroundColor: '#fbfcfe' }]}>
                <Icon name="person-outline" size={18} color="#b4bcc8" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: '#1f2a37' }]}
                  placeholder="Enter first name"
                  placeholderTextColor="#94a3b8"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.inputLabel, { color: '#94a3b8' }]}>Last name</Text>
              <View style={[styles.inputWrapper, { borderColor: '#e3e7ee', backgroundColor: '#fbfcfe' }]}>
                <Icon name="person-outline" size={18} color="#b4bcc8" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: '#1f2a37' }]}
                  placeholder="Enter last name"
                  placeholderTextColor="#94a3b8"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: '#94a3b8' }]}>Email</Text>
            <View style={[styles.inputWrapper, { borderColor: '#e3e7ee', backgroundColor: '#fbfcfe' }]}>
              <Icon name="mail-outline" size={18} color="#b4bcc8" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: '#1f2a37' }]}
                placeholder="Enter email address"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: '#94a3b8' }]}>Phone</Text>
            <View style={styles.phoneGroup}>
              <View style={[styles.countrySelect, { borderColor: '#e3e7ee', backgroundColor: '#fbfcfe' }]}>
                <TextInput
                  style={[styles.countryInput, { color: '#1f2a37' }]}
                  value={countryCode}
                  onChangeText={setCountryCode}
                />
              </View>
              <View style={[styles.phoneInputWrapper, { borderColor: '#e3e7ee', backgroundColor: '#fbfcfe' }]}>
                <TextInput
                  style={[styles.input, { color: '#1f2a37' }]}
                  placeholder="Enter phone number"
                  placeholderTextColor="#94a3b8"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
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

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: '#94a3b8' }]}>Confirm Password</Text>
            <View style={[styles.inputWrapper, { borderColor: '#e3e7ee', backgroundColor: '#fbfcfe' }]}>
              <Icon name="shield-checkmark-outline" size={18} color="#b4bcc8" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: '#1f2a37' }]}
                placeholder="Re-enter password"
                placeholderTextColor="#94a3b8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>
          </View>

          <View style={styles.termsRow}>
            <TouchableOpacity onPress={() => setAcceptTerms(!acceptTerms)}>
              <View style={[styles.checkbox, acceptTerms && { backgroundColor: '#F47A20' }]}>
                {acceptTerms && <Icon name="checkmark" size={14} color="#fff" />}
              </View>
            </TouchableOpacity>
            <Text style={[styles.termsText, { color: '#64748b' }]}>
              I agree to the{' '}
              <Text style={[styles.termsLink, { color: '#D2620F' }]} onPress={openTerms}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={[styles.termsLink, { color: '#D2620F' }]} onPress={openPrivacy}>Privacy Policy</Text>
              <Text>.</Text>
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.registerButton, { backgroundColor: '#F47A20' }]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.registerButtonText}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
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

          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: '#64748b' }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.loginLink, { color: '#D2620F' }]}>Sign in</Text>
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
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  halfInput: {
    flex: 1,
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
  phoneGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  countrySelect: {
    width: 110,
    borderWidth: 1.5,
    borderRadius: 11,
    paddingHorizontal: 10,
    height: 50,
    justifyContent: 'center',
  },
  countryInput: {
    fontSize: 14,
  },
  phoneInputWrapper: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 11,
    paddingHorizontal: 14,
    height: 50,
    justifyContent: 'center',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 14,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#e3e7ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
  },
  termsLink: {
    fontWeight: '600',
  },
  registerButton: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 11,
    marginTop: 4,
  },
  registerButtonText: {
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 13,
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '700',
  },
});

export default RegisterScreen;
