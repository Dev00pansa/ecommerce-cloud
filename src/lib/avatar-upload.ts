import { createClient } from "@/lib/supabase/client";
import { translateSupabaseError } from "@/lib/auth";
import {
  compressAvatarImageFile,
  extractAvatarStoragePath,
} from "@/lib/image-compression";
import type { AppLanguage } from "@/types";

export async function uploadUserAvatar(
  file: File,
  previousAvatarUrl: string | null | undefined,
  language: AppLanguage = "th"
): Promise<{ avatarUrl: string; sizeBytes: number }> {
  const isEn = language === "en";
  const compressed = await compressAvatarImageFile(file, language);

  try {
    const supabase = createClient();
    if (!supabase) {
      throw new Error(
        isEn ? "Cloud service is not configured." : "ยังไม่ได้ตั้งค่าระบบ Cloud"
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error(
        isEn
          ? "Session expired. Please sign in again."
          : "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง"
      );
    }

    const randomSuffix = Math.random().toString(36).slice(2, 9);
    const storagePath = `${user.id}/${Date.now()}-${randomSuffix}.${compressed.extension}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(storagePath, compressed.blob, {
        contentType: compressed.mimeType,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(translateSupabaseError(uploadError, language));
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(storagePath);

    const nextAvatarUrl = publicUrlData.publicUrl;

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ avatar_url: nextAvatarUrl })
      .eq("id", user.id);

    if (profileError) {
      await supabase.storage.from("avatars").remove([storagePath]);
      throw new Error(translateSupabaseError(profileError, language));
    }

    await supabase.auth.updateUser({
      data: { avatar_url: nextAvatarUrl },
    });

    const oldStoragePath = extractAvatarStoragePath(previousAvatarUrl, user.id);
    if (oldStoragePath && oldStoragePath !== storagePath) {
      await supabase.storage.from("avatars").remove([oldStoragePath]);
    }

    return {
      avatarUrl: nextAvatarUrl,
      sizeBytes: compressed.sizeBytes,
    };
  } finally {
    URL.revokeObjectURL(compressed.previewUrl);
  }
}
