import { ChevronsRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { Device } from "../../../models/Device";

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
    const [selectedLabDevice, setSelectedLabDevice] = useState<string>("");
    const [availablePorts, setAvailablePorts] = useState<string[]>([]);
    const [currentDevicePorts, setCurrentDevicePorts] = useState<string[]>([]);
    const [portMap, setPortMap] = useState<{ [key: string]: string }>({});

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

    useEffect(() => {
        if (selectedLabDevice) {
            const device = labDevices.find(d => d.name === selectedLabDevice);
            if (device) {
                const portsArray = device.ports.split(',');
                const generatedPorts = portsArray.flatMap(portDef => generatePorts(portDef));
                setAvailablePorts(generatedPorts);
            }
        }
    }, [selectedLabDevice, labDevices]);

    const generatePorts = (portDefinition: string): string[] => {
        const [prefix, range] = portDefinition.split('|');
        if (!range) return [];
        const [start, end] = range.split('-').map(Number);
        if (isNaN(start) || isNaN(end)) return [];
        return Array.from({ length: end - start + 1 }, (_, i) => `${prefix}${start + i}`);
    };

    const handlePortMappingChange = (currentPort: string, selectedPort: string) => {
        setPortMap(prevMap => ({
            ...prevMap,
            [currentPort]: selectedPort,
        }));
    };

    return (
        <div
            style={{ top, left, right, bottom }}
            className="absolute z-10 w-1/5 h-96 overflow-y-auto bg-white border border-gray-300 rounded shadow-lg p-4"
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
            <h4 className="mb-2">Create Link</h4>
            <div className="mb-2">
                <label className="inline-block text-sm font-bold mr-2">Device: </label>
                <select
                    value={selectedLabDevice}
                    onChange={(e) => setSelectedLabDevice(e.target.value)}
                    className="sm:text-sm rounded-md bg-white focus:outline-none"
                >
                    <option value="">Select a Device</option>
                    {labDevices
                        .filter((device) => device.name !== deviceData?.name)
                        .map((device) => (
                            <option key={device.id} value={device.name}>
                                {device.name}
                            </option>
                        ))}
                </select>
            </div>
            {selectedLabDevice && (
                <div className="mb-2">
                    <div className="flex flex-row items-center justify-between mb-2">
                        <label className="block text-sm font-bold">
                            {deviceData?.name}
                        </label>
                        <label className="block text-sm font-bold text-blue-400">
                            <ChevronsRight />
                        </label>
                        <label className="block text-sm font-bold">
                            {selectedLabDevice}
                        </label>
                    </div>
                    <div className="flex flex-col">
                        <div>
                            {currentDevicePorts.map((currentPort, index) => (
                                <div key={index} className="flex flex-row justify-between mb-2">
                                    <span className="text-base sm:text-sm">{currentPort}</span>
                                    <select
                                        value={portMap[currentPort] || ""}
                                        onChange={(e) => handlePortMappingChange(currentPort, e.target.value)}
                                        className="bg-white focus:outline-none text-base sm:text-sm"
                                    >
                                        <option value="">Select Port</option>
                                        {availablePorts.map((port, idx) => (
                                            <option key={idx} value={port}>
                                                {port}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}