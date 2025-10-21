import { Router } from 'express';
import {
     createGroup,
     getAllGroups,
     updateGroup,
     deleteGroup,
    } from '../controllers/groupController';

const router = Router();

//POST /api/groups - Create a new group
router.post('/', createGroup);

//GET /api/groups - Get all groups
router.get('/', getAllGroups);

//PUT /api/groups/:id - Update a group
router.put('/:id', updateGroup);

//DELETE /api/groups/:id - Delete a group
router.delete('/:id', deleteGroup);

export default router;