import { Router } from 'express';
import {
     createGroup,
     getAllGroups,
     updateGroup,
     deleteGroup,
    } from '../controllers/groupController';
import { validate, validateId } from '../middleware/validation';
import { createGroupSchema, updateGroupSchema } from '../validators/schemas';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Apply authentication to all group routes
router.use(authenticate);

// POST /api/groups - Create a new group
router.post('/', validate(createGroupSchema), asyncHandler(createGroup));

// GET /api/groups - Get all groups
router.get('/', asyncHandler(getAllGroups));

// PUT /api/groups/:id - Update a group
router.put('/:id', validateId, validate(updateGroupSchema), asyncHandler(updateGroup));

// DELETE /api/groups/:id - Delete a group
router.delete('/:id', validateId, asyncHandler(deleteGroup));

export default router;