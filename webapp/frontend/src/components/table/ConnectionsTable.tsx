import { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useOnboardingStore } from '../../stores/onboarding';
import customStyles from './dataTableStyles';

interface Device {
    name: string;
    port: string;
}

function ConnectionsTable() {
    const { labDevices, interconnectDevices, addConnection } = useOnboardingStore(
        (state) => state,
    );

    const [expandedDevices, setExpandedDevices] = useState<Device[]>([]);
    const [uniqueDeviceNames, setUniqueDeviceNames] = useState<string[]>([]);
    const [selectedPorts, setSelectedPorts] = useState<Record<string, { device: string; port: string }>>({});
    const [availablePortsMap, setAvailablePortsMap] = useState<Record<string, string[]>>({});

    useEffect(() => {
        const uniqueNames = Array.from(
            new Set(interconnectDevices.map((d) => d.deviceName))
        );
        setUniqueDeviceNames(uniqueNames);

        // build the availablePortsMap
        const initialPortsMap: Record<string, string[]> = {};
        interconnectDevices.forEach((d) => {
            const ports = d.ports.split(',').flatMap((portDefinition) => {
                const [prefix, range] = portDefinition.split('|');
                if (!range) return [];
                const [start, end] = range.split('-');
                const numericStart = parseInt(start, 10);
                const numericEnd = parseInt(end, 10);
                if (isNaN(numericStart) || isNaN(numericEnd)) return [];
                return Array.from(
                    { length: numericEnd - numericStart + 1 },
                    (_, i) => `${prefix}${numericStart + i}`
                );
            });
            initialPortsMap[d.deviceName] = ports;
        });
        setAvailablePortsMap(initialPortsMap);

        // generate expanded devices from labDevices
        const expanded = labDevices.flatMap((d) => {
            const name = d.deviceName;
            return d.ports.split(',').flatMap((portDefinition) => {
                const [prefix, range] = portDefinition.split('|');
                if (!range) return []; // skip if range is invalid
                const [start, end] = range.split('-');
                const numericStart = parseInt(start, 10);
                const numericEnd = parseInt(end, 10);
                if (isNaN(numericStart) || isNaN(numericEnd)) return []; // skip invalid ranges

                // generate all ports for this range
                return Array.from(
                    { length: numericEnd - numericStart + 1 },
                    (_, i) => ({ name, port: `${prefix}${numericStart + i}` })
                );
            });
        });

        // update state once with the complete expanded list
        setExpandedDevices(expanded);
    }, [labDevices, interconnectDevices]);

    // TODO finish adding deletion and updating connections to the store

    const handleDeviceChange = (rowIndex: number, newDevice: string) => {
        setSelectedPorts((prev) => ({
            ...prev,
            [rowIndex]: { device: newDevice, port: '' }, // reset port when changing device
        }));
    };

    const handlePortChange = (rowIndex: number, newPort: string) => {
        const selectedDevice = selectedPorts[rowIndex]?.device;

        if (selectedDevice && newPort) {
            setSelectedPorts((prevSelectedPorts) => {
                // track the selected device and port
                const updatedSelectedPorts = { ...prevSelectedPorts };
                updatedSelectedPorts[rowIndex] = { device: selectedDevice, port: newPort };

                // add the connection to the Zustand store
                addConnection({
                    labDevice: expandedDevices[rowIndex].name,
                    interconnectDevice: selectedDevice,
                    labPort: expandedDevices[rowIndex].port,
                    interconnectPort: newPort,
                });

                return updatedSelectedPorts;
            });
        }
    };

    const columns = [
        {
            name: 'Device Name',
            sortable: true,
            selector: row => row.name,
            cell: (row) => (
                <p>{row.name}</p>
            )
        },
        {
            name: 'Port',
            selector: row => row.port,
            sortable: true,
            cell: (row) => (
                <p>{row.port}</p>
            ),
        },
        {
            name: '',
            cell: () => (
                <p>connected to</p>
            ),
        },
        {
            name: 'Interconnect Device',
            sortable: true,
            cell: (row, index) => (
                <select
                    value={selectedPorts[index]?.device || ''}
                    onChange={(e) => handleDeviceChange(index, e.target.value)}
                    className="bg-transparent focus:outline-none hover:cursor-pointer"
                >
                    <option value="">Select Device</option>
                    {uniqueDeviceNames.map((deviceName) => (
                        <option key={deviceName} value={deviceName}>
                            {deviceName}
                        </option>
                    ))}
                </select>
            ),
        },
        {
            name: 'Port',
            cell: (row, index) => {
                const selectedDevice = selectedPorts[index]?.device;

                // If no device is selected, return null
                if (!selectedDevice) return null;

                // Get all available ports for the selected device
                const availablePorts = availablePortsMap[selectedDevice] || [];

                return (
                    <select
                        value={selectedPorts[index]?.port || ''}
                        onChange={(e) => handlePortChange(index, e.target.value)}
                        disabled={!selectedDevice}
                        className="bg-transparent focus:outline-none hover:cursor-pointer"
                    >
                        <option value="">Select Port</option>
                        {availablePorts.map((port) => (
                            <option key={port} value={port}>
                                {port}
                            </option>
                        ))}
                    </select>
                );
            },
        }
    ];

    return (
        <section className='p-4'>
            <DataTable
                columns={columns}
                data={expandedDevices}
                pagination
                paginationRowsPerPageOptions={[5, 10, 15]}
                customStyles={customStyles}
            />
        </section>
    );
}

export default ConnectionsTable;
