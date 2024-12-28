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
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const [selectedDevice, setSelectedDevice] = useState<LabDevice | undefined>();

    const addNewRow = () => {
        addLabDevice({
            type: 'lab',
            deviceName: '',
            model: '',
            serialNumber: '',
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

    const openModal = useCallback((row: LabDevice, index: number) => {
        setSelectedIndex(index);
        setSelectedDevice(row);
        setIsOpen(true);
    }, []);

    const columns = [
        {
            name: 'Device Name',
            sortable: true,
            selector: row => row.deviceName,
            cell: (row, index) => (
                <input
                    type="text"
                    value={row.deviceName}
                    name="deviceName"
                    placeholder="Device name"
                    onChange={(e) => handleTableInputChange(index, e)}
                    className="w-full focus:outline-none"
                />
            )
        },
        {
            name: 'Model',
            selector: row => row.model,
            sortable: true,
            cell: (row, index) => (
                <input
                    type="text"
                    value={row.model}
                    name="model"
                    placeholder="Model"
                    onChange={(e) => handleTableInputChange(index, e)}
                    className="w-full focus:outline-none"
                />
            ),
        },
        {
            name: 'SN',
            selector: row => row.serialNumber,
            sortable: true,
            cell: (row, index) => (
                <input
                    type="text"
                    value={row.serialNumber}
                    name="serialNumber"
                    placeholder="Serial Number"
                    onChange={(e) => handleTableInputChange(index, e)}
                    className="w-full focus:outline-none"
                />
            ),
        },
        {
            name: 'Ports',
            cell: (row, index) => (
                <button onClick={() => openModal(row, index)} className='border-b-blue-400 border-b-2 flex flex-row items-center'>
                    Configure
                </button>
            ),
        },
        {
            name: '',
            cell: (_row, index) => (
                <div className="flex flex-row justify-center">
                    <button
                        type="button"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleRowDeleteClick(index)}
                    >
                        <CircleMinus />
                    </button>
                </div>
            ),
            button: true,
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
                customStyles={customStyles}
            />
            {isOpen && <DeviceModal setIsOpen={setIsOpen} deviceIndex={selectedIndex} deviceType='lab' deviceInformation={selectedDevice} />}
        </section>
    );
}