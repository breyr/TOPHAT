import { Edge, Node, useReactFlow } from "@xyflow/react";
import { Cable, Undo2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useEscapeKey } from "../../../hooks/useEscapeKey";
import { useLinkOperations } from "../../../hooks/useLinkOperations";
import { generatePorts } from "../../../lib/helpers";
import { Device } from "../../../models/Device";

interface CreateLinkModalProps {
    deviceData?: Device;
    currentDevicePorts: string[];
    labDevices: Device[];
    onClose: () => void;
}

export default function CreateLinkModal({ deviceData, currentDevicePorts, labDevices, onClose }: CreateLinkModalProps) {
    const { user } = useAuth();
    const { getEdges, getNodes } = useReactFlow<Node<{ deviceData?: Device; }>, Edge>();
    const { createLink } = useLinkOperations();
    const [selectedFirstDevice, setSelectedFirstDevice] = useState<string>(deviceData?.name ?? "");
    const [selectedFirstDevicePort, setSelectedFirstDevicePort] = useState<string>("");
    const [selectedSecondDevice, setSelectedSecondDevice] = useState<string>("");
    const [selectedSecondDevicePort, setSelectedSecondDevicePort] = useState<string>("");
    const [availablePorts, setAvailablePorts] = useState<string[]>([]);
    const [filteredLabDevices] = useState<Device[]>(labDevices);
    const [firstDeviceOccupiedPorts, setFirstDeviceOccupiedPorts] = useState<string[]>([]);
    const [secondDeviceOccupiedPorts, setSecondDeviceOccupiedPorts] = useState<string[]>([]);

    useEscapeKey(onClose);

    // get a list of the current nodes in the topology to create a link
    const nodes = getNodes();
    const currentNodesInTopology = new Set(nodes.map(n => n.data?.deviceData?.name));

    // get occupied ports when selectedFirstDevice changes
    useEffect(() => {
        const edges = getEdges();
        const ports = edges.filter((edge: Edge) => edge.source === selectedFirstDevice || edge.target === selectedFirstDevice).map((edge: Edge) => edge.id.split('-').filter((port: string) => port !== 'edge'));
        setFirstDeviceOccupiedPorts(ports.flat());
    }, [selectedFirstDevice, getEdges]);

    // get occupied ports when selectedSecondDevice changes
    useEffect(() => {
        const edges = getEdges();
        const ports = edges.filter((edge: Edge) => edge.source === selectedSecondDevice || edge.target === selectedSecondDevice).map((edge: Edge) => edge.id.split('-').filter((port: string) => port !== 'edge'));
        setSecondDeviceOccupiedPorts(ports.flat());
    }, [selectedSecondDevice, getEdges]);

    useEffect(() => {
        if (deviceData?.name) {
            setSelectedFirstDevice(deviceData.name);
        }
    }, [deviceData]);

    useEffect(() => {
        if (selectedFirstDevice) {
            const device = labDevices.find(d => d.name === selectedFirstDevice);
            if (device) {
                const portsArray = device.ports.split(',');
                const generatedPorts = portsArray.flatMap(portDef => generatePorts(portDef));
                setAvailablePorts(generatedPorts);
            }
        } else {
            setAvailablePorts([]);
        }
    }, [selectedFirstDevice, labDevices]);

    useEffect(() => {
        if (selectedSecondDevice) {
            const device = labDevices.find(d => d.name === selectedSecondDevice);
            if (device) {
                const portsArray = device.ports.split(',');
                const generatedPorts = portsArray.flatMap(portDef => generatePorts(portDef));
                setAvailablePorts(generatedPorts);
            }
        } else {
            setAvailablePorts([]);
        }
    }, [selectedSecondDevice, labDevices]);

    const handleCreateLink = async () => {
        onClose();
        await createLink({
            firstDeviceName: selectedFirstDevice,
            firstDevicePort: selectedFirstDevicePort,
            secondDeviceName: selectedSecondDevice,
            secondDevicePort: selectedSecondDevicePort
        });
    }

    return (
        <section className="bg-zinc-950 bg-opacity-50 w-full h-full fixed top-0 left-0 flex items-center justify-center z-50">
            <div className="bg-[#ffffff] w-2/5 p-6 rounded-lg shadow-lg">
                <div className="flex flex-row justify-between items-center">
                    <h3 className="text-xl font-bold">Creating Link for {deviceData?.name || "Lab Devices"}</h3>
                    <button onClick={onClose} className="r-btn text-blue-400 hover:text-blue-500 flex items-center">
                        Back <Undo2 className="ml-1" size={18} />
                    </button>
                </div>
                <div className="mb-4 p-4">
                    <div className="flex flex-col">
                        <div className="pb-2 border-b">
                            <h4>First Device</h4>
                            <select
                                value={deviceData?.name || selectedFirstDevice}
                                onChange={(e) => setSelectedFirstDevice(e.target.value)}
                                className={`block w-full mt-1 rounded-md bg-[#ffffff] focus:outline-none ${deviceData?.name ? 'text-gray-300' : ''}`}
                                disabled={!!deviceData?.name}
                            >
                                <option value="">Select a Device</option>
                                {labDevices.filter((device) => device.userId == null || device.userId == user?.id).map((device) => {
                                    const portsArray = device.ports.split(',');
                                    const generatedPorts = portsArray.flatMap(portDef => generatePorts(portDef));
                                    const hasAvailablePorts = generatedPorts.some(port => !firstDeviceOccupiedPorts.includes(port));
                                    return (
                                        <option key={device.id} value={device.name} disabled={!hasAvailablePorts || device.name === selectedSecondDevice}>
                                            {device.name} {!hasAvailablePorts ? '(no available ports)' : ''}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        <div className="pb-2 border-b">
                            <h4>{deviceData?.name ? deviceData.name + " Port" : "First Device Port"}</h4>
                            <select
                                value={selectedFirstDevicePort}
                                onChange={(e) => setSelectedFirstDevicePort(e.target.value)}
                                className="block w-full mt-1 rounded-md bg-[#ffffff] focus:outline-none"
                            >
                                <option value="">Select a Port</option>
                                {(deviceData ? currentDevicePorts : filteredLabDevices.map(device => device.ports.split(',').flatMap(portDef => generatePorts(portDef)))).flat().map((port, index) => (
                                    <option key={index} value={port} disabled={firstDeviceOccupiedPorts.includes(port)}>
                                        {port}  {firstDeviceOccupiedPorts.includes(port) ? '(in use)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="pb-2 border-b">
                            <h4>Second Device</h4>
                            <select
                                value={selectedSecondDevice}
                                onChange={(e) => setSelectedSecondDevice(e.target.value)}
                                className="block w-full mt-1 rounded-md bg-[#ffffff] focus:outline-none"
                            >
                                <option value="">Select a Device</option>
                                {filteredLabDevices.filter((device) => (device.userId == null || device.userId == user?.id) && currentNodesInTopology.has(device.name)).map((device) => {
                                    const portsArray = device.ports.split(',');
                                    const generatedPorts = portsArray.flatMap(portDef => generatePorts(portDef));
                                    const hasAvailablePorts = generatedPorts.some(port => !secondDeviceOccupiedPorts.includes(port));
                                    return (
                                        <option key={device.id} value={device.name} disabled={!hasAvailablePorts || device.name === selectedFirstDevice}>
                                            {device.name} {!hasAvailablePorts ? '(no available ports)' : ''}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        <div className="pb-2 border-b">
                            <h4>{selectedSecondDevice ? selectedSecondDevice : "Other Device"} Port</h4>
                            <select
                                value={selectedSecondDevicePort}
                                onChange={(e) => setSelectedSecondDevicePort(e.target.value)}
                                className="block w-full mt-1 rounded-md bg-[#ffffff] focus:outline-none"
                            >
                                <option value="">Select Port</option>
                                {availablePorts.map((port, idx) => (
                                    <option key={idx} value={port} disabled={secondDeviceOccupiedPorts.includes(port)}>
                                        {port} {secondDeviceOccupiedPorts.includes(port) ? '(in use)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="p-5 flex flex-row justify-end">
                    <button
                        className="r-btn primary flex flex-row items-center justify-center gap-1"
                        disabled={!selectedFirstDevicePort || !selectedSecondDevice || !selectedSecondDevicePort}
                        onClick={handleCreateLink}
                    >
                        <Cable /> Create
                    </button>
                </div>
            </div>
        </section>
    );
};