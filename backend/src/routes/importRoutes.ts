import { Router } from 'express';
import { uploadExcel } from '../middleware/upload';
import { previewImport, confirmImport } from '../controllers/importController';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validation';
import { confirmImportSchema } from '../validators/schemas';

const router = Router();

/** 
 * POST /api/import/preview
 * Upload and preview Excel file with guests
 * 
 * Middleware:
 * - uploadExcel.single('file') - handles file upload (multer)
 * - asyncHandler - catches async errors
 */
router.post('/preview', uploadExcel.single('file'), asyncHandler(previewImport));

/**
 * POST /api/import/confirm
 * Confirm and execute the import after user review
 * 
 * Middleware:
 * - validate - validates request body against confirmImportSchema
 * - asyncHandler - catches async errors
 */
router.post('/confirm', validate(confirmImportSchema), asyncHandler(confirmImport));

export default router;