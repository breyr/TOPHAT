import { Edge, Node, useReactFlow } from "@xyflow/react";
import { Trash } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { generatePorts } from "../../../lib/helpers";
import { Device } from "../../../models/Device";
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
    const [labDevices, setLabDevices] = useState<Device[]>([]);
    const [currentDevicePorts, setCurrentDevicePorts] = useState<string[]>([]);
    const [isCreateLinkModalOpen, setIsCreateLinkModalOpen] = useState<boolean>(false);
    const [isDeleteLinkModalOpen, setIsDeleteLinkModalOpen] = useState<boolean>(false);
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

    const deleteNode = useCallback(() => {
        if (deviceData) {
            setNodes((nodes) => nodes.filter((n) => n.data.deviceData?.id !== deviceData.id));
            onClick();
        }
    }, [deviceData, setNodes]);

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