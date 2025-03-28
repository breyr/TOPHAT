import { Edge } from "@xyflow/react";

// types of custom nodes
export type NodeType = "Switch" | "Router" | "Server" | "External";

export interface CustomEdge extends Edge {
    data: {
        sourcePort: string;
        targetPort: string;
    }
}