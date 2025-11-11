// src/utils/imageUtils.js

/**
 * Converts a relative image URL to a full URL pointing to the backend server
 * @param {string} relativeUrl - The relative image URL from the database
 * @returns {string} - The full URL to the image
 */
export const getFullImageUrl = (relativeUrl) => {
  // Prefer build-time environment variables (inlined by Vite)
  const envBackend = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL;

  // If no relativeUrl provided, return a placeholder
  if (!relativeUrl) {
    if (envBackend && envBackend.startsWith('http')) {
      const hostBase = envBackend.replace(/\/api\/?$/, '').replace(/\/$/, '');
      return `${hostBase}/images/placeholder.jpg`;
    }

    // Development-only localhost fallback
    if (import.meta.env.DEV) {
      // Prefer DEV port from environment when available, otherwise default to 8081
      const devBackendPort = import.meta.env.VITE_BACKEND_PORT || '8081';
      return `http://localhost:${devBackendPort}/furniture-store/images/placeholder.jpg`;
    }

    // Production fallback: use same origin to avoid localhost references
    return `${window.location.origin}/images/placeholder.jpg`;
  }

  // If it's already a full URL (starts with http), return as-is
  if (relativeUrl.startsWith('http')) return relativeUrl;

  // Remove leading slash if present to avoid double slashes
  const cleanUrl = relativeUrl.startsWith('/') ? relativeUrl.substring(1) : relativeUrl;

  // Map common image names to actual files or use fallback
  let actualImagePath = cleanUrl;
  if (cleanUrl === 'sofa1.jpg') {
    actualImagePath = 'images/products/fabric-sofa-001-main.jpg';
  } else if (cleanUrl === 'chair1.jpg') {
    actualImagePath = 'images/products/executive-chair-017-main.jpg';
  } else if (cleanUrl === 'table1.jpg') {
    actualImagePath = 'images/products/oak-dining-table-003-main.jpg';
  } else if (!cleanUrl.startsWith('images/')) {
    // If it's just a filename, assume it's in images/products/
    actualImagePath = `images/products/${cleanUrl}`;
  }

  // If envBackend present and absolute, use it (strip trailing /api if needed)
  if (envBackend && envBackend.startsWith('http')) {
    const hostBase = envBackend.replace(/\/api\/?$/, '').replace(/\/$/, '');
    return `${hostBase}/${actualImagePath}`;
  }

  // Development-only localhost fallback
  if (import.meta.env.DEV) {
    const devBackendPort = import.meta.env.VITE_BACKEND_PORT || '8081';
    return `http://localhost:${devBackendPort}/furniture-store/${actualImagePath}`;
  }

  // Production fallback: use same origin so mobile won't call device-localhost
  return `${window.location.origin}/${actualImagePath}`;
};