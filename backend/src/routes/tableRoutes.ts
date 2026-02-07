import { Router } from 'express';
import {
  createTable,
  getAllTables,
  getTableById,
  updateTable,
  updateTablePosition,
  deleteTable,
  assignGuest,
  unassignGuest,
  getUnassignedGuests,
  getSeatingOverview,
} from '../controllers/tableController';
import { validate, validateId } from '../middleware/validation';
import {
  createTableSchema,
  updateTableSchema,
  updateTablePositionSchema,
  assignGuestSchema,
} from '../validators/schemas';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Apply authentication to all table routes
router.use(authenticate);

// Overview and unassigned guests (MUST come before /:id routes)
router.get('/overview', asyncHandler(getSeatingOverview));
router.get('/unassigned-guests', asyncHandler(getUnassignedGuests));

// CRUD operations
router.post('/', validate(createTableSchema), asyncHandler(createTable));
router.get('/', asyncHandler(getAllTables));
router.get('/:id', validateId, asyncHandler(getTableById));
router.put('/:id', validateId, validate(updateTableSchema), asyncHandler(updateTable));
router.delete('/:id', validateId, asyncHandler(deleteTable));

// Position update (for drag operations)
router.patch('/:id/position', validateId, validate(updateTablePositionSchema), asyncHandler(updateTablePosition));

// Guest assignments
router.post('/:id/assign', validateId, validate(assignGuestSchema), asyncHandler(assignGuest));
router.delete('/:id/assign/:guestId', validateId, asyncHandler(unassignGuest));

export default router;
