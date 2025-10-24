import { Router } from 'express';
import {
  createGuest,
  getAllGuests,
  getGuestsByGroup,
  getGuestById,
  updateGuest,
  updateRsvpStatus,
  markInvitationSent,
  markReminderSent,
  deleteGuest,
  getGuestStats
} from '../controllers/guestController';
import { validate, validateId } from '../middleware/validation';
import { createGuestSchema, updateGuestSchema, updateRsvpStatusSchema } from '../validators/schemas';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// GET /api/guests/stats - Get guest statistics (MUST come before /:id routes)
router.get('/stats', asyncHandler(getGuestStats));

// GET /api/guests/group/:groupId - Get guests by group
router.get('/group/:groupId', validateId, asyncHandler(getGuestsByGroup));

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

// PATCH /api/guests/:id/invitation - Mark invitation as sent
router.patch('/:id/invitation', validateId, asyncHandler(markInvitationSent));

// PATCH /api/guests/:id/reminder - Mark reminder as sent
router.patch('/:id/reminder', validateId, asyncHandler(markReminderSent));

// DELETE /api/guests/:id - Delete a guest
router.delete('/:id', validateId, asyncHandler(deleteGuest));

export default router;
