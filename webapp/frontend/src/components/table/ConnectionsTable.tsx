import { useEffect, useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useOnboardingStore } from '../../stores/onboarding';
import customStyles from './dataTableStyles';

interface Connection {
    labDevice: {
        name: string;
        port: string;
    };
    interconnectDevice: {
        name: string;
        port: string;
    }
}


function ConnectionsTable() {
    const { labDevices, interconnectDevices } = useOnboardingStore(
        (state) => state,
    );

    const [connections, setConnections] = useState<Connection[]>([]);
    const [usedPorts, setUsedPorts] = useState<Record<string, Set<string>>>({});
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // utility function to generate ports from a prot definition string
    const generatePorts = (portDefinition: string): string[] => {
        const [prefix, range] = portDefinition.split('|');
        if (!range) return [];
        const [start, end] = range.split('-').map(Number);
        if (isNaN(start) || isNaN(end)) return [];
        return Array.from({ length: end - start + 1 }, (_, i) => `${prefix}${start + i}`);
    };

    // set available port information
    const availablePortsMap = useMemo(() => {
        const map: Record<string, string[]> = {};
        interconnectDevices.forEach((d) => {
            const ports = d.ports.split(',').flatMap((portDef) => generatePorts(portDef));
            map[d.deviceName] = ports;
        });
        return map;
    }, [interconnectDevices]);

    // sync connections when lab devices change
    useEffect(() => {
        const newConnections: Connection[] = labDevices.flatMap((device) =>
            device.ports.split(',').flatMap((portDef) =>
                generatePorts(portDef).map((port) => ({
                    labDevice: { name: device.deviceName, port },
                    interconnectDevice: { name: '', port: '' }, // Initially empty
                }))
            )
        );
        setConnections(newConnections);
    }, [labDevices]);

    // update usedPorts state when connections change
    useEffect(() => {
        const updatedUsedPorts: Record<string, Set<string>> = {};
        connections.forEach(({ interconnectDevice }) => {
            if (interconnectDevice.name && interconnectDevice.port) {
                if (!updatedUsedPorts[interconnectDevice.name]) {
                    updatedUsedPorts[interconnectDevice.name] = new Set();
                }
                updatedUsedPorts[interconnectDevice.name].add(interconnectDevice.port);
            }
        });
        setUsedPorts(updatedUsedPorts);
    }, [connections]);

    // handle cleanup of connections when a device is deleted
    useEffect(() => {
        const labDeviceNames = new Set(labDevices.map((d) => d.deviceName));
        const interconnectDeviceNames = new Set(interconnectDevices.map((d) => d.deviceName));

        setConnections((prevConnections) =>
            prevConnections.filter(
                (connection) =>
                    labDeviceNames.has(connection.labDevice.name) &&
                    (!connection.interconnectDevice.name || interconnectDeviceNames.has(connection.interconnectDevice.name))
            )
        );
    }, [labDevices, interconnectDevices]);

    const handleDeviceChange = (index: number, newDeviceName: string) => {
        setConnections((prev) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                interconnectDevice: { name: newDeviceName, port: '' }, // reset port because the selected interconnect device changed
            };
            return updated;
        });
    };

    const handlePortChange = (index: number, newPort: string) => {
        setConnections((prev) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                interconnectDevice: { ...updated[index].interconnectDevice, port: newPort }, // changing the port for a selected connection
            };
            return updated;
        });
    };

    const getFilteredPorts = (deviceName: string, selectedPort: string): string[] => {
        const allPorts = availablePortsMap[deviceName] || [];
        const usedPortsForDevice = usedPorts[deviceName] || new Set();

        return allPorts.filter((port) => port === selectedPort || !usedPortsForDevice.has(port));
    }

    const columns = [
        { name: 'Lab Device', selector: (row: Connection) => row.labDevice.name },
        { name: 'Lab Port', selector: (row: Connection) => row.labDevice.port },
        {
            name: 'Interconnect Device',
            cell: (_, localIndex: number) => {
                const globalIndex = currentPage * rowsPerPage + localIndex;

                return (
                    <select
                        value={connections[globalIndex].interconnectDevice.name || ''}
                        onChange={(e) => handleDeviceChange(globalIndex, e.target.value)}
                        className="w-full bg-transparent focus:outline-none hover:cursor-pointer"
                    >
                        <option value="">Select Device</option>
                        {interconnectDevices.map((device) => (
                            <option key={device.deviceName} value={device.deviceName}>
                                {device.deviceName}
                            </option>
                        ))}
                    </select>
                )
            },
        },
        {
            name: 'Interconnect Port',
            cell: (_, localIndex: number) => {
                const globalIndex = currentPage * rowsPerPage + localIndex;
                const selectedDevice = connections[globalIndex].interconnectDevice.name;
                const selectedPort = connections[globalIndex].interconnectDevice.port;
                const availablePorts = getFilteredPorts(selectedDevice, selectedPort);

                if (!selectedDevice) {
                    return <span className="text-gray-400">Select an interconnect device</span>
                }

                return (
                    <select
                        value={connections[globalIndex].interconnectDevice.port || ''}
                        onChange={(e) => handlePortChange(globalIndex, e.target.value)}
                        disabled={!selectedDevice}
                        className="w-full bg-transparent focus:outline-none hover:cursor-pointer"
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
        },
    ];

    return (
        <section className='p-4'>
            {connections.length > 0 ? (
                <DataTable
                    columns={columns}
                    data={connections}
                    pagination
                    paginationRowsPerPageOptions={[5, 10, 15]}
                    onChangePage={(page) => setCurrentPage(page - 1)} // RDT pages aren't 0 indexed
                    onChangeRowsPerPage={(newRowsPerPage) => {
                        setRowsPerPage(newRowsPerPage);
                        setCurrentPage(0); // reset to the first page when rows per page changes
                    }}
                    customStyles={customStyles}
                />
            ) : (
                <div className='text-center font-semibold text-gray-500'>
                    Please add at least one interconnect device and one lab device to your inventory and configure their ports to view connections.
                </div>
            )}
        </section>
    );
}

export default ConnectionsTable;
