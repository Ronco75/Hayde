import { Request, Response } from 'express';
import pool from '../config/db';
import { Group } from '../types/Group';

// Create a new group
export const createGroup = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;

        // Validate input
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'Group name is required' });
        }

        // Insert into database
        const result = await pool.query<Group>(
            'INSERT INTO groups (name) VALUES ($1) RETURNING *',
            [name]
        );

        const newGroup: Group = result.rows[0];
        res.status(201).json(newGroup);
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all groups
export const getAllGroups = async (req: Request, res: Response) => {
    try {
        const result = await pool.query<Group>('SELECT * FROM groups ORDER BY created_at DESC');
        const groups: Group[] = result.rows;
        res.json(groups);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

//update group
export const updateGroup = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        // Validate input
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'Group name is required' });
        }

        // Update in database
        const result = await pool.query<Group>(
            'UPDATE groups SET name = $1 WHERE id = $2 RETURNING *',
            [name, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const updatedGroup: Group = result.rows[0];
        res.json(updatedGroup);
    } catch (error) {
        console.error('Error updating group:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete a group
export const deleteGroup = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Delete from database
        const result = await pool.query('DELETE FROM groups WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Group not found' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};