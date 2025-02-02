import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { generatePorts } from "../../../lib/helpers";
import { Device } from "../../../models/Device";
import PortSelectionModal from "./PortSelectionModal";

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
    bottom
}: ContextMenuProps) {
    const { authenticatedApiClient } = useAuth();
    const [labDevices, setLabDevices] = useState<Device[]>([]);
    const [currentDevicePorts, setCurrentDevicePorts] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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

    return (
        <div
            style={{ top, left, right, bottom }}
            className="absolute z-10 h-40 w-52 overflow-y-auto bg-white border border-gray-300 rounded shadow-lg p-4"
            onClick={(event) => event.stopPropagation()}
        >
            <div className="mb-2">
                <h3 className="text-blue-500 text-lg font-bold">
                    {deviceData?.name}
                </h3>
            </div>
            <div className="flex flex-col flex-wrap text-sm mb-2">
                <span><strong>Model:</strong> {deviceData?.model}</span>
                <span><strong>SN:</strong> {deviceData?.serialNumber}</span>
            </div>
            <button className="r-btn primary w-full" onClick={() => setIsModalOpen(true)}>Create Link</button>
            {isModalOpen && deviceData && (
                <PortSelectionModal
                    deviceData={deviceData}
                    currentDevicePorts={currentDevicePorts}
                    labDevices={labDevices}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
}