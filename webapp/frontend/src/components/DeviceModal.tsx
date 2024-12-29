import { X } from "lucide-react";
import React from "react";
import { InterconnectDevice, LabDevice, useOnboardingStore } from "../stores/onboarding";
import DeviceDescriptionTextArea from "./DeviceDescriptionTextArea";
import DevicePortsTable from "./table/DevicePortsTable";

interface DeviceModalProps {
    setIsOpen: (value: boolean) => void;
    deviceIndex: number;
    deviceType: "interconnect" | "lab";
    deviceInformation: InterconnectDevice | LabDevice | undefined;
    renderTable: boolean;
}

const DeviceModal: React.FC<DeviceModalProps> = ({ setIsOpen, deviceIndex, deviceType, deviceInformation, renderTable }) => {
    // only access the relevant data from the store
    const { updateInterconnectDevice, updateLabDevice } = useOnboardingStore(
        (state) => state
    );

    const handleUpdatePorts = (updatedPorts: string) => {
        if (deviceType === 'interconnect') {
            // Save the updated ports to the interconnect device
            updateInterconnectDevice(deviceIndex, { ports: updatedPorts });
        } else if (deviceType === 'lab') {
            // Save the updated ports to the lab device
            updateLabDevice(deviceIndex, { ports: updatedPorts });
        }
        setIsOpen(false); // Close the modal after saving
    };

    const handleUpdateDescription = (updatedDescription: string) => {
        if (deviceType === 'lab') updateLabDevice(deviceIndex, { description: updatedDescription });
        setIsOpen(false);
    }

    return (
        <section className="bg-zinc-950 bg-opacity-50 w-full h-full fixed top-0 left-0 flex items-center justify-center z-50">
            <div className="bg-white w-1/3 p-6 rounded-lg shadow-lg">
                <div className="flex flex-row justify-between items-center">
                    <h2 className="m-0">{deviceInformation?.deviceName}{deviceInformation?.deviceName !== '' ? "'s" : ''} {renderTable === true ? 'Ports' : 'Description'}</h2>
                    <button onClick={() => setIsOpen(false)} className="r-btn text-red-500 hover:text-red-700">
                        <X />
                    </button>
                </div>
                {renderTable && <p>Enter interfaces that are utilized for cabling lab devices.</p>}
                {!renderTable && <p>Enter the device description below. The first hyperlink of each type will be added as a context menu option on the topology canvas.</p>}
                {!renderTable && <DeviceDescriptionTextArea descriptionText={(deviceInformation as LabDevice).description} onUpdateDescription={handleUpdateDescription} />}
                {renderTable && <DevicePortsTable ports={deviceInformation?.ports ?? ''} onUpdatePorts={handleUpdatePorts} />}
            </div>
        </section>
    );
};

export default DeviceModal;
