import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '@/components/CustomButton';
import { useAppContext } from '@/context/AppContext';
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  verifyBeforeUpdateEmail
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import ProfilePicture from '@/components/ProfilePicture';

export default function EditProfilePage() {
  const router = useRouter();
  const { refreshUserData } = useAppContext();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Load current user data
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const displayName = user.displayName || '';
      const nameParts = displayName.split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setCurrentEmail(user.email || '');
      setNewEmail(''); 
    }
  }, []);

  // Validation functions
  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const validateForm = () => {
    if (!firstName.trim()) {
      setErrorMessage('Please enter your first name');
      return false;
    }
    if (!lastName.trim()) {
      setErrorMessage('Please enter your last name');
      return false;
    }
    // Only validate new email if user wants to change it
    if (newEmail && !validateEmail(newEmail)) {
      setErrorMessage('Please enter a valid new email address');
      return false;
    }
    if (newPassword && !validatePassword(newPassword)) {
      setErrorMessage('New password must contain at least 8 characters');
      return false;
    }
    // Require current password for password or email changes
    if ((newPassword || (newEmail && newEmail !== currentEmail)) && !currentPassword) {
      setErrorMessage('Current password is required to change password or email');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const user = auth.currentUser;
      if (!user) {
        setErrorMessage('No user is currently signed in');
        return;
      }

      // Check if we need to reauthenticate (for password or email changes)
      const needsReauth = newPassword || (newEmail && newEmail !== user.email);

      if (needsReauth && !currentPassword) {
        setErrorMessage('Current password is required to change password or email');
        return;
      }

      // Reauthenticate if needed for password changes
      if (needsReauth) {
        const credential = EmailAuthProvider.credential(user.email!, currentPassword);
        await reauthenticateWithCredential(user, credential);
      }

      // Update display name
      const newDisplayName = `${firstName.trim()} ${lastName.trim()}`.trim();
      if (newDisplayName !== user.displayName) {
        await updateProfile(user, { displayName: newDisplayName });
      }

      // Send email verification if new email is provided
      let emailVerificationSent = false;
      if (newEmail && newEmail !== user.email) {
        await verifyBeforeUpdateEmail(user, newEmail);
        emailVerificationSent = true;
      }

      // Update password if provided
      if (newPassword) {
        await updatePassword(user, newPassword);
      }

      // Refresh user data in AppContext to update UI immediately
      refreshUserData();

      // Show different success message based on whether email verification was sent
      const successTitle = 'Profile Updated';
      const successMessage = emailVerificationSent
        ? `Profile updated successfully!\n\nA verification email has been sent to ${newEmail}. Please check your email and click the verification link to complete the email change.`
        : 'Profile updated successfully!';

      Alert.alert(
        successTitle,
        successMessage,
        [
          {
            text: 'OK',
            onPress: () => router.push('/(tabs)/profile')
          }
        ]
      );
    } catch (error: any) {
      let message = 'Failed to update profile. Please try again.';

      switch (error.code) {
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          message = 'Current password is incorrect';
          break;
        case 'auth/requires-recent-login':
          message = 'For security reasons, please enter your current password to make this change';
          break;
        case 'auth/email-already-in-use':
          message = 'This email is already registered to another account';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email address format';
          break;
        case 'auth/weak-password':
          message = 'New password is too weak';
          break;
        case 'auth/user-not-found':
          message = 'User account not found';
          break;
        default:
          console.log('Profile update error:', error.code, error.message);
          message = `Update failed: ${error.message}`;
      }

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
            {/* Header with back button */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>

            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Profile</Text>
              <Text style={styles.subtitle}>Customize your RIPPLE profile.</Text>
            </View>

            {/* Profile Picture Section */}
            <View style={styles.profilePictureSection}>
              <ProfilePicture size={120} showEditButton={true} />
            </View>

            {/* Form Section */}
            <View style={styles.form}>
              {/* Error Message */}
              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

              {/* First Name */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

              {/* Last Name */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

              {/* Current Email Address (Read-only) */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Current Email</Text>
                <TextInput
                  style={[styles.input, styles.readOnlyInput]}
                  value={currentEmail}
                  editable={false}
                  selectTextOnFocus={false}
                />
              </View>

              {/* New Email Address */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>New Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter new email (optional)"
                  placeholderTextColor="#9BA1A6"
                  value={newEmail}
                  onChangeText={setNewEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Text style={styles.helperText}>Leave empty to keep current email</Text>
              </View>

              {/* Current Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Current Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter current password"
                    placeholderTextColor="#9BA1A6"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry={!showCurrentPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showCurrentPassword ? 'eye' : 'eye-off'}
                      size={20}
                      color="#9BA1A6"
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.helperText}>Required when changing password or email</Text>
              </View>

              {/* New Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter new password (optional)"
                    placeholderTextColor="#9BA1A6"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showNewPassword ? 'eye' : 'eye-off'}
                      size={20}
                      color="#9BA1A6"
                    />
                  </TouchableOpacity>
                </View>
                {newPassword ? (
                  <Text style={styles.helperText}>must contain at least 8 characters</Text>
                ) : null}
              </View>

              {/* Confirm Button */}
              <CustomButton
                title={loading ? 'Updating...' : 'Confirm'}
                onPress={handleSave}
                variant="primary"
                size="large"
                style={styles.confirmButton}
                disabled={loading}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9BA1A6',
    textAlign: 'center',
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2C3E50',
    backgroundColor: 'white',
  },
  readOnlyInput: {
    backgroundColor: '#F5F5F5',
    color: '#666',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2C3E50',
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  helperText: {
    fontSize: 12,
    color: '#9BA1A6',
    marginTop: 4,
  },
  confirmButton: {
    width: '100%',
    marginTop: 32,
    marginBottom: 24,
  },
});