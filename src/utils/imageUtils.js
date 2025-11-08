// src/utils/imageUtils.js

/**
 * Converts a relative image URL to a full URL pointing to the backend server
 * @param {string} relativeUrl - The relative image URL from the database
 * @returns {string} - The full URL to the image
 */
export const getFullImageUrl = (relativeUrl) => {
  // Use dynamic backend URL based on current frontend port - match api.js logic
  const currentPort = window.location.port;
  let backendPort;
  
  switch (currentPort) {
    case '5173': // Development mode (start-dev.ps1)
    case '5174': // Production-backend mode back to Development mode 
    case '5175': // Development mode (alternative port)
      backendPort = '8081';
      break;
    case '4173': // Production preview mode
    case '4174': // Production preview mode
      backendPort = '8080';
      break;
    default:
      backendPort = '8081'; // Default development
  }
  
  if (!relativeUrl) {
    // Return backend-served placeholder image instead of frontend path
    return `http://localhost:${backendPort}/furniture-store/images/placeholder.jpg`;
  }
  
  // If it's already a full URL (starts with http), return as-is
  if (relativeUrl.startsWith('http')) {
    return relativeUrl;
  }
  
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
  
  // Construct full URL to backend server  
  return `http://localhost:${backendPort}/furniture-store/${actualImagePath}`;
};