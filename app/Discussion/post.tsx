import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Modal,
  StyleSheet,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAppContext } from "@/context/AppContext";
import { useDiscussion } from "./_layout";
import * as ImageManipulator from "expo-image-manipulator";
import { COLORS } from "@/styles/sharedStyles";

export default function CreatePostScreen() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const router = useRouter();

  // Get user details from global context
  const { userId, fullName } = useAppContext();
  
  // Get addPost from discussion context
  const { addPost } = useDiscussion();

  // Back to discussion/search page
  const handleGoBack = () => {
    if (isPublishing) return; // avoid leaving while posting
    router.back();
  };

  // Pop-up window for publish confirmation
  const handlePublish = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Error", "Please fill in both title and content.");
      return;
    }
    setShowConfirmModal(true);
  };

  // Confirm publish
  const confirmPublish = async () => {
    if (isPublishing) return; // Prevent double-click
  
    setIsPublishing(true);
  
    try {
      // Extract base64 data from the image URI if an image is selected
      let base64Image = null;
      if (image) {
        const match = image.match(/^data:image\/[a-z]+;base64,(.+)$/);
        if (match && match[1]) {
          base64Image = match[1]; // Extract the base64 string
        }
      }
  
      // Add the image base64 string to the post data
      const newPost = await addPost({
        title,
        content,
        authorId: userId,
        author: fullName,
        imageBase64: base64Image ?? undefined,
      });
  
      setShowConfirmModal(false);

      Alert.alert(
        "Published",
        "Your post has been published successfully.",
        [
          {
            text: "View post",
            onPress: () =>
              router.replace({
                pathname: "/Discussion/detail",
                params: { id: newPost.id },
              }),
          },
          {
            text: "Back to list",
            onPress: () => router.replace("/Discussion"),
          },
        ],
        { cancelable: false }
      );

      setTitle("");
      setContent("");
      setImage(null);
      setAddress("");
    } catch (error) {
      console.error("Error publishing post:", error);
      Alert.alert("Error", "Failed to publish the post. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  // Select image
  const handleImageSelect = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];

      try {
        // Resize and compress the image
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: 800 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        // Convert the manipulated image to base64
        const response = await fetch(manipulatedImage.uri);
        const blob = await response.blob();
        const reader = new FileReader();

        reader.onloadend = () => {
          const base64String = (reader.result as string).split(",")[1]; // Extract base64 part
          
          if (base64String.length > 1048487) {
            Alert.alert(
              "Error",
              "The selected image is too large. Please choose a smaller image."
            );
            return;
          }

          setImage(`data:image/jpeg;base64,${base64String}`);
        };

        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Error resizing image:", error);
        Alert.alert("Error", "Failed to process the image. Please try again.");
      }
    }
  };

  // Select address
  const handleAddressSelect = () => {
    setAddress(address);
    setShowAddressModal(true);
  };

  const confirmAddressInput = () => {
    if (address.trim()) {
      setAddress(address.trim());
    }
    setShowAddressModal(false);
  };

  const cancelAddressInput = () => {
    setShowAddressModal(false);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Head navigation bar */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack} disabled={isPublishing}>
            <Ionicons name="close" size={24} color={COLORS.primary} />
          </TouchableOpacity>

          <View style={styles.centerTitle}>
            <ThemedText type="subtitle" style={styles.titleText}>
              Publish
            </ThemedText>
          </View>

          <TouchableOpacity
            style={[styles.publishButton, { backgroundColor: COLORS.primary }]}
            onPress={handlePublish}
            disabled={isPublishing}
          >
            <ThemedText style={styles.publishButtonText}>
              {isPublishing ? "Publishing..." : "Publish"}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Input post content */}
      <ScrollView style={styles.content}>
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: "#f5f5f5",
                color: "#000",
                borderColor: "#ddd",
              },
            ]}
            placeholder="Enter topic title"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: "#f5f5f5",
                color: "#000",
                borderColor: "#ddd",
              },
            ]}
            placeholder="Enter your thoughts"
            placeholderTextColor="#999"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Add image */}
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: COLORS.primary }]}
          onPress={handleImageSelect}
          disabled={isPublishing}
        >
          <ThemedText style={{ color: COLORS.primary }}>Add Image</ThemedText>
        </TouchableOpacity>

        {/* Conditionally render the image */}
        {image && (
          <Image 
            source={{ uri: image }} 
            style={styles.imagePreview} 
          />
        )}

        {/* Add address */}
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: COLORS.primary }]}
          onPress={handleAddressSelect}
          disabled={isPublishing}
        >
          <ThemedText style={{ color: COLORS.primary }}>Select Address</ThemedText>
        </TouchableOpacity>

        {address ? (
          <ThemedText style={styles.addressText}>{address}</ThemedText>
        ) : null}
      </ScrollView>

      {/* Confirmation pop-up */}
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
                disabled={isPublishing}
              >
                <ThemedText>Cancel</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  { 
                    backgroundColor: COLORS.primary,
                    opacity: isPublishing ? 0.6 : 1
                  }
                ]}
                onPress={confirmPublish}
                disabled={isPublishing}
              >
                <ThemedText style={styles.confirmButtonText}>
                  {isPublishing ? "Publishing..." : "Publish"}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>

      {/* Add address pop-up */}
      <Modal
        visible={showAddressModal}
        transparent
        animationType="slide"
        onRequestClose={cancelAddressInput}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              Enter Address
            </ThemedText>
            <ThemedText style={styles.modalMessage}>
              Please enter the post location:
            </ThemedText>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: "#f5f5f5",
                  color: "#000",
                  borderColor: "#ddd",
                  marginBottom: 20,
                },
              ]}
              placeholder="Enter address here..."
              placeholderTextColor="#999"
              value={address}
              onChangeText={setAddress}
              autoFocus={true}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelAddressInput}
              >
                <ThemedText>Cancel</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: COLORS.primary }]}
                onPress={confirmAddressInput}
              >
                <ThemedText style={styles.confirmButtonText}>Confirm</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 10, borderBottomWidth: 1, borderColor: "#ccc" },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: { padding: 5 },
  centerTitle: { flex: 1, alignItems: "center" },
  titleText: { fontWeight: "bold" },
  publishButton: { padding: 6, borderRadius: 8 },
  publishButtonText: { color: "#fff", fontWeight: "bold" },
  content: { padding: 10 },
  inputContainer: { marginBottom: 10 },
  input: { padding: 10, borderRadius: 8, borderWidth: 1 },
  textArea: { padding: 10, borderRadius: 8, borderWidth: 1, minHeight: 100 },
  actionButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    alignItems: "center",
  },
  imagePreview: { width: "100%", height: 200, marginTop: 10, borderRadius: 8 },
  addressText: { marginTop: 10, fontStyle: "italic" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  modalTitle: { fontWeight: "bold", marginBottom: 10 },
  modalMessage: { marginBottom: 20 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  modalButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: { backgroundColor: "#ddd" },
  confirmButtonText: { color: "#fff", fontWeight: "bold" },
});