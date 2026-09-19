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
} from 'react-native';
import { authService } from '../../services/authService';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';

const ForgotPasswordScreen = ({ navigation }) => {
  const { colors, spacing, borderRadius, typography } = useTheme();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setStep(2);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    setIsLoading(true);
    try {
      await authService.verifyOTP(email, otp);
      setStep(3);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.detail || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(email, otp, newPassword);
      Alert.alert('Success', 'Password has been reset successfully', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
            <Icon name="lock-closed" size={60} color="#fff" />
          </View>
          <Text style={[styles.title, { color: colors.textPrimary, ...typography.h2 }]}>
            {step === 1 ? 'Forgot Password' : step === 2 ? 'Verify OTP' : 'Reset Password'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {step === 1
              ? 'Enter your email to receive a password reset code'
              : step === 2
              ? 'Enter the 6-digit code sent to your email'
              : 'Enter your new password'}
          </Text>
        </View>

        <View style={[styles.formContainer, { padding: spacing.lg }]}>
          {step === 1 && (
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Email Address</Text>
              <View style={[styles.inputWrapper, { borderColor: colors.borderColor }]}>
                <Icon name="mail-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>OTP Code</Text>
              <View style={[styles.inputWrapper, { borderColor: colors.borderColor }]}>
                <Icon name="key-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Enter 6-digit code"
                  placeholderTextColor={colors.textMuted}
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>New Password</Text>
              <View style={[styles.inputWrapper, { borderColor: colors.borderColor }]}>
                <Icon name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Min 8 characters"
                  placeholderTextColor={colors.textMuted}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary, borderRadius: borderRadius.full }]}
            onPress={step === 1 ? handleSendOTP : step === 2 ? handleVerifyOTP : handleResetPassword}
            disabled={isLoading}
          >
            <Text style={styles.actionButtonText}>
              {isLoading
                ? 'Processing...'
                : step === 1
                ? 'Send OTP'
                : step === 2
                ? 'Verify OTP'
                : 'Reset Password'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (step === 2) setStep(1);
              else if (step === 3) setStep(2);
              else navigation.goBack();
            }}
          >
            <Text style={[styles.backButtonText, { color: colors.primary }]}>
              {step === 1 ? 'Back to Login' : 'Back'}
            </Text>
          </TouchableOpacity>
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
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 50,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  actionButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;
