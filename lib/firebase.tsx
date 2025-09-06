// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import Constants from 'expo-constants';

const firebaseConfig = {
	apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
	authDomain: Constants.expoConfig?.extra?.authDomain,
	projectId: Constants.expoConfig?.extra?.projectId,
	storageBucket: Constants.expoConfig?.extra?.storageBucket,
	appId: Constants.expoConfig?.extra?.appId,
	measurementId: Constants.expoConfig?.extra?.measurementId,
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);