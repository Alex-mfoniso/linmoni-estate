import { buildOptimizedImageUrl } from "../services/cloudinaryService";

function makeId(prefix = "img") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeCloudinaryImage(image) {
  if (!image) {
    return null;
  }

  if (typeof image === "string") {
    const secureUrl = image.trim();

    if (!secureUrl) {
      return null;
    }

    return {
      publicId: "",
      secureUrl,
      width: null,
      height: null,
      format: "",
      bytes: 0,
    };
  }

  const publicId = String(image.publicId || image.public_id || "").trim();
  const secureUrl = String(
    image.secureUrl || image.secure_url || image.url || ""
  ).trim();

  if (!publicId && !secureUrl) {
    return null;
  }

  return {
    publicId,
    secureUrl,
    width: Number(image.width || 0) || null,
    height: Number(image.height || 0) || null,
    format: String(image.format || "").trim(),
    bytes: Number(image.bytes || 0) || 0,
  };
}

export function createLocalImageItem(asset, overrides = {}) {
  if (!asset?.uri) {
    return null;
  }

  const id = overrides.id || asset.assetId || asset.uri || makeId("local-image");
  return {
    id,
    sourceType: "local",
    uri: asset.uri,
    fileName: asset.fileName || "",
    mimeType: asset.mimeType || "",
    fileSize: Number(asset.fileSize || 0) || 0,
    width: Number(asset.width || 0) || null,
    height: Number(asset.height || 0) || null,
    isCover: Boolean(overrides.isCover),
  };
}

export function createRemoteImageItem(image, overrides = {}) {
  const normalized = normalizeCloudinaryImage(image);

  if (!normalized) {
    return null;
  }

  const id =
    overrides.id ||
    normalized.publicId ||
    normalized.secureUrl ||
    makeId("remote-image");

  return {
    id,
    sourceType: "remote",
    uri:
      normalized.secureUrl ||
      (normalized.publicId
        ? buildOptimizedImageUrl(normalized.publicId, {
            width: 1400,
            height: 1050,
            crop: "fill",
          })
        : ""),
    publicId: normalized.publicId,
    secureUrl: normalized.secureUrl,
    width: normalized.width,
    height: normalized.height,
    format: normalized.format,
    bytes: normalized.bytes,
    isCover: Boolean(overrides.isCover),
  };
}

export function isRemoteImageItem(item) {
  return Boolean(item?.publicId || item?.secureUrl || item?.sourceType === "remote");
}

export function isLocalImageItem(item) {
  return !isRemoteImageItem(item);
}

export function getPropertyGallery(property) {
  const gallery = [];
  const coverImage = normalizeCloudinaryImage(
    property?.coverImage || property?.imageUrl || property?.propertyImage
  );

  if (Array.isArray(property?.images)) {
    for (const image of property.images) {
      const normalized = normalizeCloudinaryImage(image);
      if (normalized) {
        gallery.push(normalized);
      }
    }
  }

  if (coverImage) {
    const coverKey = coverImage.publicId || coverImage.secureUrl;
    const hasCover = gallery.some(
      (image) => (image.publicId || image.secureUrl) === coverKey
    );

    if (!hasCover) {
      gallery.unshift(coverImage);
    }
  }

  return gallery;
}

export function getPropertyCoverImage(property) {
  return getPropertyGallery(property)[0] || null;
}

export function getPropertyCoverUri(property, options = {}) {
  const coverImage = getPropertyCoverImage(property);

  if (!coverImage) {
    return "";
  }

  if (coverImage.publicId) {
    return (
      buildOptimizedImageUrl(coverImage.publicId, options) ||
      coverImage.secureUrl ||
      ""
    );
  }

  return coverImage.secureUrl || "";
}

export function buildEditableImageItems(property) {
  return getPropertyGallery(property).map((image, index) => ({
    id: image.publicId || image.secureUrl || makeId("existing-image"),
    sourceType: "remote",
    uri: image.secureUrl || "",
    publicId: image.publicId || "",
    secureUrl: image.secureUrl || "",
    width: image.width || null,
    height: image.height || null,
    format: image.format || "",
    bytes: image.bytes || 0,
    isCover: index === 0,
  }));
}

export function preparePropertyImagesForSave(items) {
  const normalizedItems = (items || [])
    .map((item, index) => {
      const normalized = normalizeCloudinaryImage(item);

      if (!normalized) {
        return null;
      }

      return {
        ...normalized,
        isCover: Boolean(item?.isCover) || index === 0,
      };
    })
    .filter(Boolean);

  const coverImage = normalizedItems.find((item) => item.isCover) || normalizedItems[0] || null;

  return {
    coverImage: coverImage
      ? {
          publicId: coverImage.publicId || "",
          secureUrl: coverImage.secureUrl || "",
        }
      : {
          publicId: "",
          secureUrl: "",
        },
    images: normalizedItems.map(({ isCover, ...image }) => image),
  };
}

export function getImageSourceFromItem(item, options = {}) {
  if (!item) {
    return "";
  }

  if (item.publicId) {
    return (
      buildOptimizedImageUrl(item.publicId, options) ||
      item.secureUrl ||
      item.uri ||
      ""
    );
  }

  return item.secureUrl || item.uri || "";
}
