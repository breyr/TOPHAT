import { CircleMinus, CirclePlus } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import DataTable from 'react-data-table-component';
import { DeviceType } from '../../../../common/shared-types';
import { useAuth } from '../../hooks/useAuth';
import { debounce } from '../../lib/helpers';
import { Device } from '../../models/Device';
import DeviceModal from '../DeviceModal';
import customStyles from './dataTableStyles';

interface InterconnectDevicesTableProps {
    interconnectDevices: Device[];
    setInterconnectDevices: React.Dispatch<React.SetStateAction<Device[]>>;
}

export default function InterconnectDevicesTable({
    interconnectDevices,
    setInterconnectDevices
}: InterconnectDevicesTableProps) {
    const { authenticatedApiClient } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<Device | undefined>();
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const pendingUpdates = useRef<{ [key: string]: NodeJS.Timeout }>({});

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const res = await authenticatedApiClient.getDevicesByType('INTERCONNECT');
                setInterconnectDevices(res.data || []);
            } catch (error) {
                console.error("Failed to fetch interconnect devices:", error);
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
            null,
            '',
            '',
            '',
            '',
            'INTERCONNECT' as DeviceType,
            null
        );

        // attempt to add to database
        const res = await authenticatedApiClient.createDevice(newDevice);
        if (res.data) {
            setInterconnectDevices(prevDevices => [
                ...prevDevices,
                res.data!
            ]);
        }
    };

    const updateDevice = useCallback(
        debounce(async (index: number, name: string, value: string) => {
            const deviceToUpdate = interconnectDevices[index];
            if (deviceToUpdate) {
                await authenticatedApiClient.updateDevice(deviceToUpdate.id, { [name]: value });
            }
        }, 1000),
        [interconnectDevices]
    );

    const handleTableInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updateKey = `${index}-${name}`;

        // Clear any existing timeout for this field
        if (pendingUpdates.current[updateKey]) {
            clearTimeout(pendingUpdates.current[updateKey]);
        }

        // Update local state immediately
        setInterconnectDevices(prevDevices => {
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
        const deviceToDelete = interconnectDevices[index];
        if (deviceToDelete.id) {
            try {
                await authenticatedApiClient.deleteDevice(deviceToDelete.id);
            } catch (error) {
                console.error("Failed to delete device:", error);
                return;
            }
        }
        setInterconnectDevices(prevDevices => prevDevices.filter((_, i) => i !== index));
    };

    const openModal = useCallback((row: Device) => {
        setSelectedDevice(row);
        setIsOpen(true);
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
            name: 'IP Address',
            selector: row => row.ipAddress,
            sortable: true,
            cell: (row, localIndex: number) => {
                const globalIndex = currentPage * rowsPerPage + localIndex;

                return (
                    <input
                        type="text"
                        value={row.ipAddress}
                        name="ipAddress"
                        placeholder="IP Address"
                        onChange={(e) => handleTableInputChange(globalIndex, e)}
                        className="w-full focus:outline-none"
                    />
                )
            }
        },
        {
            name: 'Username',
            selector: row => row.username,
            sortable: true,
            cell: (row, localIndex: number) => {
                const globalIndex = currentPage * rowsPerPage + localIndex;

                return (
                    <input
                        type="text"
                        value={row.username}
                        name="username"
                        placeholder="Username"
                        onChange={(e) => handleTableInputChange(globalIndex, e)}
                        className="w-full focus:outline-none"
                    />
                )
            }
        },
        {
            name: 'Password',
            selector: row => row.password,
            sortable: true,
            cell: (row, localIndex: number) => {
                const globalIndex = currentPage * rowsPerPage + localIndex;

                return (
                    <input
                        type="text"
                        value={row.password}
                        name="password"
                        placeholder="Password"
                        onChange={(e) => handleTableInputChange(globalIndex, e)}
                        className="w-full focus:outline-none"
                    />
                )
            },
        },
        {
            name: 'Secret Password',
            selector: row => row.secretPassword,
            sortable: true,
            cell: (row, localIndex: number) => {
                const globalIndex = currentPage * rowsPerPage + localIndex;

                return (
                    <input
                        type="text"
                        value={row.secretPassword}
                        name="secretPassword"
                        placeholder="Secret Password"
                        onChange={(e) => handleTableInputChange(globalIndex, e)}
                        className="w-full focus:outline-none"
                    />
                )
            },
        },
        {
            name: 'Ports',
            cell: (row) => {
                return (
                    <button onClick={() => openModal(row)} className='border-b-blue-400 border-b-2 flex flex-row items-center'>
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
                data={interconnectDevices}
                pagination
                paginationRowsPerPageOptions={[5, 10, 15]}
                onChangePage={(page) => setCurrentPage(page - 1)} // RDT pages aren't 0 indexed
                onChangeRowsPerPage={(newRowsPerPage) => {
                    setRowsPerPage(newRowsPerPage);
                    setCurrentPage(0); // reset to the first page when rows per page changes
                }}
                customStyles={customStyles}
                keyField="id" // Ensure each row has a unique key
            />
            {isOpen && (
                <DeviceModal
                    renderTable={true}
                    setIsOpen={setIsOpen}
                    deviceType='INTERCONNECT'
                    deviceInformation={selectedDevice}
                />
            )}
        </section>
    );
}