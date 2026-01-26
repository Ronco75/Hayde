import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { ValidationError } from '../errors/customErrors';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create invitation-images subdirectory
const invitationImagesDir = path.join(uploadsDir, 'invitation-images');
if (!fs.existsSync(invitationImagesDir)) {
  fs.mkdirSync(invitationImagesDir, { recursive: true });
}

// Allowed file types for invitation images
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Storage configuration for invitation images
const invitationImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, invitationImagesDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: weddingId-timestamp.ext
    const userId = (req as any).user?.userId || 'unknown';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `wedding-${userId}-${timestamp}${ext}`;
    cb(null, filename);
  },
});

// File filter for images
const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(new ValidationError('סוג הקובץ לא נתמך. יש להעלות תמונה בפורמט JPG, PNG, GIF או WEBP'));
    return;
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    cb(new ValidationError('סיומת הקובץ לא נתמכת. יש להעלות תמונה בפורמט JPG, PNG, GIF או WEBP'));
    return;
  }

  cb(null, true);
};

/**
 * Multer middleware for uploading invitation images.
 * - Accepts single file with field name 'image'
 * - Max size: 10MB
 * - Allowed types: JPG, PNG, GIF, WEBP
 */
export const uploadInvitationImage = multer({
  storage: invitationImageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
}).single('image');

/**
 * Get the public URL for an uploaded file.
 * @param filename - The filename returned by multer
 * @returns The URL path to access the file
 */
export function getInvitationImageUrl(filename: string): string {
  return `/uploads/invitation-images/${filename}`;
}

/**
 * Delete an invitation image from the filesystem.
 * @param imageUrl - The URL or path of the image to delete
 */
export function deleteInvitationImage(imageUrl: string): void {
  try {
    // Extract filename from URL
    const filename = path.basename(imageUrl);
    const filePath = path.join(invitationImagesDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted invitation image: ${filename}`);
    }
  } catch (error) {
    console.error('Error deleting invitation image:', error);
  }
}

/**
 * Get the absolute path to the uploads directory.
 */
export function getUploadsPath(): string {
  return uploadsDir;
}
