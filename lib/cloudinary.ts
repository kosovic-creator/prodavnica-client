import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export function getCloudinaryOptimizedUrl(
  publicId: string,
  options: {
    width?: number;
    quality?: number | 'auto';
    format?: string;
    crop?: string;
  } = {}
) {
  const {
    width = 400,
    quality = 'auto',
    format = 'auto',
    crop = 'limit',
  } = options;
  // If the publicId is already a full URL, return as is
  if (/^https?:\/\//.test(publicId)) return publicId;
  return cloudinary.url(publicId, {
    width,
    quality,
    fetch_format: format,
    crop,
    secure: true,
  });
}

export default cloudinary;
