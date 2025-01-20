import { CircleMinus, CirclePlus, Edit, Save, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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
    id: number;
    originalData: Device;
    currentData: Device;
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

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const res = await authenticatedApiClient.getDevicesByType('LAB');
                setLabDevices(res.data || []);
            } catch (error) {
                console.error("Failed to fetch lab devices:", error);
            }
        };

        fetchDevices();
    }, [authenticatedApiClient]);

    const addNewRow = async () => {
        const newDevice = new Device(
            Date.now(),
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

        try {
            const res = await authenticatedApiClient.createDevice(newDevice);
            if (res.data) {
                setLabDevices(prevDevices => [...prevDevices, res.data!]);
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
                id: row.id,
                originalData: { ...row },
                currentData: { ...row }
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
        const editingRow = editingRows[row.id];
        if (!editingRow) return;

        try {
            // fetch the latest device data to get the updated ports
            const latestDevice = await authenticatedApiClient.getDeviceById(row.id);
            if (latestDevice.data) {
                // merge the latest ports data with the current editing data
                const updatedData = {
                    ...editingRow.currentData,
                    ports: latestDevice.data.ports
                };

                // save the merged data
                const updatedDevice = await authenticatedApiClient.updateDevice(row.id, updatedData);
                if (updatedDevice.data) {
                    setLabDevices(prevDevices =>
                        prevDevices.map(device =>
                            device.id === row.id ? updatedDevice.data! : device
                        )
                    );
                    handleCancelEdit(row);
                }
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
                currentData: {
                    ...prev[row.id].currentData,
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

    const openPortModal = useCallback(async (row: Device) => {
        try {
            const latestDevice = await authenticatedApiClient.getDeviceById(row.id);
            if (latestDevice.data) {
                setSelectedDevice(latestDevice.data);
                setIsPortModalOpen(true);
            }
        } catch (error) {
            console.error("Failed to fetch device data:", error);
        }
    }, [authenticatedApiClient]);

    const openDescriptionModal = useCallback(async (row: Device) => {
        try {
            const latestDevice = await authenticatedApiClient.getDeviceById(row.id);
            if (latestDevice.data) {
                setSelectedDevice(latestDevice.data);
                setIsDescriptionModalOpen(true);
            }
        } catch (error) {
            console.error("Failed to fetch device data:", error);
        }
    }, [authenticatedApiClient]);

    const renderCell = (row: Device, name: string, placeholder: string) => {
        const isEditing = editingRows[row.id];
        const value = isEditing ? editingRows[row.id].currentData[name] : row[name];

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
        const value = isEditing ? toTitleCase(editingRows[row.id].currentData.icon) : toTitleCase(row.icon);

        return isEditing ? (
            <select
                value={value || ""}
                name="icon"
                onChange={(e) => handleInputChange(row, "icon", e.target.value)}
                className="w-full bg-white focus:outline-none"
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
                />
            )}
            {isPortModalOpen && selectedDevice && (
                <DeviceModal
                    renderTable={true}
                    setIsOpen={setIsPortModalOpen}
                    deviceInformation={selectedDevice}
                    isContentEditable={!!editingRows[selectedDevice.id]}
                />
            )}
        </section>
    );
}