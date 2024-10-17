import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { authenticateToken } from '../middleware/authTokenMiddleware';
import { AuthenticatedRequest } from '../types';

const prisma = new PrismaClient();
const router = Router();

// create a new topology
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const { id } = req.user;
    const { name, thumbnail, react_flow_state, expires_on, archived } = req.body;

    try {
        const newTopology = await prisma.topology.create({
            data: {
                user_id: id,
                name,
                thumbnail: Buffer.from(thumbnail, 'base64'), // assuming thumbnail is sent as a base64 string
                react_flow_state,
                expires_on: new Date(expires_on),
                archived: archived || false,
            },
        });
        res.status(201).json(newTopology);
    } catch (error) {
        res.status(500).json({ message: 'Error creating topology', error });
    }
});

// get all topologies for the current logged in user
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const { id } = req.user;

    try {
        const topologies = await prisma.topology.findMany({
            where: {
                user_id: id,
            },
        });
        res.status(200).json(topologies);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching topologies', error });
    }
});

// get a single topology by ID
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const { id } = req.params;

    try {
        const topology = await prisma.topology.findUnique({
            where: { id: parseInt(id) },
        });

        if (!topology) {
            res.status(404).json({ message: 'Topology not found' });
            return;
        }

        res.status(200).json(topology);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching topology', error });
    }
});

// update a topology by ID
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const { id } = req.params;
    const { name, thumbnail, react_flow_state, expires_on, archived } = req.body;

    try {
        const updatedTopology = await prisma.topology.update({
            where: { id: parseInt(id) },
            data: {
                name,
                thumbnail: Buffer.from(thumbnail, 'base64'), // Assuming thumbnail is sent as a base64 string
                react_flow_state,
                expires_on: new Date(expires_on),
                archived,
            },
        });

        res.status(200).json(updatedTopology);
    } catch (error) {
        res.status(500).json({ message: 'Error updating topology', error });
    }
});

// delete a topology by ID
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const { id } = req.params;

    try {
        await prisma.topology.delete({
            where: { id: parseInt(id) },
        });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting topology', error });
    }
});

export default router;