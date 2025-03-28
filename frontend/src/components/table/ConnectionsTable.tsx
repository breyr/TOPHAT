import { CreateConnectionRequestPayload } from 'common';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
    const isInitialLoadRef = useRef(true);
    const isUpdatingConnectionsRef = useRef(false);

    // Load connections from the database on mount - only once
    useEffect(() => {
        const loadConnections = async () => {
            try {
                const res = await authenticatedApiClient.getAllConnections();
                setConnections(res.data ?? []);
                isInitialLoadRef.current = false;
            } catch (e) {
                console.error(e);
                isInitialLoadRef.current = false;
            }
        }
        loadConnections();
    }, [authenticatedApiClient]);

    // Update deviceNameToUsedPortsMap when connections change
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

    // Handle syncing connections with lab devices - only run after initial load
    useEffect(() => {
        // Skip during initial load or when actively updating connections
        if (isInitialLoadRef.current || isUpdatingConnectionsRef.current) {
            return;
        }

        const syncLabDeviceConnections = async () => {
            isUpdatingConnectionsRef.current = true;
            try {
                // Step 1: Calculate current state of lab device ports
                const currentPortsMap: Record<string, Set<string>> = {};
                labDevices.forEach(device => {
                    if (device.ports) {
                        const portsArray = device.ports.split(',');
                        const generatedPorts = portsArray.flatMap(portDef => generatePorts(portDef));
                        currentPortsMap[device.name] = new Set(generatedPorts);
                    }
                });

                // Step 2: Create connections for new lab devices
                const newLabDevices = labDevices.filter(device =>
                    device.ports && !connections.some(c => c.labDeviceName === device.name)
                );

                if (newLabDevices.length > 0) {
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
                        const res = await authenticatedApiClient.createConnectionBulk(newConnections);
                        if (res.data) {
                            setConnections(prevConnections => [...prevConnections, ...res.data!]);
                        }
                    }
                }

                // Step 3: Delete connections for removed lab devices
                const existingLabDeviceNames = new Set(labDevices.map(device => device.name));
                const connectionsToDelete = connections.filter(conn =>
                    !existingLabDeviceNames.has(conn.labDeviceName)
                );

                if (connectionsToDelete.length > 0) {
                    const res = await authenticatedApiClient.deleteConnectionBulk(connectionsToDelete);
                    if (res.data) {
                        setConnections(prevConnections =>
                            prevConnections.filter(conn =>
                                !connectionsToDelete.some(toDelete => toDelete.id === conn.id)
                            )
                        );
                    }
                }

                // Step 4: Update connections for modified lab device ports
                const existingLabDevices = labDevices.filter(device =>
                    connections.some(c => c.labDeviceName === device.name)
                );

                if (existingLabDevices.length > 0) {
                    // Handle invalid ports (update)
                    const connectionsToUpdate = connections.filter(conn =>
                        existingLabDeviceNames.has(conn.labDeviceName) &&
                        !currentPortsMap[conn.labDeviceName]?.has(conn.labDevicePort)
                    ).map(conn => ({
                        ...conn,
                        labDevicePort: ''
                    }));

                    if (connectionsToUpdate.length > 0) {
                        const res = await authenticatedApiClient.updateConnectionBulk(connectionsToUpdate);
                        if (res.data) {
                            setConnections(prevConnections =>
                                prevConnections.map(conn =>
                                    res.data!.find(updatedConn => updatedConn.id === conn.id) || conn
                                )
                            );
                        }
                    }

                    // Handle new ports (create)
                    const newPortConnections: CreateConnectionRequestPayload[] = [];
                    existingLabDevices.forEach(device => {
                        const existingPorts = new Set(
                            connections
                                .filter(conn => conn.labDeviceName === device.name)
                                .map(conn => conn.labDevicePort)
                        );

                        const currentPorts = currentPortsMap[device.name] || new Set();
                        const newPorts = Array.from(currentPorts).filter(port => !existingPorts.has(port));

                        newPorts.forEach(port => {
                            newPortConnections.push({
                                labDeviceName: device.name,
                                labDevicePort: port,
                                interconnectDeviceName: '',
                                interconnectDevicePort: ''
                            });
                        });
                    });

                    if (newPortConnections.length > 0) {
                        const res = await authenticatedApiClient.createConnectionBulk(newPortConnections);
                        if (res.data) {
                            setConnections(prevConnections => [...prevConnections, ...res.data!]);
                        }
                    }

                    // Handle removed ports (delete)
                    const deletableConnections = connections.filter(conn =>
                        existingLabDeviceNames.has(conn.labDeviceName) &&
                        !currentPortsMap[conn.labDeviceName]?.has(conn.labDevicePort)
                    );

                    if (deletableConnections.length > 0) {
                        const res = await authenticatedApiClient.deleteConnectionBulk(deletableConnections);
                        if (res.data) {
                            setConnections(prevConnections =>
                                prevConnections.filter(conn =>
                                    !deletableConnections.some(toDelete => toDelete.id === conn.id)
                                )
                            );
                        }
                    }
                }
            } catch (e) {
                console.error("Error syncing lab device connections:", e);
            } finally {
                isUpdatingConnectionsRef.current = false;
            }
        };

        syncLabDeviceConnections();
    }, [labDevices, authenticatedApiClient]);

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

    const handleDeviceChange = useCallback(async (connectionId: number, newDeviceName: string) => {
        const updatedConnections = connections.map(conn =>
            conn.id === connectionId ? { ...conn, interconnectDeviceName: newDeviceName, interconnectDevicePort: '' } : conn
        );
        const previousConnection = connections.find(conn => conn.id === connectionId);
        setConnections(updatedConnections);

        try {
            const updatedConnection = updatedConnections.find(conn => conn.id === connectionId);
            if (updatedConnection) {
                await authenticatedApiClient.updateConnection(connectionId, updatedConnection);
            }
        } catch (e) {
            console.error(e);
            setConnections(prevConnections => prevConnections.map(conn =>
                conn.id === connectionId ? previousConnection! : conn
            ));
        }
    }, [connections, authenticatedApiClient]);

    const handlePortChange = useCallback(async (connectionId: number, newPort: string) => {
        const updatedConnections = connections.map(conn =>
            conn.id === connectionId ? { ...conn, interconnectDevicePort: newPort } : conn
        );
        const previousConnection = connections.find(conn => conn.id === connectionId);
        setConnections(updatedConnections);

        try {
            const connectionToUpdate = updatedConnections.find(conn => conn.id === connectionId);
            if (connectionToUpdate) {
                await authenticatedApiClient.updateConnection(connectionId, connectionToUpdate);
            }
        } catch (e) {
            console.error(e);
            setConnections(prevConnections => prevConnections.map(conn =>
                conn.id === connectionId ? previousConnection! : conn
            ));
        }
    }, [connections, authenticatedApiClient]);

    const getFilteredPorts = useCallback((deviceName: string, selectedPort: string): string[] => {
        const allPorts = availablePortsMap[deviceName] || [];
        const usedPortsForDevice = deviceNameToUsedPortsMap[deviceName] || new Set();

        return allPorts.filter(port => port === selectedPort || !usedPortsForDevice.has(port));
    }, [availablePortsMap, deviceNameToUsedPortsMap]);

    const columns = useMemo(() => [
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
            cell: (row: Connection) => {
                return (
                    <select
                        value={row.interconnectDeviceName || ''}
                        onChange={(e) => handleDeviceChange(row.id, e.target.value)}
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
            cell: (row: Connection) => {
                const selectedDevice = row.interconnectDeviceName;
                const selectedPort = row.interconnectDevicePort;
                const availablePorts = getFilteredPorts(selectedDevice, selectedPort);

                if (!selectedDevice) {
                    return null;
                }

                return (
                    <select
                        value={row.interconnectDevicePort || ''}
                        onChange={(e) => handlePortChange(row.id, e.target.value)}
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
    ], [handleDeviceChange, handlePortChange, interconnectDevices, getFilteredPorts]);

    return (
        <section className="p-4">
            <DataTable
                columns={columns}
                data={connections}
                keyField="id"
                pagination
                paginationRowsPerPageOptions={[5, 10, 15]}
                customStyles={customStyles}
            />
        </section>
    );
}

export default ConnectionsTable;