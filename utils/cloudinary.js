const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload an image to Cloudinary
 * @param {string} filePath - Path to the local file
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `blog_app/${folder}`,
      resource_type: 'auto',
    });
    return result;
  } catch (error) {
    throw new Error(`Cloudinary Upload Error: ${error.message}`);
  }
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} - Cloudinary deletion result
 */
const removeFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Cloudinary Delete Error: ${error.message}`);
  }
};

/**
 * Extract public ID from a Cloudinary URL
 * @param {string} url - Cloudinary image URL
 * @returns {string|null} - Public ID or null
 */
const getPublicIdFromUrl = (url) => {
  try {
    if (!url) return null;
    const parts = url.split('/');
    const fileNameWithExtension = parts.pop();
    const publicIdWithFolder = parts.slice(parts.indexOf('upload') + 2).join('/') + '/' + fileNameWithExtension.split('.')[0];
    return publicIdWithFolder;
  } catch (error) {
    return null;
  }
};

module.exports = {
  uploadToCloudinary,
  removeFromCloudinary,
  getPublicIdFromUrl,
};
