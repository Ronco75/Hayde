import { Request, Response } from 'express';
import prisma from '../config/db';
import { NotFoundError, UnprocessableEntityError } from '../errors/customErrors';
import { handlePrismaCreateError, handlePrismaUpdateError, handlePrismaDeleteError } from '../errors/prismaErrorHandler';
import {
  CreateTableInput,
  UpdateTableInput,
  UpdateTablePositionInput,
  AssignGuestInput,
} from '../validators/schemas';
import {
  transformTable,
  transformTableWithAssignments,
  transformTablesWithAssignments,
  transformUnassignedGuests,
  SeatingOverviewResponse,
} from '../utils/transformers';

/**
 * Create a new table
 * POST /api/tables
 */
export const createTable = async (req: Request, res: Response) => {
  const { table_number, capacity, position_x, position_y } = req.body as CreateTableInput;

  const wedding = await prisma.wedding.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!wedding) {
    throw new NotFoundError('Wedding not found');
  }

  try {
    const newTable = await prisma.table.create({
      data: {
        weddingId: wedding.id,
        tableNumber: table_number,
        capacity: capacity ?? 12,
        positionX: position_x ?? 100,
        positionY: position_y ?? 100,
      },
    });

    res.status(201).json(transformTable(newTable));
  } catch (error) {
    handlePrismaCreateError(error, 'Table');
  }
};

/**
 * Get all tables with assignments
 * GET /api/tables
 */
export const getAllTables = async (req: Request, res: Response) => {
  const wedding = await prisma.wedding.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!wedding) {
    res.json([]);
    return;
  }

  const tables = await prisma.table.findMany({
    where: { weddingId: wedding.id },
    include: {
      assignments: {
        include: {
          guest: {
            select: { id: true, name: true, numberOfGuests: true },
          },
        },
      },
    },
    orderBy: { tableNumber: 'asc' },
  });

  res.json(transformTablesWithAssignments(tables));
};

/**
 * Get a single table by ID
 * GET /api/tables/:id
 */
export const getTableById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const wedding = await prisma.wedding.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!wedding) {
    throw new NotFoundError('Wedding not found');
  }

  const table = await prisma.table.findFirst({
    where: { id: parseInt(id), weddingId: wedding.id },
    include: {
      assignments: {
        include: {
          guest: {
            select: { id: true, name: true, numberOfGuests: true },
          },
        },
      },
    },
  });

  if (!table) {
    throw new NotFoundError(`Table with ID ${id} not found`);
  }

  res.json(transformTableWithAssignments(table));
};

/**
 * Update a table
 * PUT /api/tables/:id
 */
export const updateTable = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { table_number, capacity, position_x, position_y } = req.body as UpdateTableInput;

  const wedding = await prisma.wedding.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!wedding) {
    throw new NotFoundError('Wedding not found');
  }

  // If changing capacity, check it doesn't go below current assigned count
  if (capacity !== undefined) {
    const currentTable = await prisma.table.findFirst({
      where: { id: parseInt(id), weddingId: wedding.id },
      include: {
        assignments: {
          include: { guest: { select: { numberOfGuests: true } } },
        },
      },
    });

    if (!currentTable) {
      throw new NotFoundError(`Table with ID ${id} not found`);
    }

    const assignedCount = currentTable.assignments.reduce(
      (sum, a) => sum + a.guest.numberOfGuests,
      0
    );
    if (capacity < assignedCount) {
      throw new UnprocessableEntityError(
        `לא ניתן להקטין את קיבולת השולחן ל-${capacity} מושבים. כרגע משובצים ${assignedCount} אורחים`
      );
    }
  }

  try {
    const updated = await prisma.table.updateMany({
      where: { id: parseInt(id), weddingId: wedding.id },
      data: {
        ...(table_number && { tableNumber: table_number }),
        ...(capacity !== undefined && { capacity }),
        ...(position_x !== undefined && { positionX: position_x }),
        ...(position_y !== undefined && { positionY: position_y }),
      },
    });

    if (updated.count === 0) {
      throw new NotFoundError(`Table with ID ${id} not found`);
    }

    const table = await prisma.table.findUnique({
      where: { id: parseInt(id) },
      include: {
        assignments: {
          include: {
            guest: { select: { id: true, name: true, numberOfGuests: true } },
          },
        },
      },
    });

    res.json(transformTableWithAssignments(table!));
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof UnprocessableEntityError) {
      throw error;
    }
    handlePrismaUpdateError(error, 'Table', parseInt(id));
  }
};

/**
 * Update table position only (for drag operations)
 * PATCH /api/tables/:id/position
 */
export const updateTablePosition = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { position_x, position_y } = req.body as UpdateTablePositionInput;

  const wedding = await prisma.wedding.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!wedding) {
    throw new NotFoundError('Wedding not found');
  }

  try {
    const updated = await prisma.table.updateMany({
      where: { id: parseInt(id), weddingId: wedding.id },
      data: { positionX: position_x, positionY: position_y },
    });

    if (updated.count === 0) {
      throw new NotFoundError(`Table with ID ${id} not found`);
    }

    res.json({ success: true });
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    handlePrismaUpdateError(error, 'Table position', parseInt(id));
  }
};

/**
 * Delete a table
 * DELETE /api/tables/:id
 */
export const deleteTable = async (req: Request, res: Response) => {
  const { id } = req.params;

  const wedding = await prisma.wedding.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!wedding) {
    throw new NotFoundError('Wedding not found');
  }

  try {
    const deleted = await prisma.table.deleteMany({
      where: { id: parseInt(id), weddingId: wedding.id },
    });

    if (deleted.count === 0) {
      throw new NotFoundError(`Table with ID ${id} not found`);
    }

    res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    handlePrismaDeleteError(error, 'Table', parseInt(id));
  }
};

/**
 * Assign a guest to a table
 * POST /api/tables/:id/assign
 */
export const assignGuest = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { guest_id } = req.body as AssignGuestInput;

  const wedding = await prisma.wedding.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!wedding) {
    throw new NotFoundError('Wedding not found');
  }

  // Verify table belongs to wedding
  const table = await prisma.table.findFirst({
    where: { id: parseInt(id), weddingId: wedding.id },
    include: {
      assignments: {
        include: { guest: { select: { numberOfGuests: true } } },
      },
    },
  });

  if (!table) {
    throw new NotFoundError(`Table with ID ${id} not found`);
  }

  // Verify guest belongs to wedding and is confirmed
  const guest = await prisma.guest.findFirst({
    where: { id: guest_id, weddingId: wedding.id },
  });

  if (!guest) {
    throw new NotFoundError(`Guest with ID ${guest_id} not found`);
  }

  if (guest.rsvpStatus !== 'confirmed') {
    throw new UnprocessableEntityError('ניתן לשבץ רק אורחים שאישרו הגעה');
  }

  // Check capacity
  const currentAssigned = table.assignments.reduce(
    (sum, a) => sum + a.guest.numberOfGuests,
    0
  );
  if (currentAssigned + guest.numberOfGuests > table.capacity) {
    throw new UnprocessableEntityError(
      `אין מספיק מקום בשולחן. נדרשים ${guest.numberOfGuests} מושבים, פנויים ${table.capacity - currentAssigned}`
    );
  }

  try {
    // Remove existing assignment if any (move operation)
    await prisma.tableAssignment.deleteMany({
      where: { weddingId: wedding.id, guestId: guest_id },
    });

    // Create new assignment
    await prisma.tableAssignment.create({
      data: {
        weddingId: wedding.id,
        tableId: parseInt(id),
        guestId: guest_id,
      },
    });

    // Return updated table
    const updatedTable = await prisma.table.findUnique({
      where: { id: parseInt(id) },
      include: {
        assignments: {
          include: {
            guest: { select: { id: true, name: true, numberOfGuests: true } },
          },
        },
      },
    });

    res.json(transformTableWithAssignments(updatedTable!));
  } catch (error) {
    handlePrismaCreateError(error, 'Table assignment');
  }
};

/**
 * Unassign a guest from a table
 * DELETE /api/tables/:id/assign/:guestId
 */
export const unassignGuest = async (req: Request, res: Response) => {
  const tableId = parseInt(req.params.id);
  const guestId = parseInt(req.params.guestId);

  const wedding = await prisma.wedding.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!wedding) {
    throw new NotFoundError('Wedding not found');
  }

  try {
    const deleted = await prisma.tableAssignment.deleteMany({
      where: {
        weddingId: wedding.id,
        tableId: tableId,
        guestId: guestId,
      },
    });

    if (deleted.count === 0) {
      throw new NotFoundError('Assignment not found');
    }

    res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    handlePrismaDeleteError(error, 'Table assignment', guestId);
  }
};

/**
 * Get unassigned confirmed guests
 * GET /api/tables/unassigned-guests
 */
export const getUnassignedGuests = async (req: Request, res: Response) => {
  const wedding = await prisma.wedding.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!wedding) {
    res.json([]);
    return;
  }

  const guests = await prisma.guest.findMany({
    where: {
      weddingId: wedding.id,
      rsvpStatus: 'confirmed',
      tableAssignment: null, // No assignment
    },
    orderBy: { name: 'asc' },
  });

  res.json(transformUnassignedGuests(guests));
};

/**
 * Get seating arrangement overview
 * GET /api/tables/overview
 */
export const getSeatingOverview = async (req: Request, res: Response) => {
  const wedding = await prisma.wedding.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!wedding) {
    const emptyOverview: SeatingOverviewResponse = {
      total_tables: 0,
      total_capacity: 0,
      total_assigned: 0,
      total_unassigned_confirmed: 0,
    };
    res.json(emptyOverview);
    return;
  }

  const [tables, unassignedCount] = await Promise.all([
    prisma.table.findMany({
      where: { weddingId: wedding.id },
      include: {
        assignments: {
          include: { guest: { select: { numberOfGuests: true } } },
        },
      },
    }),
    prisma.guest.count({
      where: {
        weddingId: wedding.id,
        rsvpStatus: 'confirmed',
        tableAssignment: null,
      },
    }),
  ]);

  const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);
  const totalAssigned = tables.reduce(
    (sum, t) => sum + t.assignments.reduce((s, a) => s + a.guest.numberOfGuests, 0),
    0
  );

  const overview: SeatingOverviewResponse = {
    total_tables: tables.length,
    total_capacity: totalCapacity,
    total_assigned: totalAssigned,
    total_unassigned_confirmed: unassignedCount,
  };

  res.json(overview);
};
