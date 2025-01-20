import { CircleMinus, CirclePlus, Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import customStyles from './dataTableStyles';

interface DevicePortsTableProps {
    deviceId: number | undefined;
    ports: string;
    onUpdatePorts: (deviceId: number, updatedPorts: string) => void;
}

interface Port {
    prefix: string;
    range: string;
}

const DevicePortsTable: React.FC<DevicePortsTableProps> = ({ deviceId, ports, onUpdatePorts }) => {

    const [devicePorts, setDevicePorts] = useState<Port[]>([]);
    const [initialPorts, setInitialPorts] = useState<string>('');
    const [isSaveDisabled, setIsSaveDisabled] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // initialize devicePorts and initialPorts when the component mounts
    useEffect(() => {
        if (ports.trim()) {
            const portArr = ports.split(',').map((portStr) => {
                const [prefix, range] = portStr.split('|');

                // return a Port object
                return {
                    prefix: prefix.trim(),
                    range: range
                };
            });
            setDevicePorts(portArr);
            setInitialPorts(ports);
        } else {
            setDevicePorts([]);
            setInitialPorts('');
        }
    }, [ports]);

    // check if devicePorts is different from initialPorts when devicePorts changes
    useEffect(() => {
        const currentPorts = devicePorts.map((port) => `${port.prefix}|${port.range}`).join(',');
        setIsSaveDisabled(currentPorts === initialPorts); // disable Save button if no changes
    }, [devicePorts, initialPorts]);

    const addNewRow = () => {
        const blankPort: Port = {
            prefix: '',
            range: ''
        };

        setDevicePorts((prevPorts) => [...prevPorts, blankPort]);
    };

    const handleTableInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newDevicePorts = [...devicePorts];
        newDevicePorts[index] = { ...newDevicePorts[index], [name]: value };
        setDevicePorts(newDevicePorts);
    };

    const handleRowDeleteClick = (index: number) => {
        const newDevicePorts = devicePorts.filter((_, i) => i !== index);
        setDevicePorts(newDevicePorts);
    };

    const save = () => {
        // save the ports to the index of the device that we are editing currently
        const portStrings = devicePorts.map(port => {
            // combine prefix and port range in the format prefix|startNumber-endNumber
            return `${port.prefix}|${port.range}`;
        });
        const portsToSave = portStrings.join(',');
        if (deviceId) {
            onUpdatePorts(deviceId, portsToSave);
        }
    }

    const columns = [
        {
            name: 'Interface Prefix',
            sortable: true,
            selector: row => row.prefix,
            cell: (row, localIndex: number) => {
                const globalIndex = currentPage * rowsPerPage + localIndex;

                return (
                    <input
                        type="text"
                        value={row.prefix}
                        name="prefix"
                        placeholder="GigabitEthernet1/0/"
                        onChange={(e) => handleTableInputChange(globalIndex, e)}
                        className="w-full focus:outline-none"
                    />
                )
            }
        },
        {
            name: 'Port Range',
            selector: (row) => row.range,
            cell: (row, localIndex: number) => {
                const globalIndex = currentPage * rowsPerPage + localIndex;

                return (
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={row.range}
                            name="range"
                            placeholder="1-46"
                            onChange={(e) => handleTableInputChange(globalIndex, e)}
                            className="w-full focus:outline-none"
                        />
                    </div>
                )
            },
        },
        {
            name: '',
            cell: () => (<span></span>),
            width: '50px'
        },
        {
            name: '',
            cell: (_row, localIndex) => {
                const globalIndex = currentPage * rowsPerPage + localIndex;

                return (
                    <div className="flex flex-row justify-end">
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
            width: '56px'
        },
    ];

    return (
        <section className='mt-4'>
            <DataTable
                columns={columns}
                data={devicePorts}
                pagination
                paginationRowsPerPageOptions={[5, 10, 15]}
                onChangePage={(page) => setCurrentPage(page - 1)} // RDT pages aren't 0 indexed
                onChangeRowsPerPage={(newRowsPerPage) => {
                    setRowsPerPage(newRowsPerPage);
                    setCurrentPage(0); // reset to the first page when rows per page changes
                }}
                customStyles={customStyles}
            />
            <div className='flex flex-row justify-end pt-6'>
                <div className="flex flex-row justify-end items-center">
                    <button
                        className="r-btn tertiary flex flex-row items-center gap-2"
                        onClick={addNewRow}>
                        <CirclePlus /> Add Port Range
                    </button>
                </div>
                <button
                    onClick={save}
                    disabled={isSaveDisabled}
                    className={`r-btn text-green-600 hover:text-green-700 flex flex-row items-center gap-1 ${isSaveDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <Save /> Save
                </button>
            </div>
        </section>
    )
}

export default DevicePortsTable;
