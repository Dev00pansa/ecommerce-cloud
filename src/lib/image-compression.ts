import type { CompressedProductImage } from "@/types";

const MAX_RAW_FILE_BYTES = 5 * 1024 * 1024;
const MAX_COMPRESSED_BYTES = 120 * 1024;
const MAX_DIMENSION_PX = 500;
const AVATAR_SIZE_PX = 200;
const MAX_AVATAR_BYTES = 45 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

async function hasValidImageMagicBytes(file: File): Promise<boolean> {
  const slice = file.slice(0, 12);
  const buffer = await slice.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  if (bytes.length < 4) return false;

  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47;
  const isWebp =
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50;

  return isJpeg || isPng || isWebp;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      mimeType,
      quality
    );
  });
}

function loadImageElement(objectUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("ไม่สามารถอ่านไฟล์รูปภาพนี้ได้"));
    img.src = objectUrl;
  });
}

async function validateRawImageFile(file: File): Promise<void> {
  const extension = file.name.split(".").pop()?.trim().toLowerCase() ?? "";

  if (
    !ALLOWED_MIME_TYPES.has(file.type.toLowerCase()) ||
    !ALLOWED_EXTENSIONS.has(extension)
  ) {
    throw new Error(
      "รองรับเฉพาะไฟล์รูปภาพ .jpg, .jpeg, .png และ .webp เท่านั้น"
    );
  }

  if (file.size <= 0 || file.size > MAX_RAW_FILE_BYTES) {
    throw new Error("ขนาดไฟล์รูปภาพต้นฉบับต้องไม่เกิน 5 MB");
  }

  const validHeader = await hasValidImageMagicBytes(file);
  if (!validHeader) {
    throw new Error("ไฟล์ที่เลือกไม่ใช่ไฟล์รูปภาพที่ถูกต้อง");
  }
}

export async function compressProductImageFile(
  file: File
): Promise<CompressedProductImage> {
  await validateRawImageFile(file);

  const tempUrl = URL.createObjectURL(file);

  try {
    const img = await loadImageElement(tempUrl);
    const sourceWidth = Math.max(1, img.naturalWidth || img.width);
    const sourceHeight = Math.max(1, img.naturalHeight || img.height);

    const scale = Math.min(
      1,
      MAX_DIMENSION_PX / Math.max(sourceWidth, sourceHeight)
    );
    const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
    const targetHeight = Math.max(1, Math.round(sourceHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("เบราว์เซอร์ไม่รองรับการย่อขนาดรูปภาพ");
    }

    ctx.fillStyle = "#09090B";
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const qualities = [0.8, 0.68, 0.56, 0.44, 0.34];
    let selectedBlob: Blob | null = null;
    let selectedMime: "image/webp" | "image/jpeg" = "image/webp";

    for (const quality of qualities) {
      const candidate = await canvasToBlob(canvas, "image/webp", quality);
      if (candidate && candidate.type === "image/webp") {
        selectedBlob = candidate;
        selectedMime = "image/webp";
        if (candidate.size <= MAX_COMPRESSED_BYTES) {
          break;
        }
      } else {
        const jpegCandidate = await canvasToBlob(canvas, "image/jpeg", quality);
        if (jpegCandidate) {
          selectedBlob = jpegCandidate;
          selectedMime = "image/jpeg";
          if (jpegCandidate.size <= MAX_COMPRESSED_BYTES) {
            break;
          }
        }
      }
    }

    if (!selectedBlob) {
      throw new Error("ไม่สามารถบีบอัดรูปภาพได้ กรุณาลองใช้รูปอื่น");
    }

    if (selectedBlob.size > 150 * 1024) {
      throw new Error("รูปภาพหลังบีบอัดยังมีขนาดใหญ่เกิน 150 KB กรุณาเลือกรูปอื่น");
    }

    const previewUrl = URL.createObjectURL(selectedBlob);

    return {
      blob: selectedBlob,
      previewUrl,
      sizeBytes: selectedBlob.size,
      mimeType: selectedMime,
      extension: selectedMime === "image/webp" ? "webp" : "jpg",
    };
  } finally {
    URL.revokeObjectURL(tempUrl);
  }
}

export async function compressAvatarImageFile(
  file: File
): Promise<CompressedProductImage> {
  await validateRawImageFile(file);

  const tempUrl = URL.createObjectURL(file);

  try {
    const img = await loadImageElement(tempUrl);
    const sourceWidth = Math.max(1, img.naturalWidth || img.width);
    const sourceHeight = Math.max(1, img.naturalHeight || img.height);
    const cropSize = Math.min(sourceWidth, sourceHeight);
    const cropX = Math.floor((sourceWidth - cropSize) / 2);
    const cropY = Math.floor((sourceHeight - cropSize) / 2);

    const canvas = document.createElement("canvas");
    canvas.width = AVATAR_SIZE_PX;
    canvas.height = AVATAR_SIZE_PX;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("เบราว์เซอร์ไม่รองรับการย่อขนาดรูปภาพ");
    }

    ctx.fillStyle = "#09090B";
    ctx.fillRect(0, 0, AVATAR_SIZE_PX, AVATAR_SIZE_PX);
    ctx.drawImage(
      img,
      cropX,
      cropY,
      cropSize,
      cropSize,
      0,
      0,
      AVATAR_SIZE_PX,
      AVATAR_SIZE_PX
    );

    const qualities = [0.78, 0.64, 0.52, 0.4, 0.3, 0.22];
    let selectedBlob: Blob | null = null;
    let selectedMime: "image/webp" | "image/jpeg" = "image/webp";

    for (const quality of qualities) {
      const candidate = await canvasToBlob(canvas, "image/webp", quality);
      if (candidate && candidate.type === "image/webp") {
        selectedBlob = candidate;
        selectedMime = "image/webp";
        if (candidate.size <= MAX_AVATAR_BYTES) {
          break;
        }
      } else {
        const jpegCandidate = await canvasToBlob(canvas, "image/jpeg", quality);
        if (jpegCandidate) {
          selectedBlob = jpegCandidate;
          selectedMime = "image/jpeg";
          if (jpegCandidate.size <= MAX_AVATAR_BYTES) {
            break;
          }
        }
      }
    }

    if (!selectedBlob) {
      throw new Error("ไม่สามารถบีบอัดรูปโปรไฟล์ได้ กรุณาลองใช้รูปอื่น");
    }

    if (selectedBlob.size > 50 * 1024) {
      throw new Error("รูปโปรไฟล์หลังบีบอัดยังมีขนาดเกิน 50 KB กรุณาเลือกรูปอื่น");
    }

    const previewUrl = URL.createObjectURL(selectedBlob);

    return {
      blob: selectedBlob,
      previewUrl,
      sizeBytes: selectedBlob.size,
      mimeType: selectedMime,
      extension: selectedMime === "image/webp" ? "webp" : "jpg",
    };
  } finally {
    URL.revokeObjectURL(tempUrl);
  }
}

export function formatFileSizeKb(bytes: number): string {
  const kb = Math.max(1, Math.round(bytes / 1024));
  return `${kb} KB`;
}

export function extractProductImageStoragePath(
  imageUrlOrPath: string | null | undefined,
  userId: string
): string | null {
  if (!imageUrlOrPath) return null;
  const trimmed = imageUrlOrPath.trim();
  if (!trimmed) return null;

  const marker = "/product-images/";
  const markerIndex = trimmed.indexOf(marker);
  const candidate =
    markerIndex >= 0
      ? trimmed.slice(markerIndex + marker.length).split("?")[0] ?? ""
      : trimmed;

  if (!candidate.startsWith(`${userId}/`) || candidate.includes("..")) {
    return null;
  }

  return candidate;
}

export function extractAvatarStoragePath(
  avatarUrlOrPath: string | null | undefined,
  userId: string
): string | null {
  if (!avatarUrlOrPath) return null;
  const trimmed = avatarUrlOrPath.trim();
  if (!trimmed) return null;

  const marker = "/avatars/";
  const markerIndex = trimmed.indexOf(marker);
  const candidate =
    markerIndex >= 0
      ? trimmed.slice(markerIndex + marker.length).split("?")[0] ?? ""
      : trimmed;

  if (!candidate.startsWith(`${userId}/`) || candidate.includes("..")) {
    return null;
  }

  return candidate;
}
