import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import rippleLogo from '@/assets/images/ripple-logo.png';
import CustomButton from '../components/CustomButton';

const { width, height } = Dimensions.get('window');

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleSignUp = () => {
    router.push('/auth/signup');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Water Drop Icon */}
        <View style={styles.logoContainer}>
          <Image source={rippleLogo} style={styles.logoImage} />
        </View>

        {/* Main Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>
            Let your drop{'\n'}make a{'\n'}
            <Text style={styles.rippleText}>RIPPLE</Text>
          </Text>
        </View>

        {/* Conditional rendering based on login state */}
        {!isLoggedIn ? (
          <>
            {/* Login Button */}
            <CustomButton
              title="Log In"
              onPress={handleLogin}
              variant="primary"
              size="large"
              style={styles.loginButton}
            />

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={handleSignUp}>
                <Text style={styles.signUpLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B9D9F7',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 60,
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  messageContainer: {
    marginBottom: 80,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    lineHeight: 40,
  },
  rippleText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  loginButton: {
    width: '100%',
    marginBottom: 30,
  },
  signUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 16,
    color: '#5A6C7D',
  },
  signUpLink: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: '600',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 40,
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 20,
  },
  logoutText: {
    fontSize: 16,
    color: '#5A6C7D',
    textDecorationLine: 'underline',
  },
});
