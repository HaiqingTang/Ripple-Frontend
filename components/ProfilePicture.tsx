import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/context/AppContext';
import ImagePickerModal from './ImagePickerModal';
import {
  pickImageFromGallery,
  takePicture,
  uploadProfilePicture,
  createDataUri,
  validateImageFile,
} from '@/lib/imageService';

interface ProfilePictureProps {
  size?: number;
  showEditButton?: boolean;
  onImageChange?: (dataUri: string) => void;
}

export default function ProfilePicture({
  size = 120,
  showEditButton = false,
  onImageChange,
}: ProfilePictureProps) {
  const { userId, profilePictureUrl, updateProfilePicture } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleEditPress = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleImageSelected = async (base64Data: string) => {
    setModalVisible(false);
    setUploading(true);

    try {
      // Validate userId before proceeding
      if (!userId || userId.trim() === '') {
        Alert.alert('Error', 'User not authenticated. Please try logging out and back in.');
        setUploading(false);
        return;
      }

      // Validate base64 data before upload
      if (!base64Data || base64Data.trim() === '') {
        Alert.alert('Error', 'Invalid image data. Please try again.');
        setUploading(false);
        return;
      }

      // Validate file size before upload
      const sizeInBytes = (base64Data.length * 3) / 4;
      const validation = validateImageFile(sizeInBytes);
      if (!validation.isValid) {
        Alert.alert('Error', validation.error || 'Image file is too large');
        setUploading(false);
        return;
      }

      const result = await uploadProfilePicture(base64Data);

      if (result.success && result.base64Data) {
        // Create consistent data URI format
        const dataUri = createDataUri(result.base64Data);

        // Update the profile picture in context with data URI
        updateProfilePicture(dataUri);

        // Call the callback if provided
        if (onImageChange) {
          onImageChange(dataUri);
        }

        Alert.alert('Success', 'Profile picture updated successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to save image');
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      Alert.alert('Error', 'Failed to update profile picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleTakePhoto = async () => {
    const result = await takePicture();
    if (result.success && result.base64) {
      await handleImageSelected(result.base64);
    } else if (result.canceled) {
      // User canceled camera
      setModalVisible(false);
    } else if (result.error) {
      // Actual error occurred - show error message
      Alert.alert('Error', result.error);
      setModalVisible(false);
    }
  };

  const handleChooseFromGallery = async () => {
    const result = await pickImageFromGallery();
    if (result.success && result.base64) {
      await handleImageSelected(result.base64);
    } else if (result.canceled) {
      // User canceled gallery selection
      setModalVisible(false);
    } else if (result.error) {
      // Actual error occurred - show error message
      Alert.alert('Error', result.error);
      setModalVisible(false);
    }
  };

  const containerStyle = [
    styles.container,
    { width: size, height: size, borderRadius: size / 2 },
  ];

  const placeholderStyle = [
    styles.placeholder,
    { width: size, height: size, borderRadius: size / 2 },
  ];

  const imageStyle = [
    styles.image,
    { width: size, height: size, borderRadius: size / 2 },
  ];

  const editButtonStyle = [
    styles.editButton,
    {
      width: size * 0.27,
      height: size * 0.27,
      borderRadius: size * 0.135,
      bottom: size * 0.04,
      right: size * 0.04,
    },
  ];

  return (
    <View style={containerStyle}>
      {profilePictureUrl ? (
        <Image
          source={{ uri: profilePictureUrl }}
          style={imageStyle}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={placeholderStyle}>
          <Ionicons name="person" size={size * 0.5} color="#8B4513" />
        </View>
      )}

      {uploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      )}

      {showEditButton && !uploading && (
        <TouchableOpacity
          style={editButtonStyle}
          onPress={handleEditPress}
          accessibilityLabel="Change profile picture"
          accessibilityRole="button"
        >
          <Ionicons name="camera" size={size * 0.13} color="#4A90E2" />
        </TouchableOpacity>
      )}

      <ImagePickerModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onTakePhoto={handleTakePhoto}
        onChooseFromGallery={handleChooseFromGallery}
        title="Change Profile Picture"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  placeholder: {
    backgroundColor: '#FFD4B3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    backgroundColor: '#F5F5F5',
  },
  editButton: {
    position: 'absolute',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 60,
  },
});