import { auth } from "../firebase"; 
import { Platform } from "react-native";

const CLOUDINARY = {
  CLOUD_NAME: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  UPLOAD_PRESET: process.env.EXPO_PUBLIC_CLOUDINARY_UNSIGNED_PRESET!,
};

export async function uploadToCloudinary(
  localUri: string | null,
  mime: string | null,
  webFile: File | Blob | null,
  folder: string,
  setUploading?: (b: boolean) => void 
): Promise<string> {
  if (!auth.currentUser?.uid) {
    throw new Error("Please sign in to upload.");
  }
  if (!localUri) throw new Error("Missing image URI");

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY.CLOUD_NAME}/image/upload`;
  const form = new FormData();
  form.append("upload_preset", CLOUDINARY.UPLOAD_PRESET);
  form.append("folder", folder);

  const filename = `${folder}_${auth.currentUser.uid}_${Date.now()}.jpg`;
  const type = mime || "image/jpeg";

  setUploading?.(true);
  try {
    if (Platform.OS === "web") {
      let fileToSend: any = webFile;
      if (!fileToSend) {
        const resp = await fetch(localUri);
        fileToSend = await resp.blob();
      }
      form.append("file", fileToSend, filename);
    } else {
      form.append("file", { uri: localUri, name: filename, type } as any);
    }

    const res = await fetch(endpoint, { method: "POST", body: form });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Upload failed: ${err}`);
    }
    const data = await res.json();
    return data.secure_url as string;
  } finally {
    setUploading?.(false);
  }
}
