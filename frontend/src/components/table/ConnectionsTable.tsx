import { CreateConnectionRequestPayload } from 'common';
import { useEffect, useMemo, useRef, useState } from 'react';
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
    const [deviceNameToUsedPortsMap, setDeviceNameToUsedPortsMap] = useState<Record<string, Set<string>>>({});
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const isCreatingNewConnectionsRef = useRef(false);
    const isDeletingConnectionsRef = useRef(false);

    // 1. Load connections from the database on mount
    useEffect(() => {
        const loadConnections = async () => {
            try {
                const res = await authenticatedApiClient.getAllConnections();
                setConnections(res.data ?? []);
            } catch (e) {
                console.error(e);
            }
        }
        loadConnections();
    }, [authenticatedApiClient]);

    // Update deviceNameToUsedPortsMap when a user modified connections
    useEffect(() => {
        const updatedUserPortsMap: Record<string, Set<string>> = {};
        connections.forEach((connection) => {
            if (connection.interconnectDeviceName && connection.interconnectDevicePort) {
                if (!updatedUserPortsMap[connection.interconnectDeviceName]) {
                    updatedUserPortsMap[connection.interconnectDeviceName] = new Set();
                }
                updatedUserPortsMap[connection.interconnectDeviceName].add(connection.interconnectDevicePort);
            }
        });
        setDeviceNameToUsedPortsMap(updatedUserPortsMap);
    }, [connections]);

    // Handle new lab device connections
    useEffect(() => {
        const storeNewConnections = async (newConnections: CreateConnectionRequestPayload[]) => {
            try {
                const res = await authenticatedApiClient.createConnectionBulk(newConnections);
                if (res.data) {
                    setConnections(prevConnections => [...prevConnections, ...res.data!]);
                }
            } catch (e) {
                console.error(e);
            }
        };

        // we only want to create connections when 
        // 1. the lab device has something for ports defined
        // 2. its a device name that doesn't already have connections present
        const newLabDevices = labDevices.filter(device => device.ports && !connections.some(c => c.labDeviceName === device.name));
        if (newLabDevices.length > 0) {
            const newConnections: CreateConnectionRequestPayload[] = [];
            newLabDevices.forEach(device => {
                const generatedPorts = device.ports.split(',').flatMap(portDef => generatePorts(portDef));
                generatedPorts.forEach(port => {
                    if (!connections.some(c => c.labDeviceName === device.name && c.labDevicePort === port)) {
                        newConnections.push({
                            labDeviceName: device.name,
                            labDevicePort: port,
                            interconnectDeviceName: '',
                            interconnectDevicePort: ''
                        });
                    }
                });
            });
            isCreatingNewConnectionsRef.current = true;
            storeNewConnections(newConnections);
        }

    }, [labDevices, connections, authenticatedApiClient]);

    // Handle deletion of lab device connections
    useEffect(() => {
        const deleteConnectionsFromDb = async (connectionsToDelete: Connection[]) => {
            try {
                const res = await authenticatedApiClient.deleteConnectionBulk(connectionsToDelete);
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
        };

        const existingLabDeviceNames = new Set(labDevices.map(device => device.name));
        const connectionsToDelete = connections.filter(conn => !existingLabDeviceNames.has(conn.labDeviceName));
        if (connectionsToDelete.length > 0) {
            isDeletingConnectionsRef.current = true;
            deleteConnectionsFromDb(connectionsToDelete);
        }
    }, [labDevices, connections, authenticatedApiClient]);

    // Handle updates to lab device ports
    useEffect(() => {
        if (isCreatingNewConnectionsRef.current) {
            isCreatingNewConnectionsRef.current = false;
            return;
        }
        if (isDeletingConnectionsRef.current) {
            isDeletingConnectionsRef.current = false;
            return;
        }

        const updateConnectionsInDb = async (updatedConnections: Connection[]) => {
            try {
                const existingConnections = await authenticatedApiClient.getAllConnections();
                const existingConnectionIds = new Set(existingConnections.data?.map((conn: Connection) => conn.id));

                const validUpdatedConnections = updatedConnections.filter(conn => existingConnectionIds.has(conn.id));

                if (validUpdatedConnections.length > 0) {
                    const res = await authenticatedApiClient.updateConnectionBulk(validUpdatedConnections);
                    if (res.data) {
                        setConnections(prevConnections =>
                            prevConnections.map(conn =>
                                res.data!.find(updatedConn => updatedConn.id === conn.id) || conn
                            )
                        );
                    }
                }
            } catch (e) {
                console.error(e);
            }
        };

        const storeNewConnections = async (newConnections: CreateConnectionRequestPayload[]) => {
            try {
                const res = await authenticatedApiClient.createConnectionBulk(newConnections);
                if (res.data) {
                    setConnections(prevConnections => [...prevConnections, ...res.data!]);
                }
            } catch (e) {
                console.error(e);
            }
        };

        const deleteConnectionsFromDb = async (connectionsToDelete: Connection[]) => {
            try {
                const res = await authenticatedApiClient.deleteConnectionBulk(connectionsToDelete);
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
        };

        // get the current state of ports per lab device
        const currentPortsMap: Record<string, Set<string>> = {};
        labDevices.forEach(device => {
            const portsArray = device.ports.split(',');
            const generatedPorts = portsArray.flatMap(portDef => generatePorts(portDef));
            currentPortsMap[device.name] = new Set(generatedPorts);
        });

        // identify connections with invalid ports and reset their labDevicePort
        const updatedConnections = connections.filter(conn => !currentPortsMap[conn.labDeviceName]?.has(conn.labDevicePort))
            .map(conn => ({
                ...conn,
                labDevicePort: ''
            }));

        if (updatedConnections.length > 0) {
            updateConnectionsInDb(updatedConnections);
        }

        // identify and create new connections for newly added ports
        const newConnections: CreateConnectionRequestPayload[] = [];
        labDevices.forEach(device => {
            const existingPorts = new Set(connections.filter(conn => conn.labDeviceName === device.name).map(conn => conn.labDevicePort));
            const newPorts = Array.from(currentPortsMap[device.name]!).filter(port => !existingPorts.has(port));
            newPorts.forEach(port => {
                if (!connections.some(c => c.labDeviceName === device.name && c.labDevicePort === port)) {
                    newConnections.push({
                        labDeviceName: device.name,
                        labDevicePort: port,
                        interconnectDeviceName: '',
                        interconnectDevicePort: ''
                    });
                }
            });
        });

        if (newConnections.length > 0) {
            storeNewConnections(newConnections);
        }

        // identify and delete connections for removed ports
        const connectionsToDelete = connections.filter(conn => !currentPortsMap[conn.labDeviceName]?.has(conn.labDevicePort));
        if (connectionsToDelete.length > 0) {
            deleteConnectionsFromDb(connectionsToDelete);
        }
    }, [labDevices, connections, authenticatedApiClient]);

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
            setConnections(prevConnections => {
                const revertedConnections = [...prevConnections];
                revertedConnections[index] = previousConnection;
                return revertedConnections;
            });
        }
    };

    const getFilteredPorts = (deviceName: string, selectedPort: string): string[] => {
        const allPorts = availablePortsMap[deviceName] || [];
        const usedPortsForDevice = deviceNameToUsedPortsMap[deviceName] || new Set();

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