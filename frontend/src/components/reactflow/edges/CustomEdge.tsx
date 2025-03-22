import {
    BaseEdge,
    EdgeLabelRenderer,
    getStraightPath,
    useStore,
    type EdgeProps,
    type ReactFlowState,
} from '@xyflow/react';
import { getCurvedPath, substringFromFirstNumber } from '../../../lib/helpers';

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
}: EdgeProps & { data?: { sourcePort?: string; targetPort?: string; edgeType?: number; forcePathType?: number, status?: string } }) {
    // Get edge info from store with improved bidirectional handling
    const edgeInfo = useStore((s: ReactFlowState) => {
        // Find all edges between these two nodes (both directions)
        const edgesBetweenNodes = s.edges.filter(e =>
            (e.source === source && e.target === target) ||
            (e.source === target && e.target === source)
        );

        // Group edges by their exact direction
        const sourceToTargetEdges = edgesBetweenNodes.filter(e =>
            e.source === source && e.target === target
        );
        const targetToSourceEdges = edgesBetweenNodes.filter(e =>
            e.source === target && e.target === source
        );

        // Determine which direction group this edge belongs to
        const isSourceToTarget = source === source && target === target;

        // Find index of this edge within its direction group
        const edgesInSameDirection = isSourceToTarget ? sourceToTargetEdges : targetToSourceEdges;
        const edgeIndex = edgesInSameDirection.findIndex(e => e.id === id);

        // Count edges in each direction
        const sourceToTargetCount = sourceToTargetEdges.length;
        const targetToSourceCount = targetToSourceEdges.length;

        // Determine if this is a bidirectional case (edges exist in both directions)
        const hasBidirectionalEdges = sourceToTargetCount > 0 && targetToSourceCount > 0;

        // Total number of edges between the nodes
        const totalEdgeCount = sourceToTargetCount + targetToSourceCount;

        let calculatedPathType;

        if (data?.forcePathType !== undefined) {
            // Use forced path type if provided
            calculatedPathType = data.forcePathType;
        } else if (data?.edgeType !== undefined) {
            // Use provided edge type
            calculatedPathType = data.edgeType;
        } else if (hasBidirectionalEdges) {
            // For bidirectional edges:
            // Always make one edge straight when there's an odd total count
            const shouldHaveStraightEdge = totalEdgeCount % 2 === 1;

            if (shouldHaveStraightEdge) {
                // When we have an odd total number of edges between nodes:
                if (sourceToTargetCount >= targetToSourceCount) {
                    // If source→target has more edges, make one of them straight
                    if (isSourceToTarget && edgeIndex === 0) {
                        calculatedPathType = 0; // First source→target edge is straight
                    } else if (isSourceToTarget) {
                        // Other source→target edges get positive curves
                        calculatedPathType = 1 + ((edgeIndex - 1) * 2); // Odd numbers: 1, 3, 5...
                    } else {
                        // All target→source edges get negative curves
                        calculatedPathType = -2 - (edgeIndex * 2); // Even negative numbers: -2, -4, -6...
                    }
                } else {
                    // If target→source has more edges, make one of them straight
                    if (!isSourceToTarget && edgeIndex === 0) {
                        calculatedPathType = 0; // First target→source edge is straight
                    } else if (!isSourceToTarget) {
                        // Other target→source edges get negative curves
                        calculatedPathType = -2 - ((edgeIndex - 1) * 2); // Even negative numbers: -2, -4, -6...
                    } else {
                        // All source→target edges get positive curves
                        calculatedPathType = 1 + (edgeIndex * 2); // Odd numbers: 1, 3, 5...
                    }
                }
            } else {
                // Even total edge count - all edges are curved
                if (isSourceToTarget) {
                    // Source→Target edges get positive curves
                    calculatedPathType = 1 + (edgeIndex * 2); // Odd numbers: 1, 3, 5...
                } else {
                    // Target→Source edges get negative curves
                    calculatedPathType = -2 - (edgeIndex * 2); // Even negative numbers: -2, -4, -6...
                }
            }
        } else {
            // Single direction case
            // If odd number of edges, make the first one straight and the rest curved
            if (edgesInSameDirection.length % 2 === 1 && edgeIndex === 0) {
                calculatedPathType = 0; // First edge is straight
            } else {
                // For curved edges, alternate between positive and negative
                const indexOffset = edgesInSameDirection.length % 2 === 1 ? 1 : 0;
                const curveIndex = edgeIndex + indexOffset;
                calculatedPathType = curveIndex % 2 === 0 ? (curveIndex + 1) : -(curveIndex + 1);
            }
        }

        return {
            pathType: calculatedPathType,
            totalEdgeCount: edgesInSameDirection.length,
            allEdgesCount: totalEdgeCount,
            hasBidirectionalEdges,
            isSourceToTarget
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

    // Use the calculated path type
    const pathType = edgeInfo.pathType;

    // Calculate angle and distance to determine optimal curve parameters
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;

    // Determine connection orientation
    const isVertical = Math.abs(dx) < 20; // Nearly vertical
    const isHorizontal = Math.abs(dy) < 20; // Nearly horizontal

    // Get appropriate offset based on path type and connection characteristics
    const getPathOffset = () => {
        // Base offset adjusted by connection type
        let baseOffset;

        if (isVertical) {
            // For vertical connections, use a larger offset to spread edges horizontally
            baseOffset = 50;
        } else if (isHorizontal) {
            // For horizontal connections
            baseOffset = 35;
        } else {
            // For diagonal connections
            baseOffset = 40;
        }

        if (pathType === 0) {
            // Straight edge
            return 0;
        } else {
            // Get the absolute path type (ignoring sign)
            const absPathType = Math.abs(pathType);

            // Calculate magnitude based on path type
            const magnitude = Math.ceil(absPathType / 2) * baseOffset;

            // Use the sign of the path type to determine direction
            return pathType > 0 ? magnitude : -magnitude;
        }
    };

    const offset = getPathOffset();

    // Calculate path based on path type and offset
    let path = '';

    if (pathType === 0) {
        // Use straight path when pathType is 0
        [path] = getStraightPath(edgePathParams);
    } else {
        // Use curved path with calculated offset
        path = getCurvedPath(
            { sourceX, sourceY, targetX, targetY },
            offset
        );
    }

    // Calculate label positions based on the path
    const calculateLabelPosition = () => {
        // Base position calculations
        const startPos = {
            x: sourceX + (targetX - sourceX) * 0.2,
            y: sourceY + (targetY - sourceY) * 0.2
        };

        const endPos = {
            x: sourceX + (targetX - sourceX) * 0.8,
            y: sourceY + (targetY - sourceY) * 0.8
        };

        // Adjust for curve
        if (pathType !== 0) {
            const dx = targetX - sourceX;
            const dy = targetY - sourceY;
            const length = Math.sqrt(dx * dx + dy * dy);
            const perpX = -dy / length;
            const perpY = dx / length;

            // Scaled offset for label positioning
            const offsetFactor = 0.25;
            startPos.x += perpX * offset * offsetFactor;
            startPos.y += perpY * offset * offsetFactor;
            endPos.x += perpX * offset * offsetFactor;
            endPos.y += perpY * offset * offsetFactor;
        }

        return { startPos, endPos };
    };

    const { startPos, endPos } = calculateLabelPosition();

    const edgeStyle = {
        stroke: data?.status === 'deleting' ? 'oklch(0.808 0.114 19.571)' : 'lightgray',
        strokeWidth: (data?.status === 'pending' || data?.status === 'deleting') ? 1 : 2,
        strokeDasharray: (data?.status === 'pending' || data?.status === 'deleting') ? '2 4' : '0',
    };

    return (
        <>
            <BaseEdge path={path} style={edgeStyle} />
            <EdgeLabelRenderer>
                {data?.sourcePort && (
                    <div
                        className="text-black font-bold absolute text-[0.5rem]"
                        style={{ transform: `translate(-50%, -50%) translate(${startPos.x}px, ${startPos.y}px)` }}
                    >
                        {substringFromFirstNumber(data.sourcePort)}
                    </div>
                )}
                {data?.targetPort && (
                    <div
                        className="text-black font-bold absolute text-[0.5rem]"
                        style={{ transform: `translate(-50%, -50%) translate(${endPos.x}px, ${endPos.y}px)` }}
                    >
                        {substringFromFirstNumber(data.targetPort)}
                    </div>
                )}
            </EdgeLabelRenderer>
        </>
    );
}