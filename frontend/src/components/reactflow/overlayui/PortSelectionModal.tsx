import { Cable, X } from "lucide-react";
import { useEffect, useState } from "react";
import { generatePorts } from "../../../lib/helpers";
import { Device } from "../../../models/Device";

interface PortSelectionModalProps {
    deviceData?: Device;
    currentDevicePorts: string[];
    labDevices: Device[];
    onClose: () => void;
}

export default function PortSelectionModal({ deviceData, currentDevicePorts, labDevices, onClose }: PortSelectionModalProps) {
    const [selectedFirstDevice, setSelectedFirstDevice] = useState<string>("");
    const [selectedFirstDevicePort, setSelectedFirstDevicePort] = useState<string>("");
    const [selectedSecondDevice, setSelectedSecondDevice] = useState<string>("");
    const [selectedSecondDevicePort, setSelectedSecondDevicePort] = useState<string>("");
    const [availablePorts, setAvailablePorts] = useState<string[]>([]);
    const [filteredLabDevices, setFilteredLabDevices] = useState<Device[]>([]);

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

    useEffect(() => {
        setFilteredLabDevices(labDevices.filter(device => device.name !== selectedFirstDevice && device.name !== selectedSecondDevice && device.name !== deviceData?.name));
    }, [selectedFirstDevice, selectedSecondDevice, labDevices, deviceData?.name]);

    return (
        <section className="bg-zinc-950 bg-opacity-50 w-full h-full fixed top-0 left-0 flex items-center justify-center z-50">
            <div className="bg-white w-2/5 p-6 rounded-lg shadow-lg">
                <div className="flex flex-row justify-between items-center">
                    <h2 className="m-0">Creating Link for {deviceData?.name || "Lab Devices"}</h2>
                    <button onClick={onClose} className="r-btn text-red-500 hover:text-red-700">
                        <X />
                    </button>
                </div>
                <div className="mb-4 p-4">
                    <div className="flex flex-col">
                        <div className="pb-2 border-b">
                            <h4>{deviceData?.name || "First Device"}</h4>
                            <select
                                value={deviceData?.name || selectedFirstDevice}
                                onChange={(e) => setSelectedFirstDevice(e.target.value)}
                                className="block w-full mt-1 rounded-md bg-white focus:outline-none"
                                disabled={!!deviceData?.name}
                            >
                                <option value="">Select a Device</option>
                                {labDevices.map((device) => (
                                    <option key={device.id} value={device.name}>
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
                                className="block w-full mt-1 rounded-md bg-white focus:outline-none"
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
                            <h4>Other Device</h4>
                            <select
                                value={selectedSecondDevice}
                                onChange={(e) => setSelectedSecondDevice(e.target.value)}
                                className="block w-full mt-1 rounded-md bg-white focus:outline-none"
                            >
                                <option value="">Select a Device</option>
                                {filteredLabDevices.map((device) => (
                                    <option key={device.id} value={device.name}>
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
                                className="block w-full mt-1 rounded-md bg-white focus:outline-none"
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
                        disabled={!selectedFirstDevice || !selectedFirstDevicePort || !selectedSecondDevice || !selectedSecondDevicePort}
                    >
                        <Cable /> Create
                    </button>
                </div>
            </div>
        </section>
    );
};