import * as ImagePicker from "expo-image-picker";

type PickAvatarFromGalleryResult =
  | {
      status: "success";
      uri: string;
    }
  | {
      status: "cancelled";
    }
  | {
      status: "permission_denied";
    }
  | {
      status: "invalid_asset";
    };

export async function pickAvatarFromGallery(): Promise<PickAvatarFromGalleryResult> {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permissionResult.granted) {
    return {
      status: "permission_denied",
    };
  }

  const pickerResult = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.9,
  });

  if (pickerResult.canceled) {
    return {
      status: "cancelled",
    };
  }

  const asset = pickerResult.assets?.[0];

  if (!asset?.uri) {
    return {
      status: "invalid_asset",
    };
  }

  return {
    status: "success",
    uri: asset.uri,
  };
}
