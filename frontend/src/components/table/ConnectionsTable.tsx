import { useEffect, useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Connection } from '../../models/Connection';
import { Device } from '../../models/Device';
import customStyles from './dataTableStyles';

interface ConnectionsTableProps {
    interconnectDevices: Device[];
    labDevices: Device[];
}

// utility function to generate ports from a port definition string
const generatePorts = (portDefinition: string): string[] => {
    const [prefix, range] = portDefinition.split('|');
    if (!range) return [];
    const [start, end] = range.split('-').map(Number);
    if (isNaN(start) || isNaN(end)) return [];
    return Array.from({ length: end - start + 1 }, (_, i) => `${prefix}${start + i}`);
};

function ConnectionsTable({ interconnectDevices, labDevices }: ConnectionsTableProps) {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [usedPorts, setUsedPorts] = useState<Record<string, Set<string>>>({});
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [seenLabDevices, setSeenLabDevices] = useState<Set<string>>(new Set());
    const [labDevicesLoaded, setLabDevicesLoaded] = useState(false);

    // initialize seenLabDevices when labDevices are loaded
    useEffect(() => {
        if (!labDevicesLoaded && labDevices.length > 0) {
            console.log('Initializing seenLabDevices and creating initial connections');
            const initialSeenLabDevices = new Set(labDevices.map(device => device.name));
            setSeenLabDevices(initialSeenLabDevices);

            // TODO change this to pull from DB
            // create connections for the initial load
            const newConnections: Connection[] = [];
            labDevices.forEach(device => {
                // Generate ports for the device
                const portsArray = device.ports.split(',');
                const generatedPorts = portsArray.flatMap(portDef => generatePorts(portDef));

                // Create a connection for each port
                generatedPorts.forEach(port => {
                    newConnections.push(new Connection(
                        Date.now(),
                        device.name,
                        port,
                        '',
                        ''
                    ));
                });
            });
            setConnections(newConnections);
            setLabDevicesLoaded(true);
            console.log(connections);
        }
    }, [labDevices, labDevicesLoaded]);

    // Set available port information for interconnect devices
    const availablePortsMap = useMemo(() => {
        const map: Record<string, string[]> = {};
        interconnectDevices.forEach((d) => {
            if (d.ports) {
                const portsArray = d.ports.split(',');
                const ports = portsArray.flatMap((portDef) => generatePorts(portDef));
                map[d.name] = ports;
            }
        });
        return map;
    }, [interconnectDevices]);

    // update usedPorts state when connections change
    useEffect(() => {
        const updatedUsedPorts: Record<string, Set<string>> = {};
        connections.forEach(({ interconnectDeviceName, interconnectDevicePort }) => {
            if (interconnectDeviceName && interconnectDevicePort) {
                if (!updatedUsedPorts[interconnectDeviceName]) {
                    updatedUsedPorts[interconnectDeviceName] = new Set();
                }
                updatedUsedPorts[interconnectDeviceName].add(interconnectDevicePort);
            }
        });
        setUsedPorts(updatedUsedPorts);
    }, [connections]);

    // handle new lab device connection creation
    useEffect(() => {
        if (labDevicesLoaded) {
            console.log('Handling new lab device connection creation');
            const newLabDevices = labDevices.filter(device => !seenLabDevices.has(device.name) && device.ports);
            if (newLabDevices.length === 0) return;

            const newConnections: Connection[] = [];
            newLabDevices.forEach((device) => {
                // Generate ports for the device
                const portsArray = device.ports.split(',');
                const generatedPorts = portsArray.flatMap(portDef => generatePorts(portDef));

                // Create a connection for each port
                generatedPorts.forEach(port => {
                    newConnections.push({
                        id: Date.now(),
                        labDeviceName: device.name,
                        labDevicePort: port,
                        interconnectDeviceName: '',
                        interconnectDevicePort: '',
                    });
                });

                // Mark this lab device as seen
                setSeenLabDevices(prev => new Set(prev).add(device.name));
            });

            // update connections state if we have new connections
            if (newConnections.length > 0) {
                setConnections(prevConnections => [...prevConnections, ...newConnections]);
            }
        }
    }, [labDevices, labDevicesLoaded, seenLabDevices]);

    // handle deletion of connections when a lab device is deleted
    useEffect(() => {
        if (labDevicesLoaded) {
            console.log('Handling deletion of connections when a lab device is deleted');
            const existingLabDeviceNames = new Set(labDevices.map(device => device.name));
            const updatedConnections = connections.filter(conn => existingLabDeviceNames.has(conn.labDeviceName));
            if (updatedConnections.length !== connections.length) {
                setConnections(updatedConnections);
            }
        }
    }, [labDevices, labDevicesLoaded]); // do not add connections to this

    // Handle deletion of interconnect information for connections with deleted interconnect port or device
    useEffect(() => {
        if (labDevicesLoaded) {
            console.log('Handling deletion of interconnect information for connections with deleted interconnect port or device');
            const existingInterconnectDeviceNames = new Set(interconnectDevices.map(device => device.name));
            const updatedConnections = connections.map(conn => {
                if (!existingInterconnectDeviceNames.has(conn.interconnectDeviceName) ||
                    !availablePortsMap[conn.interconnectDeviceName]?.includes(conn.interconnectDevicePort)) {
                    return {
                        ...conn,
                        interconnectDeviceName: '',
                        interconnectDevicePort: '',
                    };
                }
                return conn;
            });

            setConnections(updatedConnections);
        }
    }, [interconnectDevices, availablePortsMap, labDevicesLoaded]); // do not add connections to this

    const handleDeviceChange = (index: number, newDeviceName: string) => {
        const updatedConnections = [...connections];
        updatedConnections[index] = {
            ...updatedConnections[index],
            interconnectDeviceName: newDeviceName,
            interconnectDevicePort: '', // Reset port when device changes
        };
        setConnections(updatedConnections);
    };

    const handlePortChange = (index: number, newPort: string) => {
        const updatedConnections = [...connections];
        updatedConnections[index] = {
            ...updatedConnections[index],
            interconnectDevicePort: newPort,
        };
        setConnections(updatedConnections);
    };

    const getFilteredPorts = (deviceName: string, selectedPort: string): string[] => {
        const allPorts = availablePortsMap[deviceName] || [];
        const usedPortsForDevice = usedPorts[deviceName] || new Set();

        return allPorts.filter(port => port === selectedPort || !usedPortsForDevice.has(port));
    };

    const columns = [
        {
            name: 'Lab Device',
            selector: (row: Connection) => row.labDeviceName,
            sortable: true,
        },
        {
            name: 'Lab Port',
            selector: (row: Connection) => row.labDevicePort,
            sortable: true,
        },
        {
            name: 'Interconnect Device',
            cell: (_, localIndex: number) => {
                const globalIndex = currentPage * rowsPerPage + localIndex;

                if (!connections[globalIndex]) {
                    return null;
                }

                return (
                    <select
                        value={connections[globalIndex].interconnectDeviceName || ''}
                        onChange={(e) => handleDeviceChange(globalIndex, e.target.value)}
                        className="w-full bg-transparent focus:outline-none hover:cursor-pointer"
                    >
                        <option value="">Select Device</option>
                        {interconnectDevices.map((device) => (
                            <option key={device.name} value={device.name}>
                                {device.name}
                            </option>
                        ))}
                    </select>
                );
            },
        },
        {
            name: 'Interconnect Port',
            cell: (_, localIndex: number) => {
                const globalIndex = currentPage * rowsPerPage + localIndex;
                const selectedDevice = connections[globalIndex]?.interconnectDeviceName;
                const selectedPort = connections[globalIndex]?.interconnectDevicePort;
                const availablePorts = getFilteredPorts(selectedDevice, selectedPort);

                if (!selectedDevice) {
                    return <span className="text-gray-400">Select an interconnect device</span>;
                }

                return (
                    <select
                        value={connections[globalIndex].interconnectDevicePort || ''}
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
        <section className="p-4">
            <DataTable
                columns={columns}
                data={connections}
                pagination
                paginationRowsPerPageOptions={[5, 10, 15]}
                onChangePage={(page) => setCurrentPage(page - 1)}
                onChangeRowsPerPage={(newRowsPerPage) => {
                    setRowsPerPage(newRowsPerPage);
                    setCurrentPage(0);
                }}
                customStyles={customStyles}
            />
        </section>
    );
}

export default ConnectionsTable;