import { CircleMinus, CirclePlus } from 'lucide-react';
import { useCallback, useState } from 'react';
import DataTable from 'react-data-table-component';
import { LabDevice, useOnboardingStore } from "../../stores/onboarding";
import DeviceModal from '../DeviceModal';
import customStyles from './dataTableStyles';

export default function LabDevicesTable() {
    const { labDevices, addLabDevice, updateLabDevice, removeLabDevice } = useOnboardingStore(
        (state) => state, // select the entire state object for this store, can specify by using dot notation
    );
    const [isPortModalOpen, setIsPortModalOpen] = useState(false);
    const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const [selectedDevice, setSelectedDevice] = useState<LabDevice | undefined>();
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const addNewRow = () => {
        addLabDevice({
            type: 'lab',
            deviceName: '',
            icon: '',
            model: '',
            serialNumber: '',
            description: '',
            ports: ''
        });
    }

    const handleTableInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        updateLabDevice(index, { [name]: value });
    };

    const handleRowDeleteClick = (index: number) => {
        removeLabDevice(index);
    };

    const openPortModal = useCallback((row: LabDevice, index: number) => {
        setSelectedIndex(index);
        setSelectedDevice(row);
        setIsPortModalOpen(true);
    }, []);

    const openDescriptionModal = useCallback((row: LabDevice, index: number) => {
        setSelectedIndex(index);
        setSelectedDevice(row);
        setIsDescriptionModalOpen(true);
    }, [])

    const columns = [
        {
            name: 'Device Name',
            sortable: true,
            selector: row => row.deviceName,
            cell: (row, localIndex: number) => {
                const globalIndex = currentPage * rowsPerPage + localIndex;

                return (
                    <input
                        type="text"
                        value={row.deviceName}
                        name="deviceName"
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
                        <option value="router">Router</option>
                        <option value="switch">Switch</option>
                        <option value="external">External</option>
                        <option value="server">Server</option>
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
            cell: (row, localIndex: number) => {
                const globalIndex = currentPage * rowsPerPage + localIndex;

                return (
                    <button onClick={() => openDescriptionModal(row, globalIndex)} className='border-b-blue-400 border-b-2 flex flex-row items-center'>
                        Edit
                    </button>
                )
            }
        },
        {
            name: 'Ports',
            cell: (row, localIndex: number) => {
                const globalIndex = currentPage * rowsPerPage + localIndex;

                return (
                    <button onClick={() => openPortModal(row, globalIndex)} className='border-b-blue-400 border-b-2 flex flex-row items-center'>
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
            {isDescriptionModalOpen && <DeviceModal renderTable={false} setIsOpen={setIsDescriptionModalOpen} deviceIndex={selectedIndex} deviceType='lab' deviceInformation={selectedDevice} />}
            {isPortModalOpen && <DeviceModal renderTable={true} setIsOpen={setIsPortModalOpen} deviceIndex={selectedIndex} deviceType='lab' deviceInformation={selectedDevice} />}
        </section>
    );
}