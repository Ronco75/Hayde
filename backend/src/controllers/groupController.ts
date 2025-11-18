import { Request, Response, Router } from 'express';
import prisma from '../config/db';
import { handlePrismaCreateError, handlePrismaUpdateError, handlePrismaDeleteError } from '../errors/prismaErrorHandler';
import { CreateGroupInput, UpdateGroupInput } from '../validators/schemas';
import { transformGroup, transformGroups } from '../utils/transformers';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
router.use(authenticate);

/**
 * Create a new group
 * POST /api/groups
 */
export const createGroup = async (req: Request, res: Response) => {
  const { name } = req.body as CreateGroupInput;

  try {
    // Get the user's wedding
    const wedding = await prisma.wedding.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!wedding) {
      res.status(404).json({ error: 'Wedding not found. Please create a wedding first.' });
      return;
    }

    const newGroup = await prisma.group.create({
      data: { 
        name,
        weddingId: wedding.id,
      },
    });

    res.status(201).json(transformGroup(newGroup));

  } catch (error) {
    handlePrismaCreateError(error, 'Group');
  }
};

/**
 * Get all groups for the authenticated user's wedding
 * GET /api/groups
 */
export const getAllGroups = async (req: Request, res: Response) => {
  try {
    // Get the user's wedding
    const wedding = await prisma.wedding.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!wedding) {
      res.json([]); // Return empty array if no wedding yet
      return;
    }

    const groups = await prisma.group.findMany({
      where: { weddingId: wedding.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(transformGroups(groups));

  } catch (error) {
    handlePrismaCreateError(error, 'Groups');
  }
};

/**
 * Update a group
 * PUT /api/groups/:id
 */
export const updateGroup = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body as UpdateGroupInput;

  try {
    // Get the user's wedding
    const wedding = await prisma.wedding.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!wedding) {
      res.status(404).json({ error: 'Wedding not found' });
      return;
    }

    // Update only if the group belongs to this user's wedding
    const updatedGroup = await prisma.group.updateMany({
      where: { 
        id: parseInt(id),
        weddingId: wedding.id, // Security check
      },
      data: { name },
    });

    if (updatedGroup.count === 0) {
      res.status(404).json({ error: 'Group not found or you do not have permission to update it' });
      return;
    }

    // Fetch the updated group to return
    const group = await prisma.group.findUnique({
      where: { id: parseInt(id) },
    });

    // Defensive check: ensure group exists before transforming
    if (!group) {
      res.status(404).json({ error: 'Group not found after update' });
      return;
    }

    res.json(transformGroup(group));

  } catch (error) {
    handlePrismaUpdateError(error, 'Group', id);
  }
};

/**
 * Delete a group
 * DELETE /api/groups/:id
 */
export const deleteGroup = async (req: Request, res: Response) => {
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

    // Delete only if the group belongs to this user's wedding
    const deletedGroup = await prisma.group.deleteMany({
      where: { 
        id: parseInt(id),
        weddingId: wedding.id, // Security check
      },
    });

    if (deletedGroup.count === 0) {
      res.status(404).json({ error: 'Group not found or you do not have permission to delete it' });
      return;
    }

    res.status(204).send();

  } catch (error) {
    handlePrismaDeleteError(error, 'Group', id);
  }
};