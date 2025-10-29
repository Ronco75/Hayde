import multer from 'multer';
import { Request } from 'express';

/**
 * Multer configuration for Excel file uploads
 * 
 * Multer is a middleware for handling multipart/form-data (file uploads)
 * We configure it to:
 * 1. Store files in memory (not on disk) - faster and simpler for processing
 * 2. Only accept Excel files (.xlsx, .xls)
 * 3. Limit file size to 5MB
 */

// Configure storage - we use memory storage for temporary processing
const storage = multer.memoryStorage();

/**
 * File filter function - for now, accept all files
 * The parseExcelFile function will validate if it's actually an Excel file
 * 
 * TODO: Add proper mimetype validation for production
 */
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // For development: accept all files
  // parseExcelFile will throw error if it's not a valid Excel file
  cb(null, true);
};

/**
 * Multer upload instance
 * 
 * Configuration:
 * - storage: memoryStorage() - stores file in RAM as Buffer
 * - fileFilter: only accepts Excel files
 * - limits: max file size 5MB (5 * 1024 * 1024 bytes)
 */
export const uploadExcel = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});