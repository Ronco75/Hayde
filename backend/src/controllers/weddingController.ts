import { Request, Response } from 'express';
import prisma from '../config/db';
import { CreateWeddingInput, UpdateWeddingInput } from '../validators/schemas';
import { transformWedding } from '../utils/transformers';

/**
 * Create a new wedding for the authenticated user
 * POST /api/weddings
 */
export const createWedding = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bride_name, groom_name, wedding_date, venue, address, budget } = req.body as CreateWeddingInput;

    // Check if user already has a wedding
    const existingWedding = await prisma.wedding.findUnique({
      where: { userId: req.user!.userId },
    });

    if (existingWedding) {
      res.status(409).json({ error: 'User already has a wedding. Please update instead.' });
      return;
    }

    // Create the wedding
    const wedding = await prisma.wedding.create({
      data: {
        userId: req.user!.userId,
        brideName: bride_name,
        groomName: groom_name,
        weddingDate: new Date(wedding_date),
        venue,
        address,
        budget,
      },
    });

    res.status(201).json(transformWedding(wedding));
  } catch (error) {
    console.error('Create wedding error:', error);
    res.status(500).json({ error: 'Failed to create wedding' });
  }
};

/**
 * Get the authenticated user's wedding
 * GET /api/weddings
 */
export const getWedding = async (req: Request, res: Response): Promise<void> => {
  try {
    const wedding = await prisma.wedding.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!wedding) {
      res.status(404).json({ error: 'Wedding not found' });
      return;
    }

    res.status(200).json(transformWedding(wedding));
  } catch (error) {
    console.error('Get wedding error:', error);
    res.status(500).json({ error: 'Failed to get wedding' });
  }
};

/**
 * Update the authenticated user's wedding
 * PUT /api/weddings
 */
export const updateWedding = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bride_name, groom_name, wedding_date, venue, address, budget } = req.body as UpdateWeddingInput;

    // Check if wedding exists
    const existingWedding = await prisma.wedding.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!existingWedding) {
      res.status(404).json({ error: 'Wedding not found. Please create one first.' });
      return;
    }

    // Build update data object
    const updateData: any = {};
    if (bride_name !== undefined) updateData.brideName = bride_name;
    if (groom_name !== undefined) updateData.groomName = groom_name;
    if (wedding_date !== undefined) updateData.weddingDate = new Date(wedding_date);
    if (venue !== undefined) updateData.venue = venue;
    if (address !== undefined) updateData.address = address;
    if (budget !== undefined) updateData.budget = budget;

    // Update the wedding
    const wedding = await prisma.wedding.update({
      where: { userId: req.user!.userId },
      data: updateData,
    });

    res.status(200).json(transformWedding(wedding));
  } catch (error) {
    console.error('Update wedding error:', error);
    res.status(500).json({ error: 'Failed to update wedding' });
  }
};

/**
 * Delete the authenticated user's wedding
 * DELETE /api/weddings
 * WARNING: This will cascade delete all related data (categories, expenses, groups, guests)
 */
export const deleteWedding = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if wedding exists
    const existingWedding = await prisma.wedding.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!existingWedding) {
      res.status(404).json({ error: 'Wedding not found' });
      return;
    }

    // Delete the wedding (cascade will delete all related data)
    await prisma.wedding.delete({
      where: { userId: req.user!.userId },
    });

    res.status(200).json({ message: 'Wedding deleted successfully' });
  } catch (error) {
    console.error('Delete wedding error:', error);
    res.status(500).json({ error: 'Failed to delete wedding' });
  }
};