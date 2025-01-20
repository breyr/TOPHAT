import { CircleMinus, CirclePlus } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useAuth } from '../../hooks/useAuth';
import { debounce } from '../../lib/helpers';
import { Device } from '../../models/Device';
import DeviceModal from '../DeviceModal';
import customStyles from './dataTableStyles';

interface LabDevicesTableProps {
    labDevices: Device[];
    setLabDevices: React.Dispatch<React.SetStateAction<Device[]>>;
}


export default function LabDevicesTable({
    labDevices,
    setLabDevices
}: LabDevicesTableProps) {
    const { authenticatedApiClient } = useAuth();
    const [isPortModalOpen, setIsPortModalOpen] = useState(false);
    const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<Device | undefined>();
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const pendingUpdates = useRef<{ [key: string]: NodeJS.Timeout }>({});

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
            Date.now(), // need an arbitrary id, this won't actually be used to create the device
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

        // attempt to add to database
        const res = await authenticatedApiClient.createDevice(newDevice);
        if (res.data) {
            setLabDevices(prevDevices => [
                ...prevDevices,
                res.data!
            ]);
        }
    };

    const updateDevice = useCallback(
        debounce(async (index: number, name: string, value: string) => {
            const deviceToUpdate = labDevices[index];
            if (deviceToUpdate) {
                await authenticatedApiClient.updateDevice(deviceToUpdate.id, { [name]: value });
            }
        }, 1000),
        [labDevices]
    );

    const handleTableInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updateKey = `${index}-${name}`;

        // Clear any existing timeout for this field
        if (pendingUpdates.current[updateKey]) {
            clearTimeout(pendingUpdates.current[updateKey]);
        }

        // Update local state immediately
        setLabDevices(prevDevices => {
            const updatedDevices = [...prevDevices];
            const device = updatedDevices[index];
            if (device) {
                (device as any)[name] = value;
            }
            return updatedDevices;
        });

        // Set new timeout for this update
        pendingUpdates.current[updateKey] = setTimeout(() => {
            updateDevice(index, name, value);
            delete pendingUpdates.current[updateKey];
        }, 1000);
    };

    const handleRowDeleteClick = async (index: number) => {
        const deviceToDelete = labDevices[index];
        if (deviceToDelete.id) {
            try {
                await authenticatedApiClient.deleteDevice(deviceToDelete.id);
            } catch (error) {
                console.error("Failed to delete device:", error);
                return;
            }
        }
        setLabDevices(prevDevices => prevDevices.filter((_, i) => i !== index));
    };

    const openPortModal = useCallback((row: Device) => {
        setSelectedDevice(row);
        setIsPortModalOpen(true);
    }, []);

    const openDescriptionModal = useCallback((row: Device) => {
        setSelectedDevice(row);
        setIsDescriptionModalOpen(true);
    }, []);

    const columns = [
        {
            name: 'Device Name',
            sortable: true,
            selector: row => row.name,
            cell: (row, localIndex: number) => {
                const globalIndex = currentPage * rowsPerPage + localIndex;

                return (
                    <input
                        type="text"
                        value={row.name}
                        name="name"
                        placeholder="Device name"
                        onChange={(e) => handleTableInputChange(globalIndex, e)}
                        className="w-full focus:outline-none"
                    />
                )
            }
        },
        {
            name: 'Type',
            selector: row => row.icon,
            sortable: true,
            cell: (row, localIndex: number) => {
                const globalIndex = currentPage * rowsPerPage + localIndex;

                return (
                    <select
                        value={row.icon || ""}
                        name="icon"
                        onChange={(e) => handleTableInputChange(globalIndex, e)}
                        className="bg-transparent focus:outline-none hover:cursor-pointer"
                    >
                        <option value="" disabled>Select</option>
                        <option value="ROUTER">Router</option>
                        <option value="SWITCH">Switch</option>
                        <option value="EXTERNAL">External</option>
                        <option value="SERVER">Server</option>
                    </select>
                )
            }
        },
        {
            name: 'Model',
            selector: row => row.model,
            sortable: true,
            cell: (row, localIndex: number) => {
                const globalIndex = currentPage * rowsPerPage + localIndex;

                return (
                    <input
                        type="text"
                        value={row.model}
                        name="model"
                        placeholder="Model"
                        onChange={(e) => handleTableInputChange(globalIndex, e)}
                        className="w-full focus:outline-none"
                    />
                )
            }
        },
        {
            name: 'SN',
            selector: row => row.serialNumber,
            sortable: true,
            cell: (row, localIndex: number) => {
                const globalIndex = currentPage * rowsPerPage + localIndex;

                return (
                    <input
                        type="text"
                        value={row.serialNumber}
                        name="serialNumber"
                        placeholder="Serial Number"
                        onChange={(e) => handleTableInputChange(globalIndex, e)}
                        className="w-full focus:outline-none"
                    />
                )
            }
        },
        {
            name: 'Description',
            cell: (row) => {
                return (
                    <button onClick={() => openDescriptionModal(row)} className='border-b-blue-400 border-b-2 flex flex-row items-center'>
                        Edit
                    </button>
                )
            }
        },
        {
            name: 'Ports',
            cell: (row) => {
                return (
                    <button onClick={() => openPortModal(row)} className='border-b-blue-400 border-b-2 flex flex-row items-center'>
                        Configure
                    </button>
                )
            }
        },
        {
            name: '',
            cell: (_, localIndex: number) => {
                const globalIndex = currentPage * rowsPerPage + localIndex;

                return (
                    <div className="flex flex-row justify-center">
                        <button
                            type="button"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleRowDeleteClick(globalIndex)}
                        >
                            <CircleMinus />
                        </button>
                    </div>
                )
            },
            width: '56px',
        },
    ];

    return (
        <section className='p-4'>
            <div className="flex flex-row justify-end">
                <button
                    className="r-btn primary flex flex-row items-center gap-2"
                    onClick={addNewRow}>
                    <CirclePlus /> Add Device
                </button>
            </div>
            <DataTable
                columns={columns}
                data={labDevices}
                pagination
                paginationRowsPerPageOptions={[5, 10, 15]}
                onChangePage={(page) => setCurrentPage(page - 1)} // RDT pages aren't 0 indexed
                onChangeRowsPerPage={(newRowsPerPage) => {
                    setRowsPerPage(newRowsPerPage);
                    setCurrentPage(0); // reset to the first page when rows per page changes
                }}
                customStyles={customStyles}
            />
            {isDescriptionModalOpen && <DeviceModal renderTable={false} setIsOpen={setIsDescriptionModalOpen} deviceType='LAB' deviceInformation={selectedDevice} />}
            {isPortModalOpen && <DeviceModal renderTable={true} setIsOpen={setIsPortModalOpen} deviceType='LAB' deviceInformation={selectedDevice} />}
        </section>
    );
}