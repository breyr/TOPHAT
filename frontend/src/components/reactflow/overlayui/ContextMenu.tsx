import { Edge, Node, useEdges, useReactFlow } from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useEscapeKey } from "../../../hooks/useEscapeKey";
import { useLinkOperations } from "../../../hooks/useLinkOperations";
import { generatePorts } from "../../../lib/helpers";
import { Device } from "../../../models/Device";
import { CustomEdge } from "../../../types/frontend";
import { Option } from "../../MultiSelect";
import CreateLinkModal from "./CreateLinkModal";
import DeleteLinkModal from "./DeleteLinkModal";

export interface ContextMenuProps {
    id: string;
    top: number;
    left: number;
    onClick: () => void;
}

export default function ContextMenu({
    id,
    top,
    left,
    onClick,
    ...props
}: ContextMenuProps) {
    const { authenticatedApiClient } = useAuth();
    const edges = useEdges<CustomEdge>();
    const { deleteLinkBulk } = useLinkOperations();
    const [labDevices, setLabDevices] = useState<Device[]>([]);
    const [currentDevicePorts, setCurrentDevicePorts] = useState<string[]>([]);
    const [isCreateLinkModalOpen, setIsCreateLinkModalOpen] = useState<boolean>(false);
    const [isDeleteLinkModalOpen, setIsDeleteLinkModalOpen] = useState<boolean>(false);
    const [currentEdges, setCurrentEdges] = useState<Option[]>([]);
    const [disableDelete, setDisableDelete] = useState<boolean>(false);
    const { setNodes, getNode } = useReactFlow<Node<{ deviceData?: Device; }>, Edge>();

    const node = getNode(id);

    useEscapeKey(() => onClick());

    useEffect(() => {
        const fetchLabDevices = async () => {
            try {
                const res = await authenticatedApiClient.getDevicesByType('LAB');
                setLabDevices(res.data || []);
            } catch (error) {
                console.error("Failed to fetch lab devices:", error);
            }
        };

        fetchLabDevices();
    }, [authenticatedApiClient]);

    useEffect(() => {
        if (node) {
            const portsArray = node.data.deviceData?.ports.split(',');
            const generatedPorts = portsArray?.flatMap(portDef => generatePorts(portDef));
            setCurrentDevicePorts(generatedPorts ?? []);
        }
    }, [node]);

    // get edges for this node
    useEffect(() => {
        const edgesForDevice = edges.filter(e => e.source === node?.data.deviceData?.name).map(e => ({
            value: e.id,
            label: `(${e.source}) ${e.data?.sourcePort ?? ''} -> (${e.target}) ${e.data?.targetPort ?? ''}`,
            firstLabDevice: e.source,
            firstLabDevicePort: e.data?.sourcePort ?? '',
            secondLabDevice: e.target,
            secondLabDevicePort: e.data?.targetPort ?? '',
        }));
        setCurrentEdges(edgesForDevice);
    }, [edges, node]);

    const deleteNode = useCallback(async () => {
        if (!node) {
            onClick(); // Close the context menu if no device data
            return;
        }

        // Note: unbooking logic is kept within TopologyCanvas.tsx
        try {
            onClick(); // close the context menu
            setDisableDelete(true);
            // Check if the device has any edges
            const edgesForDevice = edges.filter(e => e.source === node?.data.deviceData?.name || e.target === node?.data.deviceData?.name);
            console.log(edgesForDevice);
            if (edgesForDevice.length > 0) {
                // attempt to delete all links
                const numFailures = await deleteLinkBulk(new Set(currentEdges));

                // only remove the node if all links were successfully deleted
                if (numFailures === 0) {
                    setNodes((nodes) => nodes.filter((n) => n.data.deviceData?.id !== node?.data.deviceData?.id));
                }
            } else {
                // unbook device
                setNodes((nodes) => nodes.filter((n) => n.data.deviceData?.id !== node?.data.deviceData?.id));
            }
        } catch (error) {
            console.error("Error deleting node:", error);
        } finally {
            setDisableDelete(false);
        }
    }, [node, setNodes, currentEdges]);

    return (
        <>
            <div
                style={{ top, left }}
                className="absolute z-10 bg-gray-100 border border-gray-300 rounded-md shadow-lg p-1 flex flex-col gap-1"
                onClick={(event) => event.stopPropagation()}
                {...props}
            >
                <button className="r-btn w-full hover:bg-gray-200 text-left" onClick={() => setIsCreateLinkModalOpen(true)}>Create Link</button>
                <button className="r-btn w-full hover:bg-gray-200 text-left" onClick={() => setIsDeleteLinkModalOpen(true)}>Delete Link</button>
                <button onClick={deleteNode} disabled={disableDelete} className="r-btn w-full hover:bg-red-200 text-left">Remove Device </button>
            </div>
            {isCreateLinkModalOpen && node && (
                <CreateLinkModal
                    deviceData={node?.data.deviceData}
                    currentDevicePorts={currentDevicePorts}
                    labDevices={labDevices}
                    onClose={() => setIsCreateLinkModalOpen(false)}
                />
            )}
            {isDeleteLinkModalOpen && node && (
                <DeleteLinkModal
                    deviceData={node?.data.deviceData}
                    onClose={() => setIsDeleteLinkModalOpen(false)}
                />
            )}
        </>
    );
}