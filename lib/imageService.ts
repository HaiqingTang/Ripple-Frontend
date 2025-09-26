import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface ImagePickerResult {
  success: boolean;
  imageUri?: string;
  error?: string;
}

export interface ImageUploadResult {
  success: boolean;
  base64Data?: string;
  error?: string;
}

const MAX_IMAGE_SIZE = 600;
const MAX_BASE64_SIZE = 700 * 1024; // ~700KB to account for Base64 overhead and stay under 1MB Firestore limit

// Helper function to find user document by userId field
const findUserDocument = async (userId: string): Promise<string | null> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    if (querySnapshot.docs.length > 1) {
      console.warn('Multiple user documents found for userId:', userId);
    }

    return querySnapshot.docs[0].id;
  } catch (error) {
    console.error('Error finding user document:', error);
    return null;
  }
};

export const requestPermissions = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    return false;
  }

  const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
  if (cameraPermission.status !== 'granted') {
    return false;
  }

  return true;
};

export const pickImageFromGallery = async (): Promise<ImagePickerResult> => {
  try {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      return { success: false, error: 'Permission denied to access photos' };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) {
      return { success: false, error: 'User cancelled image selection' };
    }

    const imageUri = result.assets[0].uri;
    const processedUri = await compressImage(imageUri);

    return { success: true, imageUri: processedUri };
  } catch (error) {
    console.error('Error picking image from gallery:', error);
    return { success: false, error: 'Failed to pick image from gallery' };
  }
};

export const takePicture = async (): Promise<ImagePickerResult> => {
  try {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      return { success: false, error: 'Permission denied to access camera' };
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) {
      return { success: false, error: 'User cancelled camera' };
    }

    const imageUri = result.assets[0].uri;
    const processedUri = await compressImage(imageUri);

    return { success: true, imageUri: processedUri };
  } catch (error) {
    console.error('Error taking picture:', error);
    return { success: false, error: 'Failed to take picture' };
  }
};

const compressImage = async (uri: string): Promise<string> => {
  try {
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: MAX_IMAGE_SIZE, height: MAX_IMAGE_SIZE } }],
      { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
    );

    return manipulatedImage.uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    return uri;
  }
};

const convertToBase64 = async (imageUri: string): Promise<string> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64',
    });
    return base64;
  } catch (error) {
    console.error('Error converting image to Base64:', error);
    throw error;
  }
};

const validateBase64Size = (base64String: string): { isValid: boolean; error?: string } => {
  const sizeInBytes = (base64String.length * 3) / 4; // Approximate Base64 size calculation
  if (sizeInBytes > MAX_BASE64_SIZE) {
    return {
      isValid: false,
      error: 'Image is too large. Please choose a smaller image or reduce quality.',
    };
  }
  return { isValid: true };
};

export const uploadProfilePicture = async (
  imageUri: string,
  userId: string
): Promise<ImageUploadResult> => {
  try {
    if (!auth.currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    // Use the actual authenticated user ID instead of the passed parameter
    const authenticatedUserId = auth.currentUser.uid;

    // Validate the authenticated user ID
    if (!authenticatedUserId || authenticatedUserId.trim() === '') {
      return { success: false, error: 'Invalid user authentication' };
    }

    // Convert image to Base64
    const base64Data = await convertToBase64(imageUri);

    // Validate Base64 size
    const sizeValidation = validateBase64Size(base64Data);
    if (!sizeValidation.isValid) {
      return { success: false, error: sizeValidation.error };
    }

    // Find the actual document ID for this user
    const documentId = await findUserDocument(authenticatedUserId);
    if (!documentId) {
      return { success: false, error: 'User profile not found. Please contact support.' };
    }

    // Save Base64 data to the correct user document
    const userDocRef = doc(db, 'users', documentId);
    await setDoc(
      userDocRef,
      {
        profilePictureBase64: base64Data,
        profilePictureUpdatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return { success: true, base64Data };
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return { success: false, error: 'Failed to save image. Please try again.' };
  }
};

export const deleteProfilePicture = async (): Promise<boolean> => {
  try {
    if (!auth.currentUser) {
      return false;
    }

    // Use the actual authenticated user ID instead of the passed parameter
    const authenticatedUserId = auth.currentUser.uid;

    // Validate the authenticated user ID
    if (!authenticatedUserId || authenticatedUserId.trim() === '') {
      return false;
    }

    // Find the actual document ID for this user
    const documentId = await findUserDocument(authenticatedUserId);
    if (!documentId) {
      return false;
    }

    // Remove Base64 data from the correct user document
    const userDocRef = doc(db, 'users', documentId);
    await setDoc(
      userDocRef,
      {
        profilePictureBase64: null,
        profilePictureUpdatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return true;
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    return false;
  }
};

export const createDataUri = (base64String: string): string => {
  return `data:image/jpeg;base64,${base64String}`;
};

export const validateImageFile = (fileSize: number): { isValid: boolean; error?: string } => {
  if (fileSize > MAX_BASE64_SIZE) {
    return { isValid: false, error: 'Image file too large. Please choose a smaller image.' };
  }
  return { isValid: true };
};