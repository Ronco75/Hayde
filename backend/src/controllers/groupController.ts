import { Request, Response } from 'express';
import pool from '../config/db';
import { Group } from '../types/Group';
import { NotFoundError, ConflictError, DatabaseError } from '../errors/customErrors';
import { CreateGroupInput, UpdateGroupInput } from '../validators/schemas';

/**
 * Create a new group
 * POST /api/groups
 *
 * Validation is handled by middleware
 */
export const createGroup = async (req: Request, res: Response) => {
  const { name } = req.body as CreateGroupInput;

  try {
    // Insert into database
    const result = await pool.query<Group>(
      'INSERT INTO groups (name) VALUES ($1) RETURNING *',
      [name]
    );

    const newGroup: Group = result.rows[0];
    res.status(201).json(newGroup);

  } catch (error: any) {
    // Handle unique constraint violation (duplicate group name if we add unique constraint)
    if (error.code === '23505') {
      throw new ConflictError('Group with this name already exists');
    }

    console.error('Database error creating group:', error);
    throw new DatabaseError('Failed to create group');
  }
};

/**
 * Get all groups
 * GET /api/groups
 */
export const getAllGroups = async (req: Request, res: Response) => {
  try {
    const result = await pool.query<Group>('SELECT * FROM groups ORDER BY created_at DESC');
    const groups: Group[] = result.rows;
    res.json(groups);
  } catch (error) {
    console.error('Database error fetching groups:', error);
    throw new DatabaseError('Failed to fetch groups');
  }
};

/**
 * Update group name
 * PUT /api/groups/:id
 *
 * Validation is handled by middleware
 */
export const updateGroup = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body as UpdateGroupInput;

  try {
    // Update in database
    const result = await pool.query<Group>(
      'UPDATE groups SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError(`Group with ID ${id} not found`);
    }

    const updatedGroup: Group = result.rows[0];
    res.json(updatedGroup);

  } catch (error: any) {
    // Re-throw NotFoundError as-is
    if (error instanceof NotFoundError) {
      throw error;
    }

    // Handle unique constraint violation
    if (error.code === '23505') {
      throw new ConflictError('Group with this name already exists');
    }

    console.error('Database error updating group:', error);
    throw new DatabaseError('Failed to update group');
  }
};

/**
 * Delete a group
 * DELETE /api/groups/:id
 *
 * Note: This will fail if the group has associated guests (foreign key constraint)
 */
export const deleteGroup = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Delete from database
    const result = await pool.query('DELETE FROM groups WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      throw new NotFoundError(`Group with ID ${id} not found`);
    }

    res.status(204).send();

  } catch (error: any) {
    // Re-throw NotFoundError as-is
    if (error instanceof NotFoundError) {
      throw error;
    }

    // Handle foreign key constraint violation
    if (error.code === '23503') {
      throw new ConflictError('Cannot delete group with existing guests. Delete or reassign the guests first.');
    }

    console.error('Database error deleting group:', error);
    throw new DatabaseError('Failed to delete group');
  }
};
