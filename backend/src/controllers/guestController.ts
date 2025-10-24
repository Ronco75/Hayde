import { Request, Response } from 'express';
import pool from '../config/db';
import { Guest } from '../types/Guest';
import { NotFoundError, ConflictError, DatabaseError } from '../errors/customErrors';
import { CreateGuestInput, UpdateGuestInput } from '../validators/schemas';

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
    // Insert into database
    const result = await pool.query<Guest>(
      `INSERT INTO guests (name, phone_number, group_id, number_of_guests, rsvp_status, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, phone_number, group_id, number_of_guests, rsvp_status, notes]
    );

    const newGuest: Guest = result.rows[0];
    res.status(201).json(newGuest);

  } catch (error: any) {
    // Handle foreign key violation (invalid group_id)
    if (error.code === '23503') {
      throw new ConflictError(`Group with ID ${group_id} does not exist`);
    }

    // Handle unique constraint violation (duplicate phone number if we add unique constraint)
    if (error.code === '23505') {
      throw new ConflictError('A guest with this phone number already exists');
    }

    console.error('Database error creating guest:', error);
    throw new DatabaseError('Failed to create guest');
  }
};

/**
 * Get all guests
 * GET /api/guests
 */
export const getAllGuests = async (req: Request, res: Response) => {
  try {
    const result = await pool.query<Guest>(
      'SELECT * FROM guests ORDER BY created_at DESC'
    );

    const guests: Guest[] = result.rows;
    res.json(guests);

  } catch (error) {
    console.error('Database error fetching guests:', error);
    throw new DatabaseError('Failed to fetch guests');
  }
};

/**
 * Get guests by group
 * GET /api/guests/group/:groupId
 */
export const getGuestsByGroup = async (req: Request, res: Response) => {
  const { groupId } = req.params;

  try {
    const result = await pool.query<Guest>(
      'SELECT * FROM guests WHERE group_id = $1 ORDER BY created_at DESC',
      [groupId]
    );

    const guests: Guest[] = result.rows;
    res.json(guests);

  } catch (error) {
    console.error('Database error fetching guests by group:', error);
    throw new DatabaseError('Failed to fetch guests by group');
  }
};

/**
 * Get a single guest by ID
 * GET /api/guests/:id
 */
export const getGuestById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query<Guest>(
      'SELECT * FROM guests WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`Guest with ID ${id} not found`);
    }

    const guest: Guest = result.rows[0];
    res.json(guest);

  } catch (error) {
    // Re-throw NotFoundError as-is
    if (error instanceof NotFoundError) {
      throw error;
    }

    console.error('Database error fetching guest:', error);
    throw new DatabaseError('Failed to fetch guest');
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
    const result = await pool.query<Guest>(
      `UPDATE guests
       SET name = $1, phone_number = $2, group_id = $3,
           number_of_guests = $4, rsvp_status = $5, notes = $6
       WHERE id = $7
       RETURNING *`,
      [name, phone_number, group_id, number_of_guests, rsvp_status, notes, id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`Guest with ID ${id} not found`);
    }

    const updatedGuest: Guest = result.rows[0];
    res.json(updatedGuest);

  } catch (error: any) {
    // Re-throw NotFoundError as-is
    if (error instanceof NotFoundError) {
      throw error;
    }

    // Handle foreign key violation (invalid group_id)
    if (error.code === '23503') {
      throw new ConflictError(`Group with ID ${group_id} does not exist`);
    }

    // Handle unique constraint violation
    if (error.code === '23505') {
      throw new ConflictError('A guest with this phone number already exists');
    }

    console.error('Database error updating guest:', error);
    throw new DatabaseError('Failed to update guest');
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
    const result = await pool.query<Guest>(
      'UPDATE guests SET rsvp_status = $1 WHERE id = $2 RETURNING *',
      [rsvp_status, id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`Guest with ID ${id} not found`);
    }

    const updatedGuest: Guest = result.rows[0];
    res.json(updatedGuest);

  } catch (error) {
    // Re-throw NotFoundError as-is
    if (error instanceof NotFoundError) {
      throw error;
    }

    console.error('Database error updating RSVP status:', error);
    throw new DatabaseError('Failed to update RSVP status');
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
    const result = await pool.query<Guest>(
      'UPDATE guests SET invitation_sent_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`Guest with ID ${id} not found`);
    }

    const updatedGuest: Guest = result.rows[0];
    res.json(updatedGuest);

  } catch (error) {
    // Re-throw NotFoundError as-is
    if (error instanceof NotFoundError) {
      throw error;
    }

    console.error('Database error marking invitation as sent:', error);
    throw new DatabaseError('Failed to mark invitation as sent');
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
    const result = await pool.query<Guest>(
      'UPDATE guests SET reminder_sent_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`Guest with ID ${id} not found`);
    }

    const updatedGuest: Guest = result.rows[0];
    res.json(updatedGuest);

  } catch (error) {
    // Re-throw NotFoundError as-is
    if (error instanceof NotFoundError) {
      throw error;
    }

    console.error('Database error marking reminder as sent:', error);
    throw new DatabaseError('Failed to mark reminder as sent');
  }
};

/**
 * Delete a guest
 * DELETE /api/guests/:id
 */
export const deleteGuest = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM guests WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      throw new NotFoundError(`Guest with ID ${id} not found`);
    }

    res.status(204).send();

  } catch (error) {
    // Re-throw NotFoundError as-is
    if (error instanceof NotFoundError) {
      throw error;
    }

    console.error('Database error deleting guest:', error);
    throw new DatabaseError('Failed to delete guest');
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
    const result = await pool.query(`
      SELECT
        COUNT(*) as total_guests,
        SUM(number_of_guests) as total_attendees,
        COUNT(CASE WHEN rsvp_status = 'confirmed' THEN 1 END) as confirmed_guests,
        SUM(CASE WHEN rsvp_status = 'confirmed' THEN number_of_guests ELSE 0 END) as confirmed_attendees,
        COUNT(CASE WHEN rsvp_status = 'declined' THEN 1 END) as declined_guests,
        COUNT(CASE WHEN rsvp_status = 'pending' THEN 1 END) as pending_guests,
        COUNT(CASE WHEN invitation_sent_at IS NOT NULL THEN 1 END) as invitations_sent
      FROM guests
    `);

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Database error fetching guest statistics:', error);
    throw new DatabaseError('Failed to fetch guest statistics');
  }
};
