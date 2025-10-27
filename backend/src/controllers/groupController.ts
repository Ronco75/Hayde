import { Request, Response } from 'express';
import prisma from '../config/db';
import { handlePrismaCreateError, handlePrismaUpdateError, handlePrismaDeleteError } from '../errors/prismaErrorHandler';
import { CreateGroupInput, UpdateGroupInput } from '../validators/schemas';
import { transformGroup, transformGroups } from '../utils/transformers';

/**
 * Create a new group
 * POST /api/groups
 *
 * Validation is handled by middleware
 */
export const createGroup = async (req: Request, res: Response) => {
  const { name } = req.body as CreateGroupInput;

  try {
    const newGroup = await prisma.group.create({
      data: { name },
    });

    res.status(201).json(transformGroup(newGroup));

  } catch (error) {
    handlePrismaCreateError(error, 'Group');
  }
};

/**
 * Get all groups
 * GET /api/groups
 */
export const getAllGroups = async (req: Request, res: Response) => {
  try {
    const groups = await prisma.group.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json(transformGroups(groups));

  } catch (error) {
    handlePrismaCreateError(error, 'Groups');
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
    const updatedGroup = await prisma.group.update({
      where: { id: parseInt(id) },
      data: { name },
    });

    res.json(transformGroup(updatedGroup));

  } catch (error) {
    handlePrismaUpdateError(error, 'Group', id);
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
    await prisma.group.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();

  } catch (error) {
    handlePrismaDeleteError(error, 'Group', id);
  }
};
