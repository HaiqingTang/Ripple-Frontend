import React, { useState } from 'react';
import {
	View,
	ScrollView,
	Text,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	Dimensions,
	KeyboardAvoidingView,
	Platform,
	TouchableWithoutFeedback,
	Keyboard,
	Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '@/components/CustomButton';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, deleteUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setDoc, doc } from "@firebase/firestore";

const { width, height } = Dimensions.get('window');

// Reusable Password Input Component
interface PasswordInputProps {
	label: string;
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
	showPassword: boolean;
	onTogglePassword: () => void;
	helperText?: string;
	autoComplete?: 'off' | 'password' | 'new-password';
}

const PasswordInput: React.FC<PasswordInputProps> = ({
	                                                     label,
	                                                     value,
	                                                     onChangeText,
	                                                     placeholder = "••••••••",
	                                                     showPassword,
	                                                     onTogglePassword,
	                                                     helperText,
	                                                     autoComplete = 'new-password'
                                                     }) => (
	<View style={styles.inputContainer}>
		<Text style={styles.label}>{label}</Text>
		<View style={styles.passwordContainer}>
			<TextInput
				style={styles.passwordInput}
				placeholder={placeholder}
				placeholderTextColor="#9BA1A6"
				value={value}
				onChangeText={onChangeText}
				secureTextEntry={!showPassword}
				autoCapitalize="none"
				autoCorrect={false}
				autoComplete={autoComplete}
			/>
			<TouchableOpacity
				onPress={onTogglePassword}
				style={styles.eyeButton}
			>
				<Ionicons
					name={showPassword ? 'eye' : 'eye-off'}
					size={20}
					color="#9BA1A6"
				/>
			</TouchableOpacity>
		</View>
		{helperText && <Text style={styles.helperText}>{helperText}</Text>}
	</View>
);

export default function SignUpPage() {
	const router = useRouter();
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [organization, setOrganization] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [loading, setLoading] = useState(false);

	// Clear error message when user starts typing
	const handleInputChange = (setter: (value: string) => void) => (text: string) => {
		if (errorMessage) setErrorMessage('');
		setter(text);
	};

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
		if (!email.trim()) {
			setErrorMessage('Please enter your email');
			return false;
		}
		if (!validateEmail(email.trim())) {
			setErrorMessage('Please enter a valid email address');
			return false;
		}
		if (!password) {
			setErrorMessage('Please enter a password');
			return false;
		}
		if (!validatePassword(password)) {
			setErrorMessage('Password must contain at least 8 characters');
			return false;
		}
		if (password !== confirmPassword) {
			setErrorMessage('Passwords do not match');
			return false;
		}
		return true;
	};

	// Handle signup with proper error handling and rollback
	const handleSignUp = async () => {
		if (!validateForm()) {
			return;
		}

		setLoading(true);
		setErrorMessage('');

		let userCredential: any = null;

		try {
			// Normalize and trim inputs
			const normalizedEmail = email.trim().toLowerCase();
			const trimmedFirstName = firstName.trim();
			const trimmedLastName = lastName.trim();
			const trimmedOrganization = organization.trim();
			const fullName = `${trimmedFirstName} ${trimmedLastName}`;

			// Create user account
			userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
			const { user } = userCredential;

			// Update user profile with name
			await updateProfile(user, {
				displayName: fullName,
			});
			await refreshUserData();

			// Send email verification
			await sendEmailVerification(user);
			Alert.alert('Verification Required', 'A verification link has been sent to your email. Please verify your email before logging in.');

			// Prepare user data for Firestore
			const userData: any = {
				name: fullName,
				email: normalizedEmail,
			};

			// Only add organization if it exists
			if (trimmedOrganization) {
				userData.organization = trimmedOrganization;
			}

			// Use setDoc with uid as document ID for better data consistency
			await setDoc(doc(db, "users", user.uid), userData);

			console.log('Account created for:', user.uid);

			// Navigate to login page after successful signup
			router.push('/auth/login');
		} catch (error: any) {
			// If Firestore write fails but user was created, clean up the auth user
			if (userCredential?.user && error.code !== 'auth/email-already-in-use') {
				try {
					await deleteUser(userCredential.user);
					console.log('Cleaned up user account after Firestore failure');
				} catch (deleteError) {
					console.error('Failed to clean up user account:', deleteError);
				}
			}

			let message = 'Account creation failed. Please try again later';

			switch (error?.code) {
				case 'auth/email-already-in-use':
					message = 'An account with this email already exists';
					break;
				case 'auth/invalid-email':
					message = 'Invalid email address';
					break;
				case 'auth/operation-not-allowed':
					message = 'Email/password accounts are not enabled';
					break;
				case 'auth/weak-password':
					message = 'Password is too weak. Please choose a stronger password';
					break;
				default:
					console.log('Signup error:', error?.message || error);
					message = 'Account creation failed. Please try again later';
			}

			console.log('Signup failed:', message);
			setErrorMessage(message);
		} finally {
			setLoading(false);
		}
	};

	const handleTermsPress = () => {
		// TODO: Navigate to terms of service page
		// Consider adding router.push('/legal/terms') when page is ready
		console.log('Terms of Service pressed');
	};

	const handlePrivacyPress = () => {
		// TODO: Navigate to privacy policy page
		// Consider adding router.push('/legal/privacy') when page is ready
		console.log('Privacy Policy pressed');
	};

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
			>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<ScrollView
						style={styles.container}
						contentContainerStyle={{ flexGrow: 1 }}
						keyboardShouldPersistTaps="handled"
						showsVerticalScrollIndicator={false}
					>
						<View style={styles.container}>
							{/* Header with back button */}
							<View style={styles.header}>
								<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
									<Ionicons name="arrow-back" size={24} color="#2C3E50" />
								</TouchableOpacity>
							</View>

							{/* Form */}
							<View style={styles.form}>
								<Text style={styles.title}>Sign up</Text>

								{/* Error Message */}
								{errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

								{/* Name Fields - Side by Side */}
								<View style={styles.nameContainer}>
									<View style={styles.nameInputContainer}>
										<Text style={styles.label}>First Name</Text>
										<TextInput
											style={styles.input}
											placeholder="John"
											placeholderTextColor="#9BA1A6"
											value={firstName}
											onChangeText={handleInputChange(setFirstName)}
											autoCapitalize="words"
											autoCorrect={false}
										/>
									</View>

									<View style={styles.nameInputContainer}>
										<Text style={styles.label}>Last Name</Text>
										<TextInput
											style={styles.input}
											placeholder="Doe"
											placeholderTextColor="#9BA1A6"
											value={lastName}
											onChangeText={handleInputChange(setLastName)}
											autoCapitalize="words"
											autoCorrect={false}
										/>
									</View>
								</View>

								{/* Organization Input */}
								<View style={styles.inputContainer}>
									<Text style={styles.label}>Organization (Optional)</Text>
									<TextInput
										style={styles.input}
										placeholder="Enter your organization"
										placeholderTextColor="#9BA1A6"
										value={organization}
										onChangeText={handleInputChange(setOrganization)}
										autoCapitalize="none"
										autoCorrect={false}
									/>
								</View>

								{/* Email Input */}
								<View style={styles.inputContainer}>
									<Text style={styles.label}>E-mail</Text>
									<TextInput
										style={styles.input}
										placeholder="Enter your email"
										placeholderTextColor="#9BA1A6"
										value={email}
										onChangeText={handleInputChange(setEmail)}
										keyboardType="email-address"
										autoCapitalize="none"
										autoCorrect={false}
									/>
								</View>

								{/* Password Input - Using reusable component */}
								<PasswordInput
									label="Password"
									value={password}
									onChangeText={handleInputChange(setPassword)}
									showPassword={showPassword}
									onTogglePassword={() => setShowPassword(!showPassword)}
									helperText="must contain at least 8 characters"
									autoComplete="new-password"
								/>

								{/* Confirm Password Input - Using reusable component */}
								<PasswordInput
									label="Confirm Password"
									value={confirmPassword}
									onChangeText={handleInputChange(setConfirmPassword)}
									showPassword={showConfirmPassword}
									onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
									autoComplete="off"
								/>

								{/* Create Account Button */}
								<CustomButton
									title={loading ? 'Creating Account...' : 'Create Account'}
									onPress={handleSignUp}
									variant="primary"
									size="large"
									style={styles.signupButton}
									disabled={loading}
								/>

								{/* Terms and Privacy Policy */}
								<View style={styles.termsContainer}>
									<Text style={styles.termsText}>By continuing, you agree to our </Text>
									<TouchableOpacity onPress={handleTermsPress}>
										<Text style={styles.termsLink}>Terms of Service</Text>
									</TouchableOpacity>
									<Text style={styles.termsText}> and </Text>
									<TouchableOpacity onPress={handlePrivacyPress}>
										<Text style={styles.termsLink}>Privacy Policy</Text>
									</TouchableOpacity>
									<Text style={styles.termsText}>.</Text>
								</View>
							</View>
						</View>
					</ScrollView>
				</TouchableWithoutFeedback>
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
	form: {
		flex: 1,
		paddingTop: 20,
		paddingHorizontal: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#2C3E50',
		textAlign: 'center',
		marginBottom: 40,
	},
	errorText: {
		color: 'red',
		marginBottom: 10,
		textAlign: 'center',
	},
	nameContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 24,
	},
	nameInputContainer: {
		flex: 0.48,
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
	helperText: {
		fontSize: 12,
		color: '#9BA1A6',
		marginTop: 4,
	},
	signupButton: {
		width: '100%',
		marginTop: 32,
		marginBottom: 24,
	},
	termsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		paddingHorizontal: 20,
	},
	termsText: {
		fontSize: 14,
		color: '#9BA1A6',
		textAlign: 'center',
	},
	termsLink: {
		fontSize: 14,
		color: '#4A90E2',
		textDecorationLine: 'underline',
	},
});