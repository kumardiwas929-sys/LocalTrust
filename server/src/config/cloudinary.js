import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'demo_cloud'
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Upload a file buffer or local file path
 * @param {string|Buffer} fileSource - Local file path or base64/buffer
 * @param {string} folder - Destination folder name (e.g. 'workproof', 'profiles')
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export const uploadMedia = async (filePath, folder = 'localtrust') => {
  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: `localtrust/${folder}`,
        resource_type: 'auto',
      });
      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (err) {
      console.warn('[Cloudinary] Cloud upload error, falling back to local storage:', err.message);
    }
  }

  // Fallback: save to local uploads directory
  const uploadsDir = path.join(__dirname, '..', '..', 'uploads', folder);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${path.extname(filePath) || '.jpg'}`;
  const targetPath = path.join(uploadsDir, fileName);

  if (fs.existsSync(filePath)) {
    fs.copyFileSync(filePath, targetPath);
  }

  const relativeUrl = `/uploads/${folder}/${fileName}`;
  return {
    url: relativeUrl,
    publicId: fileName,
  };
};

export default cloudinary;
