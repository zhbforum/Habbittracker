import { getSupabaseClient } from "@/shared/api/supabase/client";

import { AVATARS_BUCKET } from "./profileDb";

const MAX_AVATAR_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_EXTENSIONS = new Set(["jpg", "png", "webp"]);
const LOCAL_AVATAR_URI_SCHEME_PATTERN = /^(file|content|asset):/i;

function resolveFileExtension(uri: string): string {
  const cleanUri = uri.split("?")[0] ?? "";
  const matchedExtension = cleanUri.match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase();

  if (!matchedExtension) {
    return "jpg";
  }

  if (matchedExtension === "jpeg") {
    return "jpg";
  }

  return matchedExtension;
}

function resolveMimeType(extension: string): string {
  if (extension === "jpg") {
    return "image/jpeg";
  }

  if (extension === "png") {
    return "image/png";
  }

  if (extension === "webp") {
    return "image/webp";
  }

  return "application/octet-stream";
}

function assertAvatarUri(localUri: string): void {
  if (!LOCAL_AVATAR_URI_SCHEME_PATTERN.test(localUri)) {
    throw new Error("Invalid avatar source.");
  }
}

function assertAvatarExtension(fileExtension: string): void {
  if (ALLOWED_AVATAR_EXTENSIONS.has(fileExtension)) {
    return;
  }

  throw new Error("Unsupported avatar format. Please use JPG, PNG, or WEBP.");
}

function assertAvatarFileSize(fileSizeBytes: number): void {
  if (fileSizeBytes <= MAX_AVATAR_FILE_SIZE_BYTES) {
    return;
  }

  throw new Error("Avatar is too large. Maximum supported size is 5MB.");
}

export async function uploadAvatarFromDevice(
  userId: string,
  localUri: string,
): Promise<string> {
  assertAvatarUri(localUri);

  const response = await fetch(localUri);

  if (!response.ok) {
    throw new Error("Unable to read selected image.");
  }

  const fileExtension = resolveFileExtension(localUri);
  assertAvatarExtension(fileExtension);

  const fileBuffer = await response.arrayBuffer();
  assertAvatarFileSize(fileBuffer.byteLength);

  const contentType = resolveMimeType(fileExtension);
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExtension}`;
  const storagePath = `${userId}/${fileName}`;
  const supabase = getSupabaseClient();

  const { error: uploadError } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from(AVATARS_BUCKET)
    .getPublicUrl(storagePath);

  if (!publicUrlData?.publicUrl) {
    throw new Error("Unable to get avatar URL after upload.");
  }

  return publicUrlData.publicUrl;
}
