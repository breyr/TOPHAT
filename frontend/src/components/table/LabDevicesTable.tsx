import { CircleMinus, CirclePlus, Edit, Save, X } from 'lucide-react';
import { useState } from 'react';
import DataTable from 'react-data-table-component';
import { useAuth } from '../../hooks/useAuth';
import { toTitleCase } from '../../lib/helpers';
import { Device } from '../../models/Device';
import DeviceModal from '../DeviceModal';
import customStyles from './dataTableStyles';

interface LabDevicesTableProps {
    labDevices: Device[];
    setLabDevices: React.Dispatch<React.SetStateAction<Device[]>>;
}

interface EditableRow {
    data: Device;
}

export default function LabDevicesTable({
    labDevices,
    setLabDevices
}: LabDevicesTableProps) {
    const { authenticatedApiClient } = useAuth();
    const [isPortModalOpen, setIsPortModalOpen] = useState(false);
    const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<Device | undefined>();
    const [editingRows, setEditingRows] = useState<Record<number, EditableRow>>({});

    const addNewRow = async () => {
        const tempId = Date.now();
        const newDevice = new Device(
            tempId,
            null,
            null,
            null,
            '',
            '',
            '',
            '',
            '',
            null,
            null,
            null,
            '',
            'LAB',
            'SWITCH'
        );

        // optimistically update the UI with the new device
        setLabDevices(prevDevices => [...prevDevices, newDevice]);
        handleEditClick(newDevice);

        try {
            const res = await authenticatedApiClient.createDevice(newDevice);
            if (res.data) {
                // update the device in the UI with the actual ID from the database
                setLabDevices(prevDevices => prevDevices.map(device => device.id === tempId ? res.data! : device));
                // Start editing the new row immediately
                handleEditClick(res.data);
            }
        } catch (error) {
            console.error("Failed to create device:", error);
        }
    };

    const handleEditClick = (row: Device) => {
        setEditingRows(prev => ({
            ...prev,
            [row.id]: {
                data: { ...row },
            }
        }));
    };

    const handleCancelEdit = (row: Device) => {
        setEditingRows(prev => {
            const newState = { ...prev };
            delete newState[row.id];
            return newState;
        });
    };

    const handleSaveEdit = async (row: Device) => {
        // get the row from our hashmap that has the updated data
        const editingRow = editingRows[row.id];
        // if that row doesn't exist:
        // this means that row was never edited and the user didn't click the save button
        if (!editingRow) return;
        try {
            // save the edited device data
            const updatedDevice = await authenticatedApiClient.updateDevice(row.id, editingRow.data);
            // update the device data within interconnectDevices state
            if (updatedDevice.data) {
                setLabDevices(prevDevices =>
                    prevDevices.map(device =>
                        device.id === row.id ? updatedDevice.data! : device
                    )
                );
                handleCancelEdit(row);
            }
        } catch (error) {
            console.error("Failed to update device:", error);
        }
    };

    const handleInputChange = (row: Device, name: string, value: string) => {
        setEditingRows(prev => ({
            ...prev,
            [row.id]: {
                ...prev[row.id],
                data: {
                    ...prev[row.id].data,
                    [name]: value
                }
            }
        }));
    };

    const handleRowDeleteClick = async (row: Device) => {
        if (row.id) {
            try {
                await authenticatedApiClient.deleteDevice(row.id);
                setLabDevices(prevDevices =>
                    prevDevices.filter(device => device.id !== row.id)
                );
            } catch (error) {
                console.error("Failed to delete device:", error);
            }
        }
    };

    const handleUpdatePorts = (deviceId: number, updatedPorts: string) => {
        setEditingRows(prev => ({
            ...prev,
            [deviceId]: {
                ...prev[deviceId],
                data: {
                    ...prev[deviceId].data,
                    ports: updatedPorts
                }
            }
        }));
    };

    const handleUpdateDescription = (deviceId: number, updatedDescription: string) => {
        setEditingRows(prev => ({
            ...prev,
            [deviceId]: {
                ...prev[deviceId],
                data: {
                    ...prev[deviceId].data,
                    description: updatedDescription
                }
            }
        }));
    };

    const openPortModal = (row: Device) => {
        setSelectedDevice(row);
        setIsPortModalOpen(true);
    };

    const openDescriptionModal = (row: Device) => {
        setSelectedDevice(row);
        setIsDescriptionModalOpen(true);
    };

    const renderCell = (row: Device, name: string, placeholder: string) => {
        const isEditing = editingRows[row.id];
        const value = isEditing ? editingRows[row.id].data[name] : row[name];

        return isEditing ? (
            <input
                type="text"
                value={value}
                name={name}
                placeholder={placeholder}
                onChange={(e) => handleInputChange(row, name, e.target.value)}
                className="w-full focus:outline-none"
            />
        ) : (
            <span>{value || placeholder}</span>
        );
    };

    const renderTypeSelect = (row: Device) => {
        const isEditing = editingRows[row.id];
        const value = isEditing ? editingRows[row.id].data.icon : toTitleCase(row.icon);

        return isEditing ? (
            <select
                value={value || ""}
                name="icon"
                onChange={(e) => handleInputChange(row, "icon", e.target.value)}
                className="w-full bg-[#ffffff] focus:outline-none"
            >
                <option value="" disabled>Select</option>
                <option value="ROUTER">Router</option>
                <option value="SWITCH">Switch</option>
                <option value="EXTERNAL">External</option>
                <option value="SERVER">Server</option>
            </select>
        ) : (
            <span>{value || "Select"}</span>
        );
    };

    const columns = [
        {
            name: 'Device Name',
            sortable: true,
            cell: (row: Device) => renderCell(row, 'name', 'Device name')
        },
        {
            name: 'Type',
            sortable: true,
            cell: (row: Device) => renderTypeSelect(row)
        },
        {
            name: 'Model',
            sortable: true,
            cell: (row: Device) => renderCell(row, 'model', 'Model')
        },
        {
            name: 'SN',
            sortable: true,
            cell: (row: Device) => renderCell(row, 'serialNumber', 'Serial Number')
        },
        {
            name: 'Description',
            cell: (row: Device) => (
                <button
                    onClick={() => openDescriptionModal(row)}
                    className='border-b-blue-400 border-b-2 flex flex-row items-center'
                >
                    {!editingRows[row.id] ? 'View' : 'Edit'}
                </button>
            )
        },
        {
            name: 'Ports',
            cell: (row: Device) => (
                <button
                    onClick={() => openPortModal(row)}
                    className='border-b-blue-400 border-b-2 flex flex-row items-center'
                >
                    {!editingRows[row.id] ? 'View' : 'Configure'}
                </button>
            )
        },
        {
            name: 'Actions',
            cell: (row: Device) => {
                const isEditing = editingRows[row.id];

                return (
                    <div className="flex flex-row gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    className="text-green-500 hover:text-green-700"
                                    onClick={() => handleSaveEdit(row)}
                                >
                                    <Save size={20} />
                                </button>
                                <button
                                    type="button"
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => handleCancelEdit(row)}
                                >
                                    <X size={20} />
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className="text-blue-500 hover:text-blue-700"
                                    onClick={() => handleEditClick(row)}
                                >
                                    <Edit size={20} />
                                </button>
                                <button
                                    type="button"
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => handleRowDeleteClick(row)}
                                >
                                    <CircleMinus size={20} />
                                </button>
                            </>
                        )}
                    </div>
                );
            },
            width: '120px',
        },
    ];

    return (
        <section className='p-4'>
            <div className="flex flex-row justify-end">
                <button
                    className="r-btn primary flex flex-row items-center gap-2"
                    onClick={addNewRow}
                >
                    <CirclePlus /> Add Device
                </button>
            </div>
            <DataTable
                columns={columns}
                data={labDevices}
                pagination
                paginationRowsPerPageOptions={[5, 10, 15]}
                customStyles={customStyles}
            />
            {isDescriptionModalOpen && selectedDevice && (
                <DeviceModal
                    renderTable={false}
                    setIsOpen={setIsDescriptionModalOpen}
                    deviceInformation={selectedDevice}
                    isContentEditable={!!editingRows[selectedDevice.id]}
                    editingData={editingRows[selectedDevice.id]?.data}
                    onUpdateDescription={handleUpdateDescription}
                />
            )}
            {isPortModalOpen && selectedDevice && (
                <DeviceModal
                    renderTable={true}
                    setIsOpen={setIsPortModalOpen}
                    deviceInformation={selectedDevice}
                    isContentEditable={!!editingRows[selectedDevice.id]}
                    editingData={editingRows[selectedDevice.id]?.data}
                    onUpdatePorts={handleUpdatePorts}
                />
            )}
        </section>
    );
}