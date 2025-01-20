import { X } from "lucide-react";
import React from "react";
import { DeviceType } from "../../../common/shared-types";
import { useAuth } from "../hooks/useAuth";
import { Device } from "../models/Device";
import DeviceDescriptionTextArea from "./DeviceDescriptionTextArea";
import DevicePortsTable from "./table/DevicePortsTable";

interface DeviceModalProps {
    setIsOpen: (value: boolean) => void;
    deviceType: DeviceType;
    deviceInformation: Device | undefined;
    renderTable: boolean;
}

const DeviceModal: React.FC<DeviceModalProps> = ({
    setIsOpen,
    deviceType,
    deviceInformation,
    renderTable,
}) => {
    const { authenticatedApiClient } = useAuth();


    const handleUpdatePorts = async (deviceId: number, updatedPorts: string) => {
        // update the ports for a device with the authenticated api
        const res = await authenticatedApiClient.updateDevice(deviceId, { ports: updatedPorts });
        if (res.data) {
            setIsOpen(false); // Close the modal after saving
        }
    };

    const handleUpdateDescription = async (deviceId: number, updatedDescription: string) => {
        if (deviceType === 'LAB') await authenticatedApiClient.updateDevice(deviceId, { description: updatedDescription });
        setIsOpen(false);
    }

    return (
        <section className="bg-zinc-950 bg-opacity-50 w-full h-full fixed top-0 left-0 flex items-center justify-center z-50">
            <div className="bg-white w-1/3 p-6 rounded-lg shadow-lg">
                <div className="flex flex-row justify-between items-center">
                    <h2 className="m-0">{deviceInformation?.name}{deviceInformation?.name !== '' ? "'s" : ''} {renderTable === true ? 'Ports' : 'Description'}</h2>
                    <button onClick={() => setIsOpen(false)} className="r-btn text-red-500 hover:text-red-700">
                        <X />
                    </button>
                </div>
                {renderTable && <p>Enter interfaces that are utilized for cabling lab devices.</p>}
                {!renderTable && <p>Enter the device description below. The first hyperlink of each type will be added as a context menu option on the topology canvas.</p>}
                {!renderTable && <DeviceDescriptionTextArea deviceId={deviceInformation?.id} descriptionText={deviceInformation?.description ?? ''} onUpdateDescription={handleUpdateDescription} />}
                {renderTable && <DevicePortsTable deviceId={deviceInformation?.id} ports={deviceInformation?.ports ?? ''} onUpdatePorts={handleUpdatePorts} />}
            </div>
        </section>
    );
};

export default DeviceModal;