import type { Connection, Edge, EdgeChange, Node, NodeChange, ReactFlowInstance } from "@xyflow/react";
import type { Topology } from "../../types/types";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
    getNodesBounds,
    getViewportForBounds
} from "@xyflow/react";
import "@xyflow/react/dist/base.css"; // use to make custom node css
import { debounce } from "../../lib/helpers.ts";
import { toJpeg } from 'html-to-image';
import { TerminalSquare } from "lucide-react";
import TextUpdaterNode from "./nodes/TextUpdaterNode";
import NodePicker from "./overlayui/NodePicker";
import { useAuth } from "../../hooks/useAuth.ts";
import { useParams } from "react-router-dom";
import { useTopologyStore } from "../../stores/topologystore";

const initialNodes = [] satisfies Node[];
const initialEdges = [] satisfies Edge[];

// required for drag and drop objects
const getId = () => `dndnode_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

// options to remove branding
const proOptions = { hideAttribution: true };

// thumbnail settings
const imageWidth = 250;
const imageHeight = 250;

const TopologyCanvas = () => {
    const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null); // reference to react flow instance
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);
    const [isChangesPending, setIsChangesPending] = useState(false);
    const { setIsSaving, setLastUpdated } = useTopologyStore();
    const { token } = useAuth();
    const { id } = useParams();
    const { getNodes } = useReactFlow();

    // load information from db on mount
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

                const data = await response.json() as Topology;
                setNodes(data.react_flow_state.nodes ?? []);
                setEdges(data.react_flow_state.edges ?? []);
            } catch (error) {
                console.error("Failed to fetch topology data:", error);
            }
        })();
    }, [id, token]);

    // logic to save a topology's react-flow state into the database
    const saveTopology = useCallback(async () => {
        if (rfInstance) {
            // update saving state
            setIsSaving(id!, true);

            // get react flow state object
            const flow = rfInstance.toObject();

            // generate thumbnail
            const nodes = getNodes();  // This will get all nodes including those in sub flows
            const nodeBounds = getNodesBounds(nodes);
            const viewport = getViewportForBounds(
                nodeBounds,
                imageHeight,
                imageWidth,
                0.5,
                2,
                20
            );

            try {
                // create thumbnail
                const dataUrl = await toJpeg(document.querySelector(".react-flow__viewport")! as HTMLElement, {
                    backgroundColor: "#fff",
                    width: imageWidth,
                    height: imageHeight,
                    style: {
                        width: imageWidth.toString(),
                        height: imageHeight.toString(),
                        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
                    }
                })

                // extract the base64 portion of the data URL
                const base64Thumbnail = dataUrl.split(',')[1];

                const response = await fetch(`/api/topology/${id}`, {
                    method: "PUT",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        react_flow_state: flow,
                        thumbnail: base64Thumbnail,
                    })
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                setLastUpdated(id!, new Date().toISOString());
            } catch (error) {
                console.error("Failed to save topology state:", error);
            } finally {
                setIsSaving(id!, false);
            }
        }
    }, [id, token, rfInstance, getNodes, setIsSaving, setLastUpdated])

    // useMemo is required here because on component re-renders, debounce will be recreated
    // this causes issues like saves being spammed
    const debouncedSaveTopology = useMemo(
        () =>
            debounce(() => {
                if (isChangesPending) {
                    saveTopology();
                    setIsChangesPending(false); // reset the pending state after saving
                }
            }, 1000),
        [isChangesPending, saveTopology]
    );

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => {
            setNodes((oldNodes) => {
                const updatedNodes = applyNodeChanges(changes, oldNodes);
                setIsChangesPending(true); // set the flag to true that changes are pending
                debouncedSaveTopology();
                return updatedNodes;
            });
        },
        [setNodes, debouncedSaveTopology]
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => {
            setEdges((oldEdges) => {
                const updatedEdges = applyEdgeChanges(changes, oldEdges);
                setIsChangesPending(true); // set the flag to true that changes are pending
                debouncedSaveTopology();
                return updatedEdges;
            });
        },
        [setEdges, debouncedSaveTopology]
    );

    const onConnect = useCallback(
        (params: Connection) => {
            setEdges((oldEdges) => {
                const updatedEdges = addEdge(params, oldEdges);
                setIsChangesPending(true); // set the flag to true that changes are pending
                debouncedSaveTopology();
                return updatedEdges;
            });
        },
        [setEdges, debouncedSaveTopology]
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

            setNodes((oldNodes) => oldNodes.concat(newNode));
        },
        [screenToFlowPosition]
    );
    // https://reactflow.dev/examples/misc/download-image

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
                onInit={setRfInstance}
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