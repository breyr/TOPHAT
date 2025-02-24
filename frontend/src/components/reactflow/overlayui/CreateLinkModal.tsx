import { MarkerType, useReactFlow } from "@xyflow/react";
import { LinkRequest } from "common";
import { Cable, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useToast } from "../../../hooks/useToast";
import { generatePorts } from "../../../lib/helpers";
import { Device } from "../../../models/Device";

interface CreateLinkModalProps {
    deviceData?: Device;
    currentDevicePorts: string[];
    labDevices: Device[];
    onClose: () => void;
}

export default function CreateLinkModal({ deviceData, currentDevicePorts, labDevices, onClose }: CreateLinkModalProps) {
    const { authenticatedApiClient } = useAuth();
    const { addToast, updateToast } = useToast();
    const { getNodes, setEdges } = useReactFlow();
    const [selectedFirstDevice, setSelectedFirstDevice] = useState<string>("");
    const [selectedFirstDevicePort, setSelectedFirstDevicePort] = useState<string>("");
    const [selectedSecondDevice, setSelectedSecondDevice] = useState<string>("");
    const [selectedSecondDevicePort, setSelectedSecondDevicePort] = useState<string>("");
    const [availablePorts, setAvailablePorts] = useState<string[]>([]);
    const [filteredLabDevices] = useState<Device[]>(labDevices);

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

    const createEdge = () => {
        const nodes = getNodes();
        const sourceNode = nodes.find(node => (node.data.deviceData as Device).name === selectedFirstDevice);
        const targetNode = nodes.find(node => (node.data.deviceData as Device).name === selectedSecondDevice);

        if (sourceNode && targetNode) {
            const newEdge = {
                id: `edge-${selectedFirstDevicePort}-${selectedSecondDevicePort}`,
                source: sourceNode.id,
                target: targetNode.id,
                sourceHandle: `source`,
                targetHandle: `target`,
                type: "Custom",
                data: {
                    sourcePort: selectedFirstDevicePort,
                    targetPort: selectedSecondDevicePort,
                },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                },
                markerStart: {
                    type: MarkerType.ArrowClosed,
                }
            };

            setEdges((oldEdges) => oldEdges.concat(newEdge));
        }
    };

    const createLink = async () => {
        try {
            // fetch connections for the selected devices
            const [firstDeviceConnections, secondDeviceConnections] = await Promise.all([
                authenticatedApiClient.getConnectionsByDeviceName(selectedFirstDevice),
                authenticatedApiClient.getConnectionsByDeviceName(selectedSecondDevice)
            ]);

            // get the correct connection info for each selected port
            const firstConnectionInfo = firstDeviceConnections.data?.find(c => c.labDevicePort === selectedFirstDevicePort);
            const secondConnectionInfo = secondDeviceConnections.data?.find(c => c.labDevicePort === selectedSecondDevicePort);

            if (!firstConnectionInfo || !secondConnectionInfo) {
                addToast({ id: Date.now().toString(), title: 'Creating Link', body: `Connection information not found.`, status: 'error' });
                return;
            }

            // fetch interconnect information for both devices
            const interconnectDevices = await authenticatedApiClient.getDevicesByType('INTERCONNECT');
            const firstInterconnectInfo = interconnectDevices.data?.find(d => d.name === firstConnectionInfo.interconnectDeviceName);
            const secondInterconnectInfo = interconnectDevices.data?.find(d => d.name === secondConnectionInfo.interconnectDeviceName);

            if (!firstInterconnectInfo || !secondInterconnectInfo) {
                addToast({ id: Date.now().toString(), title: 'Creating Link', body: `Interconnect information not found. Please message an Administrator.`, status: 'error' });
                return;
            }

            // ensure required interconnect info is not null or undefined
            if (firstInterconnectInfo.deviceNumber == null || firstInterconnectInfo.username == null || firstInterconnectInfo.password == null || firstInterconnectInfo.secretPassword == null ||
                secondInterconnectInfo.deviceNumber == null || secondInterconnectInfo.username == null || secondInterconnectInfo.password == null || secondInterconnectInfo.secretPassword == null) {
                addToast({ id: Date.now().toString(), title: 'Creating Link', body: `Interconnect is not configured properly. Please message an Administrator.`, status: 'error' });
                return;
            }

            // fetch IP addresses for the selected devices
            const ip1 = firstInterconnectInfo.ipAddress ?? 'none';
            const ip2 = secondInterconnectInfo.ipAddress ?? 'none';

            if (ip1 === 'none' || ip2 === 'none') {
                addToast({ id: Date.now().toString(), title: 'Creating Link', body: `Interconnect is not configured properly. Please message an Administrator.`, status: 'error' });
                return;
            }

            // remove the port number from the string while ensuring that the `/` character is not cut off
            const removePortNumber = (port: string) => port.replace(/\/\d+$/, '/');

            const interconnect1Prefix = removePortNumber(firstConnectionInfo.interconnectDevicePort);
            const interconnect2Prefix = removePortNumber(secondConnectionInfo.interconnectDevicePort);

            // calculate offset ports used in VLAN ID creation
            const offsetPort1 = Number(firstConnectionInfo.interconnectDevicePort.split('/').pop()) * firstInterconnectInfo.deviceNumber;
            const offsetPort2 = Number(secondConnectionInfo.interconnectDevicePort.split('/').pop()) * secondInterconnectInfo.deviceNumber;

            // prepare payload for interconnect API
            const createLinkPayload: LinkRequest = {
                interconnect1IP: ip1,
                interconnect1Prefix,
                interconnect2IP: ip2,
                interconnect2Prefix,
                interconnectPortID1: offsetPort1,
                interconnectPortID2: offsetPort2,
                username: firstInterconnectInfo.username,
                password: firstInterconnectInfo.password,
                secret: firstInterconnectInfo.secretPassword
            };

            // send request to interconnect API
            const toastId = Date.now().toString();
            addToast({ id: toastId, title: 'Creating Link', body: `Connecting ${selectedFirstDevice} on port ${selectedFirstDevicePort} to ${selectedSecondDevice} on port ${selectedSecondDevicePort}`, status: 'pending' });
            const res = await authenticatedApiClient.createLink(createLinkPayload);
            if ((res as any).status === 'success') {
                // draw edge in react flow
                createEdge();
                updateToast(toastId, 'success', 'Successfully Created Link');
            } else {
                updateToast(toastId, 'error', 'Failed to Create Link');
                console.error("Failed to create link");
            }
        } catch (error) {
            console.error("Error creating link:", error);
            addToast({ id: Date.now().toString(), title: 'Creating Link', body: `Error creating link. Please contact an Administrator.`, status: 'error' });
        }
    };

    return (
        <section className="bg-zinc-950 bg-opacity-50 w-full h-full fixed top-0 left-0 flex items-center justify-center z-50">
            <div className="bg-[#ffffff] w-2/5 p-6 rounded-lg shadow-lg">
                <div className="flex flex-row justify-between items-center">
                    <h2 className="m-0">Creating Link for {deviceData?.name || "Lab Devices"}</h2>
                    <button onClick={onClose} className="r-btn text-red-500 hover:text-red-700">
                        <X />
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
                                {labDevices.map((device) => (
                                    <option key={device.id} value={device.name} disabled={device.name === selectedSecondDevice}>
                                        {device.name}
                                    </option>
                                ))}
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
                                    <option key={index} value={port}>
                                        {port}
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
                                {filteredLabDevices.map((device) => (
                                    <option key={device.id} value={device.name} disabled={device.name === selectedFirstDevice}>
                                        {device.name}
                                    </option>
                                ))}
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
                                    <option key={idx} value={port}>
                                        {port}
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
                        onClick={() => {
                            createLink();
                            onClose();
                        }}
                    >
                        <Cable /> Create
                    </button>
                </div>
            </div>
        </section>
    );
};