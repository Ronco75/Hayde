import { Request, Response } from 'express';
import prisma from '../config/db';
import { NotFoundError } from '../errors/customErrors';
import { handlePrismaCreateError, handlePrismaUpdateError, handlePrismaDeleteError } from '../errors/prismaErrorHandler';
import { CreateGuestInput, UpdateGuestInput } from '../validators/schemas';
import { transformGuest, transformGuests } from '../utils/transformers';

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
    const newGuest = await prisma.guest.create({
      data: {
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
    const guests = await prisma.guest.findMany({
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
    const guests = await prisma.guest.findMany({
      where: { groupId: parseInt(groupId) },
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
    const guest = await prisma.guest.findUnique({
      where: { id: parseInt(id) },
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
    const updatedGuest = await prisma.guest.update({
      where: { id: parseInt(id) },
      data: {
        name,
        phoneNumber: phone_number,
        groupId: group_id,
        numberOfGuests: number_of_guests,
        rsvpStatus: rsvp_status,
        notes,
      },
    });

    res.json(transformGuest(updatedGuest));

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
    const updatedGuest = await prisma.guest.update({
      where: { id: parseInt(id) },
      data: { rsvpStatus: rsvp_status },
    });

    res.json(transformGuest(updatedGuest));

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
    const updatedGuest = await prisma.guest.update({
      where: { id: parseInt(id) },
      data: { invitationSentAt: new Date() },
    });

    res.json(transformGuest(updatedGuest));

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
    const updatedGuest = await prisma.guest.update({
      where: { id: parseInt(id) },
      data: { reminderSentAt: new Date() },
    });

    res.json(transformGuest(updatedGuest));

  } catch (error) {
    handlePrismaUpdateError(error, 'Guest reminder', id);
  }
};

/**
 * Delete a guest
 * DELETE /api/guests/:id
 */
export const deleteGuest = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.guest.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();

  } catch (error) {
    handlePrismaDeleteError(error, 'Guest', id);
  }
};

/**
 * Get guest statistics
 * GET /api/guests/stats
 *
 * Returns aggregated statistics about guests and RSVPs
 */
export const getGuestStats = async (req: Request, res: Response) => {
  try {
    // Get all guests to calculate statistics
    const allGuests = await prisma.guest.findMany({
      select: {
        numberOfGuests: true,
        rsvpStatus: true,
        invitationSentAt: true,
      },
    });

    // Calculate statistics
    const totalGuests = allGuests.length;
    const totalAttendees = allGuests.reduce((sum, guest) => sum + guest.numberOfGuests, 0);

    const confirmedGuests = allGuests.filter(g => g.rsvpStatus === 'confirmed');
    const confirmedGuestsCount = confirmedGuests.length;
    const confirmedAttendees = confirmedGuests.reduce((sum, guest) => sum + guest.numberOfGuests, 0);

    const declinedGuests = allGuests.filter(g => g.rsvpStatus === 'declined').length;
    const pendingGuests = allGuests.filter(g => g.rsvpStatus === 'pending').length;
    const invitationsSent = allGuests.filter(g => g.invitationSentAt !== null).length;

    const stats = {
      total_guests: totalGuests,
      total_attendees: totalAttendees,
      confirmed_guests: confirmedGuestsCount,
      confirmed_attendees: confirmedAttendees,
      declined_guests: declinedGuests,
      pending_guests: pendingGuests,
      invitations_sent: invitationsSent,
    };

    res.json(stats);

  } catch (error) {
    handlePrismaCreateError(error, 'Guest statistics');
  }
};
