import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ScrollView, Modal, StyleSheet} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { v4 as uuidv4 } from 'uuid';

export default function CreatePostScreen() {
  const colorScheme = useColorScheme();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const router = useRouter();

  const handleGoBack = () => {
    // close post
    router.replace('/Interest/Discussion'); 
  };

  const handlePublish = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill in both title and content.');
      return;
    }
    setShowConfirmModal(true);
  }

  const confirmPublish = () => {
    const newPostId = uuidv4(); // create new post id 
    const post = {
      id: newPostId,
      title,
      content,
      createdAt: new Date().toISOString(),
    };
    setShowConfirmModal(false);

    router.push({
      pathname: '/Interest/Discussion/detail',
      params: post,  
    });
  };

  const handleImageSelect = () => {
    // add image
    Alert.alert('Add Image');
  };

  const handleAddressSelect = () => {
    // select address
    Alert.alert('Select Address');
  };

  // get colors
  const currentColorScheme = colorScheme ?? 'light';
  const colors = Colors[currentColorScheme];

  return (
    <ThemedView style={styles.container}>
      {/* head nevigation bar */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleGoBack}
          >
            <Ionicons 
              name="close" 
              size={24} 
              color={colors.tint} 
            />
          </TouchableOpacity>
                
          <View style={styles.centerTitle}>
            <ThemedText type="subtitle" style={styles.titleText}>
              Publish
            </ThemedText>
          </View>
                
          <TouchableOpacity 
            style={[
              styles.publishButton,
              { backgroundColor: colors.tint }
            ]}
            onPress={handlePublish}
          >
            <ThemedText style={styles.publishButtonText}>Publish</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* enter topic title */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: currentColorScheme === 'dark' ? '#333' : '#f5f5f5',
                color: currentColorScheme === 'dark' ? '#fff' : '#000',
                borderColor: currentColorScheme === 'dark' ? '#555' : '#ddd',
              }
            ]}
            placeholder="Enter topic title"
            placeholderTextColor={currentColorScheme === 'dark' ? '#888' : '#999'}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* enter content */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: currentColorScheme === 'dark' ? '#333' : '#f5f5f5',
                color: currentColorScheme === 'dark' ? '#fff' : '#000',
                borderColor: currentColorScheme === 'dark' ? '#555' : '#ddd',
              }
            ]}
            placeholder="Enter your thoughts"
            placeholderTextColor={currentColorScheme === 'dark' ? '#888' : '#999'}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* "add image button" */}
        <TouchableOpacity 
          style={[
            styles.actionButton,
            { borderColor: colors.tint }
          ]}
          onPress={handleImageSelect}
        >
          <ThemedText style={{ color: colors.tint }}>
              Add Image
          </ThemedText>
        </TouchableOpacity>

        {/* image preview */}
        {image && (
        <Image source={{ uri: image }} style={styles.imagePreview} />
        )}

        {/* "select address" button */}
        <TouchableOpacity 
          style={[
            styles.actionButton,
            { borderColor: colors.tint }
          ]}
          onPress={handleAddressSelect}
        >
          <ThemedText style={{ color: colors.tint }}>
            Select Address
          </ThemedText>
        </TouchableOpacity>

        {/* show address */}
        {address ? (
        <ThemedText style={styles.addressText}>{address}</ThemedText>
        ) : null}
      </ScrollView>

      {/* confirmation pop-up */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
        <ThemedView style={styles.modalContent}>
          <ThemedText type="subtitle" style={styles.modalTitle}>
          Confirm Post
          </ThemedText>
          <ThemedText style={styles.modalMessage}>
          Are you sure you want to publish this post?
          </ThemedText>
                
          <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => setShowConfirmModal(false)}
          >
            <ThemedText>Cancel</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: colors.tint }]}
            onPress={confirmPublish}
          >
            <ThemedText style={styles.confirmButtonText}>Publish</ThemedText>
          </TouchableOpacity>
          </View>
        </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
  },
  header: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
  },
  headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
  },
  backButton: {
      padding: 8,
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
  },
  centerTitle: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
  },
  titleText: {
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
  },
  publishButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      minWidth: 80,
      alignItems: 'center',
  },
  publishButtonText: {
      color: '#fff',
      fontWeight: '600',
  },
  content: {
      flex: 1,
      padding: 16,
  },
  inputContainer: {
      marginBottom: 20,
  },
  input: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
  },
  textArea: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      minHeight: 120,
      textAlignVertical: 'top',
  },
  actionButton: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      marginBottom: 16,
  },
  imagePreview: {
      width: '100%',
      height: 200,
      borderRadius: 8,
      marginBottom: 16,
      resizeMode: 'cover',
  },
  addressText: {
      marginTop: 8,
      padding: 12,
      backgroundColor: 'rgba(0,0,0,0.05)',
      borderRadius: 8,
  },
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  modalContent: {
      width: '80%',
      padding: 24,
      borderRadius: 12,
      alignItems: 'center',
  },
  modalTitle: {
      marginBottom: 12,
      fontSize: 20,
  },
  modalMessage: {
      marginBottom: 24,
      textAlign: 'center',
  },
  modalButtons: {
      flexDirection: 'row',
      gap: 12,
  },
  modalButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
  },
  cancelButton: {
      backgroundColor: '#f0f0f0',
  },
  confirmButtonText: {
      color: '#fff',
      fontWeight: '600',
  },
});