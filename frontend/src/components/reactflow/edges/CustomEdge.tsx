import {
    BaseEdge,
    EdgeLabelRenderer,
    getStraightPath,
    useStore,
    type EdgeProps,
    type ReactFlowState,
} from '@xyflow/react';
import { getCurvedPath } from '../../../lib/helpers';

// Define the parameter type for path functions
export type GetSpecialPathParams = {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
};

export default function MultiPathEdge({
    id,
    source,
    target,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
}: EdgeProps & { data?: { sourcePort?: string; targetPort?: string; edgeType?: number; forcePathType?: number } }) {
    // Get edge info from store
    const edgeInfo = useStore((s: ReactFlowState) => {
        // Get all edges between these nodes (both directions)
        const allEdgesBetweenNodes = s.edges.filter(
            (e) =>
                (e.source === source && e.target === target) ||
                (e.source === target && e.target === source)
        );

        // Count edges going from source to target (same direction)
        const parallelEdges = s.edges.filter(
            (e) => e.source === source && e.target === target
        );

        // Find the index of the current edge among parallel edges
        const edgeIndex = parallelEdges.findIndex((e) => e.id === id);

        // Get total count of edges
        const totalEdgeCount = parallelEdges.length;

        return {
            edgeIndex,
            totalEdgeCount,
            allEdgesCount: allEdgesBetweenNodes.length
        };
    });

    const edgePathParams = {
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    };

    // Determine path type
    // 1. Use forced path type if provided in data
    // 2. Otherwise, calculate based on index
    const pathType = data?.forcePathType !== undefined
        ? data.forcePathType
        : (data?.edgeType !== undefined ? data.edgeType : edgeInfo.edgeIndex);

    // For more than 3 edges, we need a strategy to distribute them
    const getPathOffset = () => {
        // Calculate base offset - depends on the total number of edges
        // More edges = larger base offset to better separate them
        const baseOffset = 40 + (edgeInfo.totalEdgeCount * 5);

        if (pathType === 0) {
            // First edge is straight
            return 0;
        } else {
            // For other edges, calculate an appropriate offset
            // Odd path types go above, even path types go below
            const isAbove = pathType % 2 === 1;

            // Calculate magnitude based on how far from the center we are
            // (pathType + 1) / 2 gives us 1, 1, 2, 2, 3, 3, etc.
            const magnitude = Math.ceil(pathType / 2) * baseOffset;

            // Apply direction based on whether it should be above or below
            return isAbove ? magnitude : -magnitude;
        }
    };

    const offset = getPathOffset();

    // calculate path based on path type and offset
    let path = '';

    if (pathType === 0) {
        // first edge is straight
        [path] = getStraightPath(edgePathParams);
    } else {
        // all other edges are curved with varying offsets
        path = getCurvedPath(
            { sourceX, sourceY, targetX, targetY },
            offset
        );
    }

    // calculate label positions based on the path type
    const calculateLabelPosition = () => {
        // base position calculations (percentage along the path)
        const startPos = {
            x: sourceX + (targetX - sourceX) * 0.2,
            y: sourceY + (targetY - sourceY) * 0.2
        };

        const endPos = {
            x: sourceX + (targetX - sourceX) * 0.8,
            y: sourceY + (targetY - sourceY) * 0.8
        };

        // if it's a curved path, adjust label positions to follow the curve
        if (pathType !== 0) {
            const dx = targetX - sourceX;
            const dy = targetY - sourceY;
            const length = Math.sqrt(dx * dx + dy * dy);
            const perpX = -dy / length;
            const perpY = dx / length;

            // add a scaled offset in the curve direction
            // we use a factor to avoid placing labels too far from the visible path
            const offsetFactor = 0.25;
            startPos.x += perpX * offset * offsetFactor;
            startPos.y += perpY * offset * offsetFactor;
            endPos.x += perpX * offset * offsetFactor;
            endPos.y += perpY * offset * offsetFactor;
        }

        return { startPos, endPos };
    };

    const { startPos, endPos } = calculateLabelPosition();

    return (
        <>
            <BaseEdge path={path} />
            <EdgeLabelRenderer>
                {data?.sourcePort && (
                    <div
                        className="text-black font-bold absolute text-[0.5rem]"
                        style={{ transform: `translate(-50%, -50%) translate(${startPos.x}px, ${startPos.y}px)` }}
                    >
                        {data.sourcePort}
                    </div>
                )}
                {data?.targetPort && (
                    <div
                        className="text-black font-bold absolute text-[0.5rem]"
                        style={{ transform: `translate(-50%, -50%) translate(${endPos.x}px, ${endPos.y}px)` }}
                    >
                        {data.targetPort}
                    </div>
                )}
            </EdgeLabelRenderer>
        </>
    );
}