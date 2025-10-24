import { Request, Response } from 'express';
import pool from '../config/db';
import { Guest, RsvpStatus } from '../types/Guest';

// Create a new guest
export const createGuest = async (req: Request, res: Response) => {
    try {
        const {
            name,
            phone_number,
            group_id,
            number_of_guests = 1,
            rsvp_status = 'pending',
            notes
        } = req.body;

        // Validate required fields
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'Guest name is required' });
        }
        if (!phone_number || phone_number.trim() === '') {
            return res.status(400).json({ error: 'Phone number is required' });
        }
        if (!group_id) {
            return res.status(400).json({ error: 'Group ID is required' });
        }

        // Validate RSVP status if provided
        const validStatuses: RsvpStatus[] = ['pending', 'confirmed', 'declined', 'maybe'];
        if (rsvp_status && !validStatuses.includes(rsvp_status)) {
            return res.status(400).json({
                error: 'Invalid RSVP status. Must be: pending, confirmed, declined, or maybe'
            });
        }

        // Insert into database
        const result = await pool.query<Guest>(
            `INSERT INTO guests (name, phone_number, group_id, number_of_guests, rsvp_status, notes)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [name, phone_number, group_id, number_of_guests, rsvp_status, notes]
        );

        const newGuest: Guest = result.rows[0];
        res.status(201).json(newGuest);

    } catch (error) {
        console.error('Error creating guest:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all guests
export const getAllGuests = async (req: Request, res: Response) => {
    try {
        const result = await pool.query<Guest>(
            'SELECT * FROM guests ORDER BY created_at DESC'
        );
        
        const guests: Guest[] = result.rows;
        res.json(guests);

    } catch (error) {
        console.error('Error fetching guests:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get guests by group
export const getGuestsByGroup = async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params;

        const result = await pool.query<Guest>(
            'SELECT * FROM guests WHERE group_id = $1 ORDER BY created_at DESC',
            [groupId]
        );

        const guests: Guest[] = result.rows;
        res.json(guests);

    } catch (error) {
        console.error('Error fetching guests by group:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get a single guest by ID
export const getGuestById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await pool.query<Guest>(
            'SELECT * FROM guests WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Guest not found' });
        }

        const guest: Guest = result.rows[0];
        res.json(guest);

    } catch (error) {
        console.error('Error fetching guest:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update a guest
export const updateGuest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { 
            name, 
            phone_number, 
            group_id, 
            number_of_guests,
            rsvp_status,
            notes 
        } = req.body;

        // Validate required fields
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'Guest name is required' });
        }
        if (!phone_number || phone_number.trim() === '') {
            return res.status(400).json({ error: 'Phone number is required' });
        }
        if (!group_id) {
            return res.status(400).json({ error: 'Group ID is required' });
        }

        // Validate RSVP status if provided
        const validStatuses: RsvpStatus[] = ['pending', 'confirmed', 'declined', 'maybe'];
        if (rsvp_status && !validStatuses.includes(rsvp_status)) {
            return res.status(400).json({ 
                error: 'Invalid RSVP status. Must be: pending, confirmed, declined, or maybe' 
            });
        }

        const result = await pool.query<Guest>(
            `UPDATE guests 
             SET name = $1, phone_number = $2, group_id = $3, 
                 number_of_guests = $4, rsvp_status = $5, notes = $6
             WHERE id = $7
             RETURNING *`,
            [name, phone_number, group_id, number_of_guests, rsvp_status, notes, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Guest not found' });
        }

        const updatedGuest: Guest = result.rows[0];
        res.json(updatedGuest);

    } catch (error) {
        console.error('Error updating guest:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update RSVP status only (convenient endpoint)
export const updateRsvpStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { rsvp_status } = req.body;

        // Validate RSVP status
        const validStatuses: RsvpStatus[] = ['pending', 'confirmed', 'declined', 'maybe'];
        if (!rsvp_status || !validStatuses.includes(rsvp_status)) {
            return res.status(400).json({ 
                error: 'Invalid RSVP status. Must be: pending, confirmed, declined, or maybe' 
            });
        }

        const result = await pool.query<Guest>(
            'UPDATE guests SET rsvp_status = $1 WHERE id = $2 RETURNING *',
            [rsvp_status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Guest not found' });
        }

        const updatedGuest: Guest = result.rows[0];
        res.json(updatedGuest);

    } catch (error) {
        console.error('Error updating RSVP status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Mark invitation as sent
export const markInvitationSent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await pool.query<Guest>(
            'UPDATE guests SET invitation_sent_at = NOW() WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Guest not found' });
        }

        const updatedGuest: Guest = result.rows[0];
        res.json(updatedGuest);

    } catch (error) {
        console.error('Error marking invitation as sent:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Mark reminder as sent
export const markReminderSent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await pool.query<Guest>(
            'UPDATE guests SET reminder_sent_at = NOW() WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Guest not found' });
        }

        const updatedGuest: Guest = result.rows[0];
        res.json(updatedGuest);

    } catch (error) {
        console.error('Error marking reminder as sent:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete a guest
export const deleteGuest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await pool.query('DELETE FROM guests WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Guest not found' });
        }

        res.status(204).send();

    } catch (error) {
        console.error('Error deleting guest:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get guest statistics
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
        console.error('Error fetching guest statistics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};