import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions,KeyboardAvoidingView,
	Platform,
	TouchableWithoutFeedback,
	Keyboard, } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '@/components/CustomButton';
import {signInWithEmailAndPassword} from 'firebase/auth';
import {auth} from '@/lib/firebase';

const { width, height } = Dimensions.get('window');

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [loading, setLoading] = useState(false); // to disable button while loading
	const validateEmail = (email: string) => {
		const re = /\S+@\S+\.\S+/;
		return re.test(email);
	};

  const handleLogin = async () => {
	  if (!validateEmail(email)) {
		  setErrorMessage('Please enter a valid email address');
		  return;
	  }
	  if (!email || !password) {
		  setErrorMessage('Please enter both email and password');
		  return;
	  }

	  setLoading(true);
	  setErrorMessage('');
	  try {
		  const userCredential = await signInWithEmailAndPassword(auth, email, password);
		  console.log('Logged in user:', userCredential.user.uid);
		  // Navigate to quicknote tab after successful login
		  router.push('/(tabs)/personalLog');
	  } catch (error: any) {
		  let message = "Login failed. Please try again later";

		  switch (error.code) {
			  case "auth/invalid-email":
			  case "auth/wrong-password":
			  case "auth/invalid-credential":
				  message = "Invalid email or password";
				  break;
			  case "auth/user-disabled":
				  message = "User account has been disabled";
				  break;
			  case "auth/user-not-found":
				  message = "No account found with this email";
				  break;
		  }
		  console.log('Login failed:', message);
		  setErrorMessage(message);
	  } finally {
		  setLoading(false);
	  }
  };

  const handleForgotPassword = () => {
    router.push('/auth/forgotPassword')
  };

  return (
	  <KeyboardAvoidingView
		  style={{flex: 1,  backgroundColor: 'white' }}
		  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		  keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
	  >
	  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.container}>
      {/* Header with only back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View style={styles.form}>
        {/* Login Title */}
        <Text style={styles.title}>Login</Text>

	      {/* Error Message */}
	      {errorMessage ? (
		      <Text style={{color: 'red', marginBottom: 10}}>{errorMessage}</Text>
	      ) : null}

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#9BA1A6"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor="#9BA1A6"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={20}
                color="#9BA1A6"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <CustomButton
          title={loading? "Logging in...": "Login"}
          onPress={handleLogin}
          variant="primary"
          size="large"
          style={styles.loginButton}
          disabled={loading}
        />
      </View>
    </View>
	  </TouchableWithoutFeedback>
	  </KeyboardAvoidingView>
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
    paddingTop: 60,
    paddingHorizontal: 20,
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
  form: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 40,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
  loginButton: {
    width: '100%',
  },
});
