import { Undo2} from "lucide-react";
import React from "react";
import { Device } from "../models/Device";
import DeviceDescriptionTextArea from "./DeviceDescriptionTextArea";
import DevicePortsTable from "./table/DevicePortsTable";
import { useEscapeKey } from "../hooks/useEscapeKey";

// deviceInformation is used for non-editing mode, viewing what is currently in the database
// editingData is used for when a user is editing the device and hasn't saved the changes yet;
interface DeviceModalProps {
    setIsOpen: (value: boolean) => void;
    deviceInformation: Device | undefined;
    editingData?: Device;
    onUpdatePorts?: (deviceId: number, updatedPorts: string) => void;
    onUpdateDescription?: (deviceId: number, updatedDescription: string) => void;
    renderTable: boolean;
    isContentEditable: boolean;
}

const DeviceModal: React.FC<DeviceModalProps> = ({
    setIsOpen,
    deviceInformation,
    editingData,
    onUpdateDescription,
    onUpdatePorts,
    renderTable,
    isContentEditable,
}) => {

    // use editingData if available otherwise fallback to deviceInformation
    const deviceData = editingData || deviceInformation;

    const handleUpdatePorts = async (updatedPorts: string) => {
        // update the local editing state for the given device
        if (onUpdatePorts) onUpdatePorts(deviceData!.id, updatedPorts);
        setIsOpen(false);
    };

    const handleUpdateDescription = async (updatedDescription: string) => {
        // update the local editing state for the given device
        if (onUpdateDescription) onUpdateDescription(deviceData!.id, updatedDescription);
        setIsOpen(false);
    }

    // close the modal when the escape key is pressed
    useEscapeKey(() => setIsOpen(false));

    return (
        <section className="bg-zinc-950 bg-opacity-50 w-full h-full fixed top-0 left-0 flex items-center justify-center z-50">
            <div className="bg-[#ffffff] w-2/5 p-6 rounded-lg shadow-lg">
                <div className="flex flex-row justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">{deviceData?.name}{deviceData?.name !== '' ? "'s" : ''} {renderTable === true ? 'Ports' : 'Description'}</h3>
                    <button onClick={() => setIsOpen(false)} className="r-btn text-blue-400 hover:text-blue-500 flex items-center">
                        Back <Undo2 className="ml-1" size={18}/>
                    </button>
                </div>
                {renderTable && <p>Enter interfaces that are utilized for cabling lab devices.</p>}
                {!renderTable && <p>Enter the device description below. The first hyperlink of each type will be added as a context menu option on the topology canvas.</p>}
                {!renderTable && <DeviceDescriptionTextArea deviceId={deviceData?.id} descriptionText={deviceData?.description ?? ''} isEditable={isContentEditable} onUpdateDescription={handleUpdateDescription} />}
                {renderTable && <DevicePortsTable isEditable={isContentEditable} deviceId={deviceData?.id} ports={deviceData?.ports ?? ''} onUpdatePorts={handleUpdatePorts} />}
            </div>
        </section>
    );
};

export default DeviceModal;