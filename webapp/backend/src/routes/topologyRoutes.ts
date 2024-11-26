import { Prisma, PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { authenticateToken } from '../middleware/authTokenMiddleware';
import { AuthenticatedRequest, Topology } from '../types/types';

const prisma = new PrismaClient();
const router = Router();

// create a new topology
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const { userId } = req.user;
    const { name } = req.body;

    try {
        const newTopology = await prisma.topology.create({
            data: {
                user_id: userId,
                name,
                thumbnail: Buffer.from([0]), // default to empty buffer
                react_flow_state: JSON.stringify({}),
                expires_on: new Date(Date.now() + 6 * 60 * 60 * 1000), // default to 6 hours from now
                archived: false,
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

    const { userId } = req.user;

    try {
        const topologies = await prisma.topology.findMany({
            where: {
                user_id: userId,
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
    // check if we are authenticated
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    // check to make sure the id is numeric
    const { id } = req.params;
    if (isNaN(Number(id))) {
        res.status(400).json({ message: 'Invalid ID format' });
        return;
    }

    const { name, thumbnail, react_flow_state, expires_on, archived } = req.body as Topology;

    try {
        const updatedTopology = await prisma.topology.update({
            where: { id: parseInt(id) },
            data: {
                name: name ?? Prisma.skip,
                thumbnail: thumbnail ? Buffer.from(thumbnail, 'base64') : Prisma.skip, // Assuming thumbnail is sent as a base64 string
                react_flow_state: react_flow_state ?? Prisma.skip,
                expires_on: expires_on ? new Date(expires_on) : Prisma.skip,
                archived: archived ?? Prisma.skip,
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

    // validate id
    const topologyId = parseInt(id);
    if (isNaN(topologyId)) {
        res.status(400).json({ message: 'Invalid topology ID format' });
        return;
    }

    try {
        // check if the topology exists
        const topology = await prisma.topology.findUnique({
            where: { id: topologyId }
        });

        if (!topology) {
            res.status(404).json({ message: 'Topology not found' });
            return;
        }

        await prisma.topology.delete({
            where: { id: topologyId },
        });

        res.status(200).json({ topologyId });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting topology', error });
    }
});

export default router;