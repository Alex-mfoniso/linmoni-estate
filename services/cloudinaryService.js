const CLOUD_NAME = String(process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || "").trim();
const UPLOAD_PRESET = String(process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "").trim();
const MAX_IMAGE_SIZE_BYTES = 12 * 1024 * 1024;

function assertConfig() {
  const missing = [];

  if (!CLOUD_NAME) {
    missing.push("EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME");
  }

  if (!UPLOAD_PRESET) {
    missing.push("EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET");
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing Cloudinary environment variables: ${missing.join(", ")}`
    );
  }
}

function normalizeAsset(asset) {
  if (!asset?.uri) {
    throw new Error("Please choose an image before uploading.");
  }

  const mimeType = String(asset.mimeType || "").trim().toLowerCase();
  const fileSize = Number(asset.fileSize || 0) || 0;
  const width = Number(asset.width || 0) || null;
  const height = Number(asset.height || 0) || null;

  if (mimeType && !mimeType.startsWith("image/")) {
    throw new Error("Only image files can be uploaded.");
  }

  if (fileSize > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Each image must be smaller than 12MB.");
  }

  return {
    uri: asset.uri,
    fileName: asset.fileName || `image-${Date.now()}.jpg`,
    mimeType: mimeType || "image/jpeg",
    fileSize,
    width,
    height,
  };
}

function buildUploadUrl() {
  assertConfig();
  return `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
}

function buildTransformationQuery(options = {}) {
  const {
    width,
    height,
    crop = "fill",
    quality = "auto",
    format = "auto",
    gravity = "auto",
    fetchFormat,
  } = options;

  const parts = [];

  if (format) {
    parts.push(`f_${format}`);
  }

  if (quality) {
    parts.push(`q_${quality}`);
  }

  if (width) {
    parts.push(`w_${Math.round(Number(width))}`);
  }

  if (height) {
    parts.push(`h_${Math.round(Number(height))}`);
  }

  if (crop) {
    parts.push(`c_${crop}`);
  }

  if (gravity && crop !== "fit") {
    parts.push(`g_${gravity}`);
  }

  if (fetchFormat) {
    parts.push(`fl_${fetchFormat}`);
  }

  parts.push("dpr_auto");

  return parts.join(",");
}

export function validateImage(asset) {
  return normalizeAsset(asset);
}

export async function uploadImage(asset, options = {}) {
  const image = validateImage(asset);
  const formData = new FormData();

  formData.append("file", {
    uri: image.uri,
    type: image.mimeType,
    name: image.fileName,
  });
  formData.append("upload_preset", UPLOAD_PRESET);

  if (options.folder) {
    formData.append("folder", options.folder);
  }

  const response = await fetch(buildUploadUrl(), {
    method: "POST",
    body: formData,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      payload?.message ||
      "Image upload failed. Please try again.";
    throw new Error(message);
  }

  return {
    publicId: payload.public_id || "",
    secureUrl: payload.secure_url || "",
    width: Number(payload.width || image.width || 0) || null,
    height: Number(payload.height || image.height || 0) || null,
    format: String(payload.format || "").trim(),
    bytes: Number(payload.bytes || image.fileSize || 0) || 0,
  };
}

export async function uploadMultipleImages(assets, options = {}) {
  const list = Array.isArray(assets) ? assets : [];
  const uploaded = [];

  for (const asset of list) {
    uploaded.push(await uploadImage(asset, options));
  }

  return uploaded;
}

export function buildOptimizedImageUrl(source, options = {}) {
  if (!source) {
    return "";
  }

  if (typeof source === "object") {
    if (source.publicId) {
      return buildOptimizedImageUrl(source.publicId, options);
    }

    return String(source.secureUrl || source.uri || "");
  }

  const value = String(source).trim();

  if (!value) {
    return "";
  }

  if (!CLOUD_NAME) {
    return /^https?:\/\//i.test(value) ? value : "";
  }

  const isRemoteUrl = /^https?:\/\//i.test(value);

  if (!isRemoteUrl) {
    const transformation = buildTransformationQuery(options);
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformation}/${value}`;
  }

  if (!value.includes("res.cloudinary.com") || value.includes("data:")) {
    return value;
  }

  const publicIdMatch = value.match(/\/upload\/(?:v\d+\/)?(.+)$/);
  const publicId = publicIdMatch ? publicIdMatch[1] : "";

  if (!publicId) {
    return value;
  }

  const transformation = buildTransformationQuery(options);
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformation}/${publicId}`;
}
