
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
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAppContext } from "@/context/AppContext";
import { useDiscussion } from "./_layout";

export default function CreatePostScreen() {
  const colorScheme = useColorScheme();
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
    router.replace("/Discussion");
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
      // Use the addPost function from context which handles Firebase and state updates
      const newPost = await addPost({
        title,
        content,
        authorId: userId,
        author: fullName,
      });

      console.log("New Post ID:", newPost.id);

      setShowConfirmModal(false);
      
      // Navigate to the post detail page with the actual Firebase-generated ID
      router.replace({
        pathname: "/Discussion/detail",
        params: { id: newPost.id },
      });
    } catch (error) {
      console.error("Error publishing post:", error);
      Alert.alert("Error", "Failed to publish the post. Please try again.");
      setIsPublishing(false);
    }
  };

  // Select image
  const handleImageSelect = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
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

  const currentColorScheme = colorScheme ?? "light";
  const colors = Colors[currentColorScheme];

  return (
    <ThemedView style={styles.container}>
      {/* Head navigation bar */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="close" size={24} color={colors.tint} />
          </TouchableOpacity>

          <View style={styles.centerTitle}>
            <ThemedText type="subtitle" style={styles.titleText}>
              Publish
            </ThemedText>
          </View>

          <TouchableOpacity
            style={[styles.publishButton, { backgroundColor: colors.tint }]}
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
                backgroundColor:
                  currentColorScheme === "dark" ? "#333" : "#f5f5f5",
                color: currentColorScheme === "dark" ? "#fff" : "#000",
                borderColor:
                  currentColorScheme === "dark" ? "#555" : "#ddd",
              },
            ]}
            placeholder="Enter topic title"
            placeholderTextColor={
              currentColorScheme === "dark" ? "#888" : "#999"
            }
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor:
                  currentColorScheme === "dark" ? "#333" : "#f5f5f5",
                color: currentColorScheme === "dark" ? "#fff" : "#000",
                borderColor:
                  currentColorScheme === "dark" ? "#555" : "#ddd",
              },
            ]}
            placeholder="Enter your thoughts"
            placeholderTextColor={
              currentColorScheme === "dark" ? "#888" : "#999"
            }
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Add image */}
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: colors.tint }]}
          onPress={handleImageSelect}
        >
          <ThemedText style={{ color: colors.tint }}>Add Image</ThemedText>
        </TouchableOpacity>

        {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

        {/* Add address */}
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: colors.tint }]}
          onPress={handleAddressSelect}
        >
          <ThemedText style={{ color: colors.tint }}>Select Address</ThemedText>
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
                    backgroundColor: colors.tint,
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
                  backgroundColor:
                    currentColorScheme === "dark" ? "#333" : "#f5f5f5",
                  color: currentColorScheme === "dark" ? "#fff" : "#000",
                  borderColor:
                    currentColorScheme === "dark" ? "#555" : "#ddd",
                  marginBottom: 20,
                },
              ]}
              placeholder="Enter address here..."
              placeholderTextColor={
                currentColorScheme === "dark" ? "#888" : "#999"
              }
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
                style={[styles.modalButton, { backgroundColor: colors.tint }]}
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