import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '@/components/CustomButton';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ForgotPasswordPage() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [successMessage, setSuccessMessage] = useState('');
	const [loading, setLoading] = useState(false);

	const validateEmail = (email: string) => {
		const re = /\S+@\S+\.\S+/;
		return re.test(email);
	};

	const handleResetPassword = async () => {
		if (!validateEmail(email)) {
			setErrorMessage('Please enter a valid email address');
			return;
		}

		setLoading(true);
		setErrorMessage('');
		setSuccessMessage('');

		try {
			await sendPasswordResetEmail(auth, email);
			setSuccessMessage('A password reset link has been sent to your email address. Please check your inbox.');

			// Navigate back to login page after a delay
			setTimeout(() => {
				router.back();
			}, 3000);

		} catch (error: any) {
			let message = 'Failed to send reset email. Please try again.';

			switch (error.code) {
				case 'auth/user-not-found':
					message = 'No account found with this email address';
					break;
				case 'auth/invalid-email':
					message = 'Please enter a valid email address';
					break;
				case 'auth/too-many-requests':
					message = 'Too many requests. Please wait before trying again.';
					break;
			}

			setErrorMessage(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView
			style={{flex: 1, backgroundColor: 'white'}}
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
						{/* Forgot Password Title */}
						<Text style={styles.title}>Forgot Password</Text>

						{/* Error Message */}
						{errorMessage ? (
							<Text style={{color: 'red', marginBottom: 10}}>{errorMessage}</Text>
						) : null}

						{/* Success Message */}
						{successMessage ? (
							<Text style={{color: '#4CAF50', marginBottom: 10}}>{successMessage}</Text>
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

						{/* Reset Password Button */}
						<CustomButton
							title={loading ? "Sending..." : "Email reset password link"}
							onPress={handleResetPassword}
							variant="primary"
							size="large"
							style={styles.resetButton}
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
	resetButton: {
		width: '100%',
	},
});