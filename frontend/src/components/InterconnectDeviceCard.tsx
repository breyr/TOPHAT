import { Edit, PlusCircle, Save, Server, Trash, X } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Device } from "../models/Device";

interface InterconnectDeviceCardProps {
    deviceNumber: number;
    deviceInformation: Device | null;
    setDeviceInformation: Dispatch<SetStateAction<Device | null>>;
}

interface AddInterconnectModalProps {
    deviceNumber: number;
    deviceInformation: Device | null;
    onClose: () => void;
    onSave: (device: Device) => void;
    onUpdate: (device: Device) => void;
    onDelete: (deviceId: number) => void;
    setDeviceInformation: Dispatch<SetStateAction<Device | null>>;
}

function AddInterconnectModal({ deviceInformation, deviceNumber, onClose, onSave, onUpdate, onDelete, setDeviceInformation }: AddInterconnectModalProps) {
    const [name, setName] = useState("");
    const [model, setModel] = useState("");
    const [serialNumber, setSerialNumber] = useState("");
    const [ipAddress, setIpAddress] = useState("");
    const [portPrefix, setPortPrefix] = useState("");
    // these parameters can be null because they are optional on type Device
    const [username, setUsername] = useState<string | null>(null);
    const [password, setPassword] = useState<string | null>(null);
    const [secretPassword, setSecretPassword] = useState<string | null>(null);

    const [isEditing, setIsEditing] = useState(deviceInformation === null);

    useEffect(() => {
        if (deviceInformation) {
            setName(deviceInformation.name);
            setModel(deviceInformation.model);
            setSerialNumber(deviceInformation.serialNumber);
            setIpAddress(deviceInformation.ipAddress);
            setPortPrefix(deviceInformation.ports.split('|')[0]);
            setUsername(deviceInformation.username);
            setPassword(deviceInformation.password);
            setSecretPassword(deviceInformation.secretPassword);
        }
    }, [deviceInformation]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const newDevice = new Device(
            Date.now(),
            deviceNumber,
            null,
            null,
            name,
            model,
            serialNumber,
            ipAddress,
            null,
            username,
            password,
            secretPassword,
            portPrefix + '|1-44',
            "INTERCONNECT",
            null
        );
        onSave(newDevice);
        onClose();
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedDevice = new Device(
            deviceInformation!.id,
            deviceNumber,
            null,
            null,
            name,
            model,
            serialNumber,
            ipAddress,
            null,
            username,
            password,
            secretPassword,
            portPrefix + '|1-44',
            "INTERCONNECT",
            null
        );
        onUpdate(updatedDevice);
        onClose();
    };

    const handleDelete = (deviceId: number) => {
        // delete
        onDelete(deviceId);
        // clear state
        setName('');
        setModel('');
        setSerialNumber('');
        setIpAddress('');
        setPortPrefix('');
        setUsername(null);
        setPassword(null);
        setSecretPassword(null);
        setDeviceInformation(null);
        // close modal
        onClose();
    }

    const handleCancelEdit = () => {
        // if we have information set edit to false i.e. we have information to fall back
        if (deviceInformation) {
            setIsEditing(false);
        } else {
            // we don't have device information so I'm just going to close the modal
            onClose();
        }
    }

    return (
        <section className="bg-zinc-950 bg-opacity-50 w-full h-full fixed top-0 left-0 flex items-center justify-center z-50">
            <div className="bg-[#ffffff] w-1/3 p-6 rounded-lg shadow-lg">
                <div className="flex flex-row justify-between items-center">
                    <h2 className="m-0">{deviceInformation ? `Edit Interconnect Device #${deviceNumber}` : `Add Interconnect Device #${deviceNumber}`}</h2>
                    <button onClick={onClose} className="r-btn text-red-500 hover:text-red-700">
                        <X />
                    </button>
                </div>
                <div className="p-4">
                    <form onSubmit={deviceInformation ? handleUpdate : handleSave} className="grid grid-cols-2 gap-4">
                        <div className={`flex flex-col ${!isEditing ? 'border-b-2 pb-1' : ''}`}>
                            <label className="font-bold">Device Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="r-input large"
                                    required
                                />
                            ) : (
                                <span>{name}</span>
                            )}
                        </div>
                        <div className={`flex flex-col ${!isEditing ? 'border-b-2 pb-1' : ''}`}>
                            <label className="font-bold">Model</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                    className="r-input large"
                                    required
                                />
                            ) : (
                                <span>{model}</span>
                            )}
                        </div>
                        <div className={`flex flex-col ${!isEditing ? 'border-b-2 pb-1' : ''}`}>
                            <label className="font-bold">Serial Number</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={serialNumber}
                                    onChange={(e) => setSerialNumber(e.target.value)}
                                    className="r-input large"
                                    required
                                />
                            ) : (
                                <span>{serialNumber}</span>
                            )}
                        </div>
                        <div className={`flex flex-col ${!isEditing ? 'border-b-2 pb-1' : ''}`}>
                            <label className="font-bold">IP Address</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={ipAddress}
                                    onChange={(e) => setIpAddress(e.target.value)}
                                    className="r-input large"
                                    required
                                />
                            ) : (
                                <span>{ipAddress}</span>
                            )}
                        </div>
                        <div className={`flex flex-col ${!isEditing ? 'border-b-2 pb-1' : ''}`}>
                            <label className="font-bold">Username</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={username ?? ''}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="r-input large"
                                    required
                                />
                            ) : (
                                <span>{username}</span>
                            )}
                        </div>
                        <div className={`flex flex-col ${!isEditing ? 'border-b-2 pb-1' : ''}`}>
                            <label className="font-bold">Password</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={password ?? ''}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="r-input large"
                                    required
                                />
                            ) : (
                                <span>{password}</span>
                            )}
                        </div>
                        <div className={`flex flex-col ${!isEditing ? 'border-b-2 pb-1' : ''}`}>
                            <label className="font-bold">Secret Password</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={secretPassword ?? ''}
                                    onChange={(e) => setSecretPassword(e.target.value)}
                                    className="r-input large"
                                    required
                                />
                            ) : (
                                <span>{secretPassword}</span>
                            )}
                        </div>
                        <div className={`flex flex-col ${!isEditing ? 'border-b-2 pb-1' : ''}`}>
                            <label className="font-bold">Ports</label>
                            {isEditing ? (
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        value={portPrefix ?? ''}
                                        placeholder="GigabitEthernet1/0/"
                                        onChange={(e) => setPortPrefix(e.target.value)}
                                        className="mb-2 pl-3 pr-3 border-2 border-gray-500 rounded-none border-r-0 rounded-l-md disabled:bg-gray-100 disabled:border-gray-200 disabled:placeholder-gray-200 pt-4 pb-4 h-9 text-base flex-1"
                                        required
                                    />
                                    <input
                                        type="text"
                                        value="1-44"
                                        readOnly
                                        className="mb-2 pl-3 pr-3 border-2 border-gray-500 rounded-none border-l-0 rounded-r-md bg-gray-200 text-gray-500 pt-4 pb-4 h-9 text-base w-20 text-center"
                                        disabled
                                    />
                                </div>
                            ) : (
                                <span>{portPrefix}[1-44]</span>
                            )}
                        </div>
                    </form>
                    <div className="flex justify-end gap-2 mt-4">
                        {isEditing ? (
                            <div className="flex justify-end">
                                <button onClick={deviceInformation ? handleUpdate : handleSave} className="r-btn text-green-600 hover:text-green-700 flex flex-row items-center gap-1">
                                    <Save /> Save
                                </button>
                                <button onClick={handleCancelEdit} className="r-btn danger secondary flex flex-row items-center gap-1">
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="flex justify-end">
                                <button onClick={() => setIsEditing(true)} className="r-btn tertiary flex flex-row items-center gap-1">
                                    <Edit /> Edit
                                </button>
                                {
                                    deviceInformation && (
                                        <button onClick={() => handleDelete(deviceInformation!.id)} className="r-btn text-red-500 hover:text-red-600 flex flex-row items-center gap-1">
                                            <Trash /> Delete
                                        </button>
                                    )
                                }
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function InterconnectDeviceCard({ deviceNumber, deviceInformation, setDeviceInformation }: InterconnectDeviceCardProps) {
    const { authenticatedApiClient } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const handleSave = async (device: Device) => {
        try {
            const res = await authenticatedApiClient.createDevice(device);
            if (res.data) {
                setDeviceInformation(res.data!);
            }
        } catch (error) {
            console.error("Failed to create device:", error);
        }
    };

    const handleUpdate = async (device: Device) => {
        try {
            const res = await authenticatedApiClient.updateDevice(device.id, device);
            if (res.data) {
                setDeviceInformation(res.data!);
            }
        } catch (error) {
            console.error("Failed to update device:", error);
        }
    };

    const handleDelete = async (deviceId: number) => {
        try {
            const res = await authenticatedApiClient.deleteDevice(deviceId);
            if (res.data) {
                setDeviceInformation(null);
            }
        } catch (error) {
            console.error("Failed to update device:", error);
        }
    };

    return (
        <>
            <div
                onClick={() => setIsModalOpen(true)}
                className={`my-5 rounded-md size-96 border-2 flex flex-col justify-center items-center gap-3 text-gray-300 transition-all duration-300 ease-in-out transform hover:scale-95 hover:cursor-pointer ${deviceInformation ? 'bg-blue-50 border-blue-400' : 'bg-gray-50 border-gray-300'
                    }`}>
                {deviceInformation ? <Server size={48} className="text-blue-500" /> : <PlusCircle size={48} />}
                <p className="text-lg">{deviceInformation ? "Edit" : "Add"} Interconnect Device {deviceNumber}</p>
            </div>
            {isModalOpen && (
                <AddInterconnectModal
                    deviceNumber={deviceNumber}
                    deviceInformation={deviceInformation}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    setDeviceInformation={setDeviceInformation}
                />
            )}
        </>
    );
}