import { AppTheme } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateStatusScreen() {
  const { state } = useAuth();
  const [caption, setCaption] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please grant camera roll permissions");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please grant camera permissions");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handlePostStatus = () => {
    if (!selectedImage && !caption) {
      Alert.alert("Error", "Please add an image or caption");
      return;
    }
    // In a real app, this would upload to the server
    Alert.alert("Success", "Status posted!");
    router.back();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>My Status</Text>
          <TouchableOpacity onPress={handlePostStatus} disabled={!selectedImage && !caption}>
            <Text style={[styles.postButton, (!selectedImage && !caption) && styles.postButtonDisabled]}>
              Post
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.preview} />
        ) : (
          <View style={styles.placeholder}>
            <MaterialCommunityIcons name="camera-plus" size={64} color="#00A884" />
            <Text style={styles.placeholderText}>Add photo/video</Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
            <MaterialCommunityIcons name="image" size={24} color="#00A884" />
            <Text style={styles.actionText}>Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
            <MaterialCommunityIcons name="camera" size={24} color="#00A884" />
            <Text style={styles.actionText}>Camera</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.captionInput}
          placeholder="Add caption..."
          placeholderTextColor="#667781"
          value={caption}
          onChangeText={setCaption}
          multiline
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#00A884",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  postButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  preview: {
    width: "100%",
    height: "60%",
    resizeMode: "cover",
  },
  placeholder: {
    alignItems: "center",
    marginBottom: 40,
  },
  placeholderText: {
    fontSize: 16,
    color: "#FFFFFF",
    marginTop: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 32,
  },
  actionButton: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
  },
  actionText: {
    color: "#FFFFFF",
    marginTop: 8,
    fontSize: 14,
  },
  captionInput: {
    width: "100%",
    padding: 16,
    color: "#FFFFFF",
    fontSize: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
});