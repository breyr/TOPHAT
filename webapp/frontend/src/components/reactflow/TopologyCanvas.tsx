import type { Connection, Edge, Node } from "@xyflow/react";
import {
    Background,
    BackgroundVariant,
    Controls,
    Panel,
    ReactFlow,
    ReactFlowProvider,
    SelectionMode,
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/base.css"; // use to make custom node css
import { TerminalSquare } from "lucide-react";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import TextUpdaterNode from "./nodes/TextUpdaterNode";
import NodePicker from "./overlayui/NodePicker";
import {useAuth} from "../../hooks/useAuth.ts";
import {useParams} from "react-router-dom";
import {Topology} from "../../types/types";

const initialNodes = [] satisfies Node[];
const initialEdges = [] satisfies Edge[];

// required for drag and drop objects
let id = 0;
const getId = () => `dndnode_${id++}`;

// options to remove branding
const proOptions = { hideAttribution: true };

const TopologyCanvas = () => {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);
    const [topologyData, setTopologyData] = useState<Topology | null>(null);
    const { token } = useAuth();
    const { id } = useParams();

    useEffect(() => {
        (async () => {
            try {
                const response = await fetch(`/api/topology/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                setTopologyData(data);
            } catch (error) {
                console.error("Failed to fetch topology data:", error);
            }
        })();
    }, [id, token]);

    const onNodesChange = useCallback(
        // @ts-expect-error changes is implicit any
        (changes) => setNodes((oldNodes) => applyNodeChanges(changes, oldNodes)),
        [setNodes]
    );

    const onEdgesChange = useCallback(
        // @ts-expect-error changes is implicit any
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges]
    );

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    // need to be memoized
    const nodeTypes = useMemo(
        () => ({
            textUpdater: TextUpdaterNode,
        }),
        []
    );

    // things to implement
    // https://reactflow.dev/examples/edges/floating-edges
    // https://reactflow.dev/examples/interaction/context-menu
    // https://reactflow.dev/examples/interaction/drag-and-drop
    const { screenToFlowPosition } = useReactFlow();
    const onDragOver = useCallback((event: React.DragEvent<HTMLElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);
    const onDrop = useCallback(
        (event: React.DragEvent<HTMLElement>) => {
            event.preventDefault();
            const type = event.dataTransfer.getData("application/reactflow");
            // check if the dropped element is valid
            if (typeof type === "undefined" || !type) {
                return;
            }

            // create position to place the dropped node
            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            // create the new node
            const newNode = {
                id: getId(),
                type,
                position,
                data: { label: `${type} node` },
            };

            // @ts-expect-error something wrong
            setNodes((oldNodes) => oldNodes.concat(newNode));
        },
        [screenToFlowPosition]
    );
    // https://reactflow.dev/examples/misc/download-image
    // https://reactflow.dev/examples/interaction/save-and-restore

    return (
        <div className="h-full w-lvw">
            <ReactFlow
                proOptions={proOptions}
                nodeTypes={nodeTypes}
                nodes={nodes}
                onNodesChange={onNodesChange}
                edges={edges}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                fitView
                panOnScroll
                selectionOnDrag
                panOnDrag={[1, 2]} // pan with mouse wheel click and right click
                selectionMode={SelectionMode.Partial}
            >
                <Background color="rgb(247, 247, 247)" variant={BackgroundVariant.Lines} />
                <Controls position="bottom-right" />
                {/* Node Picker */}
                <Panel position="top-right">
                    <NodePicker />
                </Panel>
                {/* Terminal Window */}
                <Panel position="bottom-left">
                    <div className="flex flex-row items-center border-b-2 border-blue-500 cursor-pointer pb-2">
                        <h4 className="mr-2 p-0 m-0">Terminal</h4>
                        <TerminalSquare size={20} />
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    );
};

const TopologyCanvasWrapper = () => (
    <ReactFlowProvider>
        <TopologyCanvas />
    </ReactFlowProvider>
);

export default TopologyCanvasWrapper;