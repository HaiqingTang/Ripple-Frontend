// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import {getFirestore} from "@firebase/firestore";

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
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);