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

const router = Router();

//POST /api/guests - Create a new guest
router.post('/', createGuest);

//GET /api/guests - Get all guests
router.get('/', getAllGuests);

//GET /api/guests/stats - Get guest statistics
router.get('/stats', getGuestStats)

//GET /api.guests/group/:groupId - Get guests by group
router.get('/group/:groupId', getGuestsByGroup)

//GET /api.guests/:id - Get a guest by id
router.get('/:id', getGuestById)

//PUT /api.guests/:id - Update a guest
router.put('/:id', updateGuest)

//PATCH /api.guests/:id/rsvp - Update RSVP status only
router.patch('/:id/rsvp', updateRsvpStatus)

//PATCH /api.guests/:id/invitation - Mark invitation as sent
router.patch('/:id/invitation', markInvitationSent)

//PATCH /api.guests/:id/reminder - Mark reminder as sent
router.patch('/:id/reminder', markReminderSent)

//DELETE /api.guests/:id - Delete a guest
router.delete('/:id', deleteGuest)

export default router;