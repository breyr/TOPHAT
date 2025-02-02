import {
    BaseEdge,
    EdgeLabelRenderer,
    getBezierPath,
    useInternalNode,
    type EdgeProps,
} from '@xyflow/react';
import { getEdgeParams } from '../../../lib/helpers';

export default function DeviceConnection({
    source,
    target,
    style = {},
    markerEnd,
    markerStart,
    data,
}: EdgeProps & { data?: { sourcePort?: string; targetPort?: string } }) {
    const sourceNode = useInternalNode(source);
    const targetNode = useInternalNode(target);

    if (!sourceNode || !targetNode) {
        return null;
    }

    const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
        sourceNode,
        targetNode,
    );

    const [edgePath] = getBezierPath({
        sourceX: sx,
        sourceY: sy,
        sourcePosition: sourcePos,
        targetPosition: targetPos,
        targetX: tx,
        targetY: ty,
    });

    // Calculate two points along the edge path for label positioning
    const sourceLabelX = (4 * sx + tx) / 5;
    const sourceLabelY = (4 * sy + ty) / 5;
    const targetLabelX = (sx + 4 * tx) / 5;
    const targetLabelY = (sy + 4 * ty) / 5;

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} markerStart={markerStart} style={style} />
            <EdgeLabelRenderer>
                <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 bg-white border rounded p-1"
                    style={{ left: sourceLabelX, top: sourceLabelY }}
                >
                    <p className="text-[0.3rem]">{data?.sourcePort}</p>
                </div>
                <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 bg-white border rounded p-1"
                    style={{ left: targetLabelX, top: targetLabelY }}
                >
                    <p className="text-[0.3rem]">{data?.targetPort}</p>
                </div>
            </EdgeLabelRenderer>
        </>
    );
}