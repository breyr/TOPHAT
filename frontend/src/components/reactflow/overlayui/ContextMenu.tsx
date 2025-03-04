import { Edge, Node, useEdges, useReactFlow } from "@xyflow/react";
import { Trash } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useLinkOperations } from "../../../hooks/useLinkOperations";
import { generatePorts } from "../../../lib/helpers";
import { Device } from "../../../models/Device";
import { CustomEdge } from "../../../types/frontend";
import { Option } from "../../MultiSelect";
import CreateLinkModal from "./CreateLinkModal";
import DeleteLinkModal from "./DeleteLinkModal";

export interface ContextMenuProps {
    deviceData?: Device | undefined;
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
    onClick: () => void;
}

export default function ContextMenu({
    deviceData,
    top,
    left,
    right,
    bottom,
    onClick
}: ContextMenuProps) {
    const { authenticatedApiClient } = useAuth();
    const edges = useEdges<CustomEdge>();
    const { deleteLinkBulk } = useLinkOperations();
    const [labDevices, setLabDevices] = useState<Device[]>([]);
    const [currentDevicePorts, setCurrentDevicePorts] = useState<string[]>([]);
    const [isCreateLinkModalOpen, setIsCreateLinkModalOpen] = useState<boolean>(false);
    const [isDeleteLinkModalOpen, setIsDeleteLinkModalOpen] = useState<boolean>(false);
    const [currentEdges, setCurrentEdges] = useState<Option[]>([]);
    const { setNodes } = useReactFlow<Node<{ deviceData?: Device; }>, Edge>();

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
        if (deviceData) {
            const portsArray = deviceData.ports.split(',');
            const generatedPorts = portsArray.flatMap(portDef => generatePorts(portDef));
            setCurrentDevicePorts(generatedPorts);
        }
    }, [deviceData]);

    // get edges for this node
    useEffect(() => {
        const edgesForDevice = edges.filter(e => e.source === deviceData?.name).map(e => ({
            value: e.id,
            label: `(${e.source}) ${e.data?.sourcePort ?? ''} -> (${e.target}) ${e.data?.targetPort ?? ''}`,
            firstLabDevice: e.source,
            firstLabDevicePort: e.data?.sourcePort ?? '',
            secondLabDevice: e.target,
            secondLabDevicePort: e.data?.targetPort ?? '',
        }));
        setCurrentEdges(edgesForDevice);
    }, [edges, deviceData]);

    const deleteNode = useCallback(async () => {
        if (!deviceData) {
            onClick(); // Close the context menu if no device data
            return;
        }

        // Note: unbooking logic is kept within TopologyCanvas.tsx
        try {
            // Check if the device has any edges
            const edgesForDevice = edges.filter(e => e.source === deviceData.name || e.target === deviceData.name);
            console.log(edgesForDevice);
            if (edgesForDevice.length > 0) {
                // attempt to delete all links
                const numFailures = await deleteLinkBulk(new Set(currentEdges));

                // only remove the node if all links were successfully deleted
                if (numFailures === 0) {
                    setNodes((nodes) => nodes.filter((n) => n.data.deviceData?.id !== deviceData.id));
                }
            } else {
                // unbook device
                setNodes((nodes) => nodes.filter((n) => n.data.deviceData?.id !== deviceData.id));
            }
        } catch (error) {
            console.error("Error deleting node:", error);
        } finally {
            onClick(); // close the context menu
        }
    }, [deviceData, setNodes, currentEdges]);

    return (
        <div
            style={{ top, left, right, bottom }}
            className="absolute z-10 h-40 w-52 overflow-y-auto bg-[#ffffff] border border-gray-300 rounded-md shadow-lg p-5 pt-4"
            onClick={(event) => event.stopPropagation()}
        >
            <div className="mb-2 flex flex-row justify-between items-center">
                <h3 className="text-lg font-bold">
                    {deviceData?.name}
                </h3>
                <button onClick={deleteNode}><Trash className="text-red-600 hover:bg-red-200 hover:rounded-full p-1" size={30} /></button>
            </div>
            {/* <div className="flex flex-col flex-wrap text-sm mb-2">
                <span><strong>Model:</strong> {deviceData?.model}</span>
                <span><strong>SN:</strong> {deviceData?.serialNumber}</span>
            </div> */}
            <button className="r-btn secondary w-full mb-3" onClick={() => setIsCreateLinkModalOpen(true)}>Create Link</button>
            <button className="r-btn secondary danger w-full" onClick={() => setIsDeleteLinkModalOpen(true)}>Delete Link</button>
            {isCreateLinkModalOpen && deviceData && (
                <CreateLinkModal
                    deviceData={deviceData}
                    currentDevicePorts={currentDevicePorts}
                    labDevices={labDevices}
                    onClose={() => setIsCreateLinkModalOpen(false)}
                />
            )}
            {isDeleteLinkModalOpen && deviceData && (
                <DeleteLinkModal
                    deviceData={deviceData}
                    onClose={() => setIsDeleteLinkModalOpen(false)}
                />
            )}
        </div>
    );
}