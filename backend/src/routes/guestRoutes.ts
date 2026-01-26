import { Router } from 'express';
import {
  createGuest,
  getAllGuests,
  getGuestsByGroup,
  getGuestById,
  updateGuest,
  updateRsvpStatus,
  updateGiftAmount,
  markInvitationSent,
  markReminderSent,
  deleteGuest,
  getGuestStats,
  bulkDeleteGuests,
  bulkUpdateRsvpStatus,
  bulkUpdateGroup
} from '../controllers/guestController';
import { validate, validateId, validateGroupId } from '../middleware/validation';
import { createGuestSchema, updateGuestSchema, updateRsvpStatusSchema, updateGiftAmountSchema, bulkDeleteGuestsSchema, bulkUpdateRsvpSchema, bulkUpdateGroupSchema } from '../validators/schemas';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Apply authentication to all guest routes
router.use(authenticate);

// GET /api/guests/stats - Get guest statistics (MUST come before /:id routes)
router.get('/stats', asyncHandler(getGuestStats));

// BULK OPERATIONS (MUST come before /:id routes)
// DELETE /api/guests/bulk - Bulk delete guests
router.delete('/bulk', validate(bulkDeleteGuestsSchema), asyncHandler(bulkDeleteGuests));

// PATCH /api/guests/bulk/rsvp - Bulk update RSVP status
router.patch('/bulk/rsvp', validate(bulkUpdateRsvpSchema), asyncHandler(bulkUpdateRsvpStatus));

// PATCH /api/guests/bulk/group - Bulk update group
router.patch('/bulk/group', validate(bulkUpdateGroupSchema), asyncHandler(bulkUpdateGroup));

// GET /api/guests/group/:groupId - Get guests by group
router.get('/group/:groupId', validateGroupId, asyncHandler(getGuestsByGroup));

// POST /api/guests - Create a new guest
router.post('/', validate(createGuestSchema), asyncHandler(createGuest));

// GET /api/guests - Get all guests
router.get('/', asyncHandler(getAllGuests));

// GET /api/guests/:id - Get a guest by id
router.get('/:id', validateId, asyncHandler(getGuestById));

// PUT /api/guests/:id - Update a guest
router.put('/:id', validateId, validate(updateGuestSchema), asyncHandler(updateGuest));

// PATCH /api/guests/:id/rsvp - Update RSVP status only
router.patch('/:id/rsvp', validateId, validate(updateRsvpStatusSchema), asyncHandler(updateRsvpStatus));

// PATCH /api/guests/:id/gift - Update gift amount (only for confirmed guests)
router.patch('/:id/gift', validateId, validate(updateGiftAmountSchema), asyncHandler(updateGiftAmount));

// PATCH /api/guests/:id/invitation - Mark invitation as sent
router.patch('/:id/invitation', validateId, asyncHandler(markInvitationSent));

// PATCH /api/guests/:id/reminder - Mark reminder as sent
router.patch('/:id/reminder', validateId, asyncHandler(markReminderSent));

// DELETE /api/guests/:id - Delete a guest
router.delete('/:id', validateId, asyncHandler(deleteGuest));

export default router;
