import { CreateConnectionRequestPayload } from 'common';
import { useEffect, useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useAuth } from '../../hooks/useAuth';
import { generatePorts } from '../../lib/helpers';
import { Connection } from '../../models/Connection';
import { Device } from '../../models/Device';
import customStyles from './dataTableStyles';

interface ConnectionsTableProps {
    interconnectDevices: Device[];
    labDevices: Device[];
}

function ConnectionsTable({ interconnectDevices, labDevices }: ConnectionsTableProps) {
    const { authenticatedApiClient } = useAuth();
    const [connections, setConnections] = useState<Connection[]>([]);
    const [usedPorts, setUsedPorts] = useState<Record<string, Set<string>>>({});
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [seenLabDevices, setSeenLabDevices] = useState<Set<string>>(new Set());
    const [labDevicesLoaded, setLabDevicesLoaded] = useState(false);

    // initialize seenLabDevices when labDevices are loaded
    // this useEffect is for the initial component mount where we render connections from the DB
    useEffect(() => {
        const initializeConnections = async () => {
            try {
                // First, get all existing connections
                const res = await authenticatedApiClient.getAllConnections();
                setConnections(res.data ?? []);
                
                // Extract the unique set of lab device names from existing connections
                const existingLabDeviceNames = new Set(
                    (res.data ?? []).map(conn => conn.labDeviceName)
                );
                
                // Initialize seenLabDevices with ALL lab devices that already have connections
                setSeenLabDevices(existingLabDeviceNames);
            } catch (e) {
                console.error(e);
            } finally {
                setLabDevicesLoaded(true);
            }
        };
    
        if (!labDevicesLoaded && labDevices.length > 0) {
            initializeConnections();
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

    // handle new lab device connection creation and the addition of ports
    useEffect(() => {
        const storeNewConnections = async (connections: CreateConnectionRequestPayload[]) => {
            try {
                const res = await authenticatedApiClient.createConnectionBulk(connections);
                if (res.data) {
                    setConnections(prevConnections => [...prevConnections, ...res.data!]);
                }
            } catch (e) {
                console.error(e);
            }
        };

        if (!labDevicesLoaded) return;

        const newLabDevices = labDevices.filter(device => !seenLabDevices.has(device.name) && device.ports);

        if (newLabDevices.length === 0) return;

        const newConnections: CreateConnectionRequestPayload[] = [];

        newLabDevices.forEach(device => {
            const generatedPorts = device.ports.split(',').flatMap(portDef => generatePorts(portDef));

            generatedPorts.forEach(port => {
                newConnections.push({
                    labDeviceName: device.name,
                    labDevicePort: port,
                    interconnectDeviceName: '',
                    interconnectDevicePort: ''
                });
            });
        });

        if (newConnections.length > 0) {
            storeNewConnections(newConnections);
        }

        // Update seenLabDevices *outside* the loop
        setSeenLabDevices(prev => {
            const updatedSet = new Set(prev);
            newLabDevices.forEach(device => updatedSet.add(device.name));
            return updatedSet;
        });

    }, [labDevices, labDevicesLoaded]);

    // handle deletion of connections when a lab device is deleted or ports are removed from a lab device
    useEffect(() => {
        // function to delete connections in the database
        const deleteConnectionsFromDb = async (connectionsToDelete: Connection[]) => {
            try {
                const res = await authenticatedApiClient.deleteConnectionBulk(connectionsToDelete);
                // update connections state to reflect deletions
                if (res.data) {
                    setConnections(prevConnections =>
                        prevConnections.filter(conn =>
                            !connectionsToDelete.some(toDelete => toDelete.id === conn.id)
                        )
                    );
                }
            } catch (e) {
                console.error(e);
            }
        }

        if (labDevicesLoaded) {
            const existingLabDeviceNames = new Set(labDevices.map(device => device.name));
            const currentPortsMap: Record<string, Set<string>> = {};

            labDevices.forEach(device => {
                const portsArray = device.ports.split(',');
                const generatedPorts = portsArray.flatMap(portDef => generatePorts(portDef));
                currentPortsMap[device.name] = new Set(generatedPorts);
            });

            const connectionsToDelete = connections.filter(conn =>
                !existingLabDeviceNames.has(conn.labDeviceName) ||
                !currentPortsMap[conn.labDeviceName]?.has(conn.labDevicePort)
            );

            if (connectionsToDelete.length > 0) {
                deleteConnectionsFromDb(connectionsToDelete);
            }
        }
    }, [labDevices, labDevicesLoaded]); // do not add connections to this

    // handle deletion of interconnect information for connections with deleted interconnect port or device
    useEffect(() => {
        const updateConnectionsInDb = async (updatedConnections: Connection[]) => {
            try {
                const res = await authenticatedApiClient.updateConnectionBulk(updatedConnections);
                if (res.data) {
                    setConnections(prevConnections =>
                        prevConnections.map(conn =>
                            res.data!.find(updatedConn => updatedConn.id === conn.id) || conn
                        )
                    );
                }
            } catch (e) {
                console.error(e);
            }
        };

        if (labDevicesLoaded) {
            const existingInterconnectDeviceNames = new Set(interconnectDevices.map(device => device.name));
            const updatedConnections = connections.filter(conn =>
                !existingInterconnectDeviceNames.has(conn.interconnectDeviceName) ||
                !availablePortsMap[conn.interconnectDeviceName]?.includes(conn.interconnectDevicePort)
            ).map(conn => ({
                ...conn,
                interconnectDeviceName: '',
                interconnectDevicePort: '',
            }));

            // Only update if there are changes
            if (updatedConnections.length > 0) {
                updateConnectionsInDb(updatedConnections);
            }
        }
    }, [interconnectDevices, availablePortsMap, labDevicesLoaded]); // do not add connections to this

    const handleDeviceChange = async (index: number, newDeviceName: string) => {
        const updatedConnections = [...connections];
        const previousConnection = { ...updatedConnections[index] };
        updatedConnections[index] = {
            ...updatedConnections[index],
            interconnectDeviceName: newDeviceName,
            interconnectDevicePort: '', // reset port when device changes
        };
        setConnections(updatedConnections);

        try {
            await authenticatedApiClient.updateConnection(updatedConnections[index].id, updatedConnections[index]);
        } catch (e) {
            console.error(e);
            // revert to the previous state if the API call fails
            setConnections(prevConnections => {
                const revertedConnections = [...prevConnections];
                revertedConnections[index] = previousConnection;
                return revertedConnections;
            });
        }
    };

    const handlePortChange = async (index: number, newPort: string) => {
        const updatedConnections = [...connections];
        const previousConnection = { ...updatedConnections[index] };
        updatedConnections[index] = {
            ...updatedConnections[index],
            interconnectDevicePort: newPort,
        };
        setConnections(updatedConnections);

        try {
            await authenticatedApiClient.updateConnection(updatedConnections[index].id, updatedConnections[index]);
        } catch (e) {
            console.error(e);
            // revert to the previous state if the API call fails
            setConnections(prevConnections => {
                const revertedConnections = [...prevConnections];
                revertedConnections[index] = previousConnection;
                return revertedConnections;
            });
        }
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
                    return;
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