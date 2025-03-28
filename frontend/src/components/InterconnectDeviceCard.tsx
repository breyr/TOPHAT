import { Edit, PlusCircle, Save, Server, Trash, Undo2 } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useEscapeKey } from "../hooks/useEscapeKey";
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

interface DeviceInfoState {
    name: string;
    model: string;
    serialNumber: string;
    ipAddress: string;
    portPrefix: string;
    username: string | null;
    password: string | null;
    secretPassword: string | null;
}

const initialDeviceInfo: DeviceInfoState = {
    name: '',
    model: '',
    serialNumber: '',
    ipAddress: '',
    portPrefix: '',
    username: null,
    password: null,
    secretPassword: null
}

function AddInterconnectModal({ deviceInformation, deviceNumber, onClose, onSave, onUpdate, onDelete, setDeviceInformation }: AddInterconnectModalProps) {
    const [componentDeviceInfo, setComponentDeviceInfo] = useState<DeviceInfoState>(initialDeviceInfo);
    const [isEditing, setIsEditing] = useState(deviceInformation === null);

    useEscapeKey(onClose);

    // render load the deviceInformation and update when deviceInformation changes
    useEffect(() => {
        if (deviceInformation) {
            setComponentDeviceInfo({
                ...deviceInformation,
                portPrefix: deviceInformation.ports.split('|')[0]
            });
        }
    }, [deviceInformation]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setComponentDeviceInfo(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newDevice = new Device(
            deviceInformation?.id ?? Date.now(),
            deviceNumber,
            null,
            null,
            componentDeviceInfo.name,
            componentDeviceInfo.model,
            componentDeviceInfo.serialNumber,
            componentDeviceInfo.ipAddress,
            null,
            componentDeviceInfo.username,
            componentDeviceInfo.password,
            componentDeviceInfo.secretPassword,
            componentDeviceInfo.portPrefix + '|1-44',
            "INTERCONNECT",
            null
        );
        if (deviceInformation) {
            onUpdate(newDevice);
        } else {
            onSave(newDevice);
        }
        onClose();
    };

    const handleDelete = (deviceId: number) => {
        // delete
        onDelete(deviceId);
        // clear state
        setComponentDeviceInfo(initialDeviceInfo);
        // update state within DeviceManagement component - this triggers rerender for connections table
        setDeviceInformation(null);
        // close modal
        onClose();
    };

    const handleCancelEdit = () => {
        // if we have information set edit to false i.e. we have information to fall back
        if (deviceInformation) {
            setIsEditing(false);
        } else {
            // we don't have device information so I'm just going to close the modal
            onClose();
        }
    };

    return (
        <section className="bg-zinc-950 bg-opacity-50 w-full h-full fixed top-0 left-0 flex items-center justify-center z-50">
            <div className="bg-[#ffffff] w-3/5 p-6 rounded-lg shadow-lg">
                <div className="flex flex-row justify-between items-center">
                    <h3 className="text-xl font-bold px-3 my-4">{deviceInformation ? `Edit Interconnect ${deviceNumber}` : `Add Interconnect ${deviceNumber}`}</h3>
                    <button onClick={onClose} className="r-btn text-blue-400 hover:text-blue-500 flex items-center">
                        Back <Undo2 className="ml-1" size={18} />
                    </button>
                </div>
                <div className="p-4">
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                        <div className={`flex flex-col ${!isEditing ? 'border-b-2 pb-1' : ''}`}>
                            <label className="font-bold">Device Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="name"
                                    value={componentDeviceInfo.name}
                                    onChange={handleInputChange}
                                    className="r-input large"
                                    required
                                />
                            ) : (
                                <span>{componentDeviceInfo.name}</span>
                            )}
                        </div>
                        <div className={`flex flex-col ${!isEditing ? 'border-b-2 pb-1' : ''}`}>
                            <label className="font-bold">Model</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="model"
                                    value={componentDeviceInfo.model}
                                    onChange={handleInputChange}
                                    className="r-input large"
                                    required
                                />
                            ) : (
                                <span>{componentDeviceInfo.model}</span>
                            )}
                        </div>
                        <div className={`flex flex-col ${!isEditing ? 'border-b-2 pb-1' : ''}`}>
                            <label className="font-bold">Serial Number</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="serialNumber"
                                    value={componentDeviceInfo.serialNumber}
                                    onChange={handleInputChange}
                                    className="r-input large"
                                    required
                                />
                            ) : (
                                <span>{componentDeviceInfo.serialNumber}</span>
                            )}
                        </div>
                        <div className={`flex flex-col ${!isEditing ? 'border-b-2 pb-1' : ''}`}>
                            <label className="font-bold">IP Address</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="ipAddress"
                                    value={componentDeviceInfo.ipAddress}
                                    onChange={handleInputChange}
                                    className="r-input large"
                                    required
                                />
                            ) : (
                                <span>{componentDeviceInfo.ipAddress}</span>
                            )}
                        </div>
                        <div className={`flex flex-col ${!isEditing ? 'border-b-2 pb-1' : ''}`}>
                            <label className="font-bold">Username</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="username"
                                    value={componentDeviceInfo.username ?? ''}
                                    onChange={handleInputChange}
                                    className="r-input large"
                                    required
                                />
                            ) : (
                                <span>{componentDeviceInfo.username}</span>
                            )}
                        </div>
                        <div className={`flex flex-col ${!isEditing ? 'border-b-2 pb-1' : ''}`}>
                            <label className="font-bold">Password</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="password"
                                    value={componentDeviceInfo.password ?? ''}
                                    onChange={handleInputChange}
                                    className="r-input large"
                                    required
                                />
                            ) : (
                                <span>{componentDeviceInfo.password}</span>
                            )}
                        </div>
                        <div className={`flex flex-col ${!isEditing ? 'border-b-2 pb-1' : ''}`}>
                            <label className="font-bold">Secret Password</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="secretPassword"
                                    value={componentDeviceInfo.secretPassword ?? ''}
                                    onChange={handleInputChange}
                                    className="r-input large"
                                    required
                                />
                            ) : (
                                <span>{componentDeviceInfo.secretPassword}</span>
                            )}
                        </div>
                        <div className={`flex flex-col ${!isEditing ? 'border-b-2 pb-1' : ''}`}>
                            <label className="font-bold">Ports</label>
                            {isEditing ? (
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        name="portPrefix"
                                        value={componentDeviceInfo.portPrefix ?? ''}
                                        placeholder="GigabitEthernet1/0/"
                                        onChange={handleInputChange}
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
                                <span>{componentDeviceInfo.portPrefix}[1-44]</span>
                            )}
                        </div>
                    </form>
                    <div className="flex justify-end gap-2 mt-8">
                        {isEditing ? (
                            <div className="flex justify-end">
                                <button onClick={handleSubmit} className="r-btn text-green-600 hover:text-green-700 flex flex-row items-center gap-1">
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
                className={`my-5 rounded-md w-80 h-48 border-2 flex flex-col justify-center items-center gap-3 text-gray-300 transition-all duration-300 ease-in-out transform hover:scale-95 hover:cursor-pointer ${deviceInformation ? 'bg-blue-50 border-blue-400' : 'bg-gray-50 border-gray-300'
                    }`}>
                {deviceInformation ? <Server size={48} className="text-blue-500" /> : <PlusCircle size={48} />}
                <p className="text-lg">{deviceInformation ? "" : "Add"} Interconnect {deviceNumber}</p>
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