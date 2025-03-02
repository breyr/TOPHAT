import type { Connection, Edge, EdgeChange, Node, NodeChange, ReactFlowInstance } from "@xyflow/react";
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
    getNodesBounds,
    getViewportForBounds,
    useReactFlow
} from "@xyflow/react";
import "@xyflow/react/dist/base.css"; // use to make custom node css
import { toJpeg } from 'html-to-image';
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { type ReactFlowState } from "../../../../common/src/index";
import { useAuth } from "../../hooks/useAuth.ts";
import { useToast } from "../../hooks/useToast.ts";
import { useTopology } from "../../hooks/useTopology.ts";
import { debounce } from "../../lib/helpers.ts";
import { Device } from "../../models/Device.ts";
import CustomEdge from "./edges/CustomEdge.tsx";
import ExternalNode from "./nodes/ExternalNode.tsx";
import RouterNode from "./nodes/RouterNode.tsx";
import ServerNode from "./nodes/ServerNode.tsx";
import SwitchNode from "./nodes/SwitchNode.tsx";
import ContextMenu, { ContextMenuProps } from "./overlayui/ContextMenu.tsx";
import NodePicker from "./overlayui/NodePicker";

const initialNodes = [] satisfies Node[];
const initialEdges = [] satisfies Edge[];

// options to remove branding
const proOptions = { hideAttribution: true };

// thumbnail settings
const imageWidth = 250;
const imageHeight = 250;

// need to be memoized
const nodeTypes = {
    Switch: SwitchNode,
    Router: RouterNode,
    Server: ServerNode,
    External: ExternalNode
};

const edgeTypes = {
    Custom: CustomEdge,
};

const TopologyCanvas = () => {
    const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null); // reference to react flow instance
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);
    const [isChangesPending, setIsChangesPending] = useState(false);
    const [menu, setMenu] = useState<Partial<ContextMenuProps> | null>(null);
    const ref = useRef<HTMLDivElement>(null);
    const { setIsSaving, topologyData, setLastUpdated } = useTopology();
    const { authenticatedApiClient } = useAuth();
    const { id } = useParams();
    const { getNodes } = useReactFlow();
    const { addToast } = useToast();

    // load information from db on mount
    useEffect(() => {
        setNodes(topologyData?.reactFlowState?.nodes ?? []);
        setEdges(topologyData?.reactFlowState?.edges ?? []);
    }, [topologyData]);

    const onNodeContextMenu = useCallback(
        (event, node: Node) => {
            // Prevent native context menu from showing
            event.preventDefault();

            // Calculate position of the context menu. We want to make sure it
            // doesn't get positioned off-screen.
            if (!ref.current) return;
            const pane = ref.current.getBoundingClientRect();
            setMenu({
                deviceData: node.data.deviceData as Device,
                top: event.clientY < pane.height - 200 && event.clientY,
                left: event.clientX < pane.width - 200 && event.clientX,
                right: event.clientX >= pane.width - 200 ? pane.width - event.clientX : 0,
                bottom: event.clientY >= pane.height - 200 ? pane.height - event.clientY : 0,
            });
        },
        [setMenu],
    );
    const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

    // logic to save a topology's react-flow state into the database
    const saveTopology = useCallback(async () => {
        if (rfInstance) {
            // update saving state
            setIsSaving(true);

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

                // at this point id exists and is a number otherwise the topology wouldn't be loaded
                // this does return the updated topology, but we don't need it
                const res = await authenticatedApiClient.updateTopology(parseInt(id!), {
                    reactFlowState: flow as ReactFlowState,
                    thumbnail: base64Thumbnail
                });

                // set last updated
                if (res.data) {
                    const updatedAt = new Date(res?.data?.updatedAt);
                    setLastUpdated(updatedAt.toLocaleString());
                }
            } catch (error) {
                console.error("Failed to save topology state:", error);
            } finally {
                setIsSaving(false);
            }
        }
    }, [id, rfInstance, getNodes, authenticatedApiClient, setIsSaving, setLastUpdated]);

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
        async (changes: NodeChange[]) => {
            const nodesToRemove = changes.filter(change => change.type === 'remove');

            // if there are nodes being removed, unbook them first
            if (nodesToRemove.length > 0) {
                nodesToRemove.forEach(async (change) => {
                    const nodeToRemove = nodes.find(node => node.id === change.id) as Node<{ deviceData?: Device; }>;

                    if (nodeToRemove && nodeToRemove.data?.deviceData) {
                        try {
                            await authenticatedApiClient.unbookDevice(nodeToRemove.data.deviceData.id);
                        } catch {
                            addToast({
                                id: Date.now().toString(),
                                title: 'Unbooking Device',
                                body: `Failed to unbook device ${nodeToRemove.data.deviceData.name}`,
                                status: 'error'
                            });
                        }
                    }
                });
            }

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

    const { screenToFlowPosition } = useReactFlow();
    const onDragOver = useCallback((event: React.DragEvent<HTMLElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);
    const onDrop = useCallback(
        async (event: React.DragEvent<HTMLElement>) => {
            event.preventDefault();
            const dataString = event.dataTransfer.getData("application/reactflow");
            // check if the dropped element is valid
            if (!dataString) {
                return;
            }

            // parse the data string to get the nodeType and deviceName
            const { nodeType, deviceData } = JSON.parse(dataString);

            // attempt to book device
            try {
                await authenticatedApiClient.bookDevice((deviceData as Device).id);

                // create position to place the dropped node
                const position = screenToFlowPosition({
                    x: event.clientX,
                    y: event.clientY,
                });

                // create the new node
                const newNode = {
                    id: deviceData.name,
                    type: nodeType,
                    position,
                    data: { deviceData }, // accessible within props.data for custom nodes
                };

                setNodes((oldNodes) => oldNodes.concat(newNode));
            } catch {
                addToast({ id: Date.now().toString(), title: 'Creating Link', body: `This device is booked by another user`, status: 'error' })
            }
        },
        [screenToFlowPosition, authenticatedApiClient]
    );

    return (
        <div className="h-full w-lvw">
            <ReactFlow
                ref={ref}
                proOptions={proOptions}
                edgeTypes={edgeTypes}
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
                onPaneClick={onPaneClick}
                onNodeContextMenu={onNodeContextMenu}
            >
                <Background color="rgb(247, 247, 247)" variant={BackgroundVariant.Dots} size={3} />
                {menu && <ContextMenu onClick={onPaneClick} {...menu} />}
                <Controls position="bottom-left" />
                {/* Node Picker */}
                <Panel position="top-right" className="p-0 m-0 relative">
                    <NodePicker />
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