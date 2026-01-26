import { Request, Response, Router } from 'express';
import prisma from '../config/db';
import { NotFoundError, UnprocessableEntityError } from '../errors/customErrors';
import { handlePrismaCreateError, handlePrismaUpdateError, handlePrismaDeleteError } from '../errors/prismaErrorHandler';
import { CreateGuestInput, UpdateGuestInput, UpdateGiftAmountInput, BulkDeleteGuestsInput, BulkUpdateRsvpInput, BulkUpdateGroupInput } from '../validators/schemas';
import { transformGuest, transformGuests } from '../utils/transformers';
import { authenticate } from '../middleware/authMiddleware';
import { Decimal } from '@prisma/client/runtime/library';

const router = Router();
router.use(authenticate);
/**
 * Create a new guest
 * POST /api/guests
 *
 * Validation is handled by middleware
 */
export const createGuest = async (req: Request, res: Response) => {
  const {
    name,
    phone_number,
    group_id,
    number_of_guests,
    rsvp_status,
    notes
  } = req.body as CreateGuestInput;

  try {
    // Get the user's wedding
    const wedding = await prisma.wedding.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!wedding) {
      res.status(404).json({ error: 'Wedding not found. Please create a wedding first.' });
      return;
    }

    const newGuest = await prisma.guest.create({
      data: {
        weddingId: wedding.id,
        name,
        phoneNumber: phone_number,
        groupId: group_id,
        numberOfGuests: number_of_guests,
        rsvpStatus: rsvp_status,
        notes,
      },
    });

    res.status(201).json(transformGuest(newGuest));

  } catch (error) {
    handlePrismaCreateError(error, 'Guest');
  }
};

/**
 * Get all guests
 * GET /api/guests
 */
export const getAllGuests = async (req: Request, res: Response) => {
  try {
    // Get the user's wedding
    const wedding = await prisma.wedding.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!wedding) {
      res.json([]); // Return empty array if no wedding yet
      return;
    }

    const guests = await prisma.guest.findMany({
      where: { weddingId: wedding.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(transformGuests(guests));

  } catch (error) {
    handlePrismaCreateError(error, 'Guests');
  }
};

/**
 * Get guests by group
 * GET /api/guests/group/:groupId
 */
export const getGuestsByGroup = async (req: Request, res: Response) => {
  const { groupId } = req.params;

  try {
    // Get the user's wedding
    const wedding = await prisma.wedding.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!wedding) {
      res.json([]); // Return empty array if no wedding yet
      return;
    }

    const guests = await prisma.guest.findMany({
      where: { 
        weddingId: wedding.id,
        groupId: parseInt(groupId),
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(transformGuests(guests));

  } catch (error) {
    handlePrismaCreateError(error, 'Guests by group');
  }
};

/**
 * Get a single guest by ID
 * GET /api/guests/:id
 */
export const getGuestById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Get the user's wedding
    const wedding = await prisma.wedding.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!wedding) {
      res.status(404).json({ error: 'Wedding not found' });
      return;
    }

    const guest = await prisma.guest.findFirst({
      where: { 
        id: parseInt(id),
        weddingId: wedding.id, // Security check
      },
    });

    if (!guest) {
      throw new NotFoundError(`Guest with ID ${id} not found`);
    }

    res.json(transformGuest(guest));

  } catch (error) {
    // Re-throw NotFoundError as-is
    if (error instanceof NotFoundError) {
      throw error;
    }

    handlePrismaCreateError(error, 'Guest');
  }
};

/**
 * Update a guest
 * PUT /api/guests/:id
 *
 * Validation is handled by middleware
 */
export const updateGuest = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    name,
    phone_number,
    group_id,
    number_of_guests,
    rsvp_status,
    notes
  } = req.body as UpdateGuestInput;

  try {
    // Get the user's wedding
    const wedding = await prisma.wedding.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!wedding) {
      res.status(404).json({ error: 'Wedding not found' });
      return;
    }

    // Update only if the guest belongs to this user's wedding
    const updatedGuest = await prisma.guest.updateMany({
      where: { 
        id: parseInt(id),
        weddingId: wedding.id, // Security check
      },
      data: {
        name,
        phoneNumber: phone_number,
        groupId: group_id,
        numberOfGuests: number_of_guests,
        rsvpStatus: rsvp_status,
        notes,
      },
    });

    if (updatedGuest.count === 0) {
      res.status(404).json({ error: 'Guest not found or you do not have permission to update it' });
      return;
    }

    // Fetch the updated guest to return
    const guest = await prisma.guest.findUnique({
      where: { id: parseInt(id) },
    });

    res.json(transformGuest(guest!));

  } catch (error) {
    handlePrismaUpdateError(error, 'Guest', id);
  }
};

/**
 * Update RSVP status only (convenient endpoint)
 * PATCH /api/guests/:id/rsvp
 *
 * Allows updating just the RSVP status without sending all guest fields
 */
export const updateRsvpStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rsvp_status } = req.body;

  try {
    // Get the user's wedding
    const wedding = await prisma.wedding.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!wedding) {
      res.status(404).json({ error: 'Wedding not found' });
      return;
    }

    // Update only if the guest belongs to this user's wedding
    const updatedGuest = await prisma.guest.updateMany({
      where: { 
        id: parseInt(id),
        weddingId: wedding.id, // Security check
      },
      data: { rsvpStatus: rsvp_status },
    });

    if (updatedGuest.count === 0) {
      res.status(404).json({ error: 'Guest not found or you do not have permission to update it' });
      return;
    }

    // Fetch the updated guest to return
    const guest = await prisma.guest.findUnique({
      where: { id: parseInt(id) },
    });

    res.json(transformGuest(guest!));

  } catch (error) {
    handlePrismaUpdateError(error, 'Guest RSVP status', id);
  }
};

/**
 * Mark invitation as sent
 * PATCH /api/guests/:id/invitation
 *
 * Sets the invitation_sent_at timestamp to NOW()
 */
export const markInvitationSent = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Get the user's wedding
    const wedding = await prisma.wedding.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!wedding) {
      res.status(404).json({ error: 'Wedding not found' });
      return;
    }

    // Update only if the guest belongs to this user's wedding
    const updatedGuest = await prisma.guest.updateMany({
      where: { 
        id: parseInt(id),
        weddingId: wedding.id, // Security check
      },
      data: { invitationSentAt: new Date() },
    });

    if (updatedGuest.count === 0) {
      res.status(404).json({ error: 'Guest not found or you do not have permission to update it' });
      return;
    }

    // Fetch the updated guest to return
    const guest = await prisma.guest.findUnique({
      where: { id: parseInt(id) },
    });

    res.json(transformGuest(guest!));

  } catch (error) {
    handlePrismaUpdateError(error, 'Guest invitation', id);
  }
};

/**
 * Mark reminder as sent
 * PATCH /api/guests/:id/reminder
 *
 * Sets the reminder_sent_at timestamp to NOW()
 */
export const markReminderSent = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Get the user's wedding
    const wedding = await prisma.wedding.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!wedding) {
      res.status(404).json({ error: 'Wedding not found' });
      return;
    }

    // Update only if the guest belongs to this user's wedding
    const updatedGuest = await prisma.guest.updateMany({
      where: { 
        id: parseInt(id),
        weddingId: wedding.id, // Security check
      },
      data: { reminderSentAt: new Date() },
    });

    if (updatedGuest.count === 0) {
      res.status(404).json({ error: 'Guest not found or you do not have permission to update it' });
      return;
    }

    // Fetch the updated guest to return
    const guest = await prisma.guest.findUnique({
      where: { id: parseInt(id) },
    });

    res.json(transformGuest(guest!));

  } catch (error) {
    handlePrismaUpdateError(error, 'Guest reminder', id);
  }
};

/**
 * Update gift amount for a guest
 * PATCH /api/guests/:id/gift
 *
 * Business Rule: Only allows updating gift for confirmed guests
 */
export const updateGiftAmount = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { gift_amount } = req.body as UpdateGiftAmountInput;

  try {
    // Get the user's wedding
    const wedding = await prisma.wedding.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!wedding) {
      res.status(404).json({ error: 'Wedding not found' });
      return;
    }

    // Fetch guest to check RSVP status
    const guest = await prisma.guest.findFirst({
      where: {
        id: parseInt(id),
        weddingId: wedding.id,
      },
    });

    if (!guest) {
      res.status(404).json({ error: 'Guest not found or you do not have permission to update it' });
      return;
    }

    // BUSINESS RULE: Only confirmed guests can have gift amount set
    if (guest.rsvpStatus !== 'confirmed') {
      throw new UnprocessableEntityError('לא ניתן לעדכן סכום מתנה עבור אורח שטרם אישר הגעה');
    }

    // Update gift amount
    const updatedGuest = await prisma.guest.update({
      where: { id: parseInt(id) },
      data: { giftAmount: gift_amount },
    });

    res.json(transformGuest(updatedGuest));

  } catch (error) {
    // Re-throw UnprocessableEntityError as-is
    if (error instanceof UnprocessableEntityError) {
      throw error;
    }
    handlePrismaUpdateError(error, 'Guest gift amount', id);
  }
};

/**
 * Delete a guest
 * DELETE /api/guests/:id
 */
export const deleteGuest = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Get the user's wedding
    const wedding = await prisma.wedding.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!wedding) {
      res.status(404).json({ error: 'Wedding not found' });
      return;
    }

    // Delete only if the guest belongs to this user's wedding
    const deletedGuest = await prisma.guest.deleteMany({
      where: { 
        id: parseInt(id),
        weddingId: wedding.id, // Security check
      },
    });

    if (deletedGuest.count === 0) {
      res.status(404).json({ error: 'Guest not found or you do not have permission to delete it' });
      return;
    }

    res.status(204).send();

  } catch (error) {
    handlePrismaDeleteError(error, 'Guest', id);
  }
};

/**
 * Get guest statistics
 * GET /api/guests/stats
 */
export const getGuestStats = async (req: Request, res: Response) => {
  try {
    // Get the user's wedding
    const wedding = await prisma.wedding.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!wedding) {
      res.json({
        total_guests: 0,
        total_attendees: 0,
        confirmed_guests: 0,
        confirmed_attendees: 0,
        declined_guests: 0,
        pending_guests: 0,
        invitations_sent: 0,
        total_gifts: 0,
      });
      return;
    }

    // Get all guests for this wedding
    const guests = await prisma.guest.findMany({
      where: { weddingId: wedding.id },
    });

    // Filter guests by status
    const confirmedGuests = guests.filter(g => g.rsvpStatus === 'confirmed');
    const declinedGuests = guests.filter(g => g.rsvpStatus === 'declined');
    const pendingGuests = guests.filter(g => g.rsvpStatus === 'pending');

    // Calculate total gifts (only from confirmed guests)
    const totalGifts = confirmedGuests.reduce((sum, g) => {
      const giftAmount = g.giftAmount instanceof Decimal
        ? g.giftAmount.toNumber()
        : g.giftAmount ? Number(g.giftAmount) : 0;
      return sum + giftAmount;
    }, 0);

    // Calculate statistics with correct field names
    const stats = {
      total_guests: guests.length,                                              // Number of guest records
      total_attendees: guests.reduce((sum, g) => sum + g.numberOfGuests, 0),    // Total number of people
      confirmed_guests: confirmedGuests.length,                                 // Number of confirmed records
      confirmed_attendees: confirmedGuests.reduce((sum, g) => sum + g.numberOfGuests, 0), // Total confirmed people
      declined_guests: declinedGuests.length,                                   // Number of declined records
      pending_guests: pendingGuests.length,                                     // Number of pending records
      invitations_sent: guests.filter(g => g.invitationSentAt !== null).length, // Invitations sent
      total_gifts: totalGifts,                                                  // Total gift amount from confirmed guests
    };

    res.json(stats);

  } catch (error) {
    console.error('Error getting guest stats:', error);
    res.status(500).json({ error: 'Failed to get guest statistics' });
  }
};

/**
 * Bulk delete guests
 * DELETE /api/guests/bulk
 *
 * Deletes multiple guests by their IDs
 */
export const bulkDeleteGuests = async (req: Request, res: Response) => {
  const { ids } = req.body as BulkDeleteGuestsInput;

  try {
    // Get the user's wedding
    const wedding = await prisma.wedding.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!wedding) {
      res.status(404).json({ error: 'Wedding not found' });
      return;
    }

    // Delete only guests that belong to this user's wedding
    const result = await prisma.guest.deleteMany({
      where: {
        id: { in: ids },
        weddingId: wedding.id, // Security check
      },
    });

    res.json({ 
      deleted: result.count,
      message: `${result.count} מוזמנים נמחקו בהצלחה`,
    });

  } catch (error) {
    console.error('Error bulk deleting guests:', error);
    res.status(500).json({ error: 'Failed to delete guests' });
  }
};

/**
 * Bulk update RSVP status
 * PATCH /api/guests/bulk/rsvp
 *
 * Updates RSVP status for multiple guests
 */
export const bulkUpdateRsvpStatus = async (req: Request, res: Response) => {
  const { ids, rsvp_status } = req.body as BulkUpdateRsvpInput;

  try {
    // Get the user's wedding
    const wedding = await prisma.wedding.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!wedding) {
      res.status(404).json({ error: 'Wedding not found' });
      return;
    }

    // Update only guests that belong to this user's wedding
    const result = await prisma.guest.updateMany({
      where: {
        id: { in: ids },
        weddingId: wedding.id, // Security check
      },
      data: { rsvpStatus: rsvp_status },
    });

    res.json({ 
      updated: result.count,
      message: `סטטוס עודכן עבור ${result.count} מוזמנים`,
    });

  } catch (error) {
    console.error('Error bulk updating RSVP status:', error);
    res.status(500).json({ error: 'Failed to update RSVP status' });
  }
};

/**
 * Bulk update group
 * PATCH /api/guests/bulk/group
 *
 * Moves multiple guests to a different group
 */
export const bulkUpdateGroup = async (req: Request, res: Response) => {
  const { ids, group_id } = req.body as BulkUpdateGroupInput;

  try {
    // Get the user's wedding
    const wedding = await prisma.wedding.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!wedding) {
      res.status(404).json({ error: 'Wedding not found' });
      return;
    }

    // Verify the group belongs to this wedding
    const group = await prisma.group.findFirst({
      where: {
        id: group_id,
        weddingId: wedding.id,
      },
    });

    if (!group) {
      res.status(404).json({ error: 'Group not found or does not belong to your wedding' });
      return;
    }

    // Update only guests that belong to this user's wedding
    const result = await prisma.guest.updateMany({
      where: {
        id: { in: ids },
        weddingId: wedding.id, // Security check
      },
      data: { groupId: group_id },
    });

    res.json({ 
      updated: result.count,
      message: `${result.count} מוזמנים הועברו לקבוצה "${group.name}"`,
    });

  } catch (error) {
    console.error('Error bulk updating group:', error);
    res.status(500).json({ error: 'Failed to update group' });
  }
};