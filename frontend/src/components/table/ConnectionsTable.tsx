import { useEffect, useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Connection, CreateConnectionRequestPayload } from '../../../../common/src/index';
import { useAuth } from '../../hooks/useAuth';
import { Device } from '../../models/Device';
import customStyles from './dataTableStyles';

interface ConnectionsTableProps {
    interconnectDevices: Device[];
    labDevices: Device[];
}

function ConnectionsTable({ interconnectDevices, labDevices }: ConnectionsTableProps) {
    const { authenticatedApiClient } = useAuth();
    const [connections, setConnections] = useState<Connection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [usedPorts, setUsedPorts] = useState<Record<string, Set<string>>>({});
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Utility function to generate ports from a port definition string
    const generatePorts = (portDefinition: string): string[] => {
        const [prefix, range] = portDefinition.split('|');
        if (!range) return [];
        const [start, end] = range.split('-').map(Number);
        if (isNaN(start) || isNaN(end)) return [];
        return Array.from({ length: end - start + 1 }, (_, i) => `${prefix}${start + i}`);
    };

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

    // Update usedPorts state when connections change
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

    // Initial fetch of connections
    useEffect(() => {
        const fetchConnections = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await authenticatedApiClient.getAllConnections();
                if (response.data) {
                    setConnections(response.data);
                }
            } catch (error) {
                setError('Failed to fetch connections. Please try again later.');
                console.error('Error fetching connections:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchConnections();
    }, [authenticatedApiClient]);

    // Handle new lab device connection creation
    useEffect(() => {
        const existingLabDeviceNames = new Set(connections.map(conn => conn.labDeviceName));
        const newLabDevices = labDevices.filter(device =>
            !existingLabDeviceNames.has(device.name) && device.ports
        );

        if (newLabDevices.length === 0) return;

        const createNewConnections = async () => {
            try {
                for (const device of newLabDevices) {
                    // Generate ports for the device
                    const portsArray = device.ports.split(',');
                    const generatedPorts = portsArray.flatMap(portDef => generatePorts(portDef));

                    // Create a connection for each port
                    const connectionPromises = generatedPorts.map(port => {
                        const connection: Connection = {
                            labDeviceName: device.name,
                            labDevicePort: port,
                            interconnectDeviceName: '',
                            interconnectDevicePort: '',
                        };
                        return saveConnection(connection);
                    });

                    await Promise.all(connectionPromises);
                }
            } catch (error) {
                console.error('Error creating connections for new devices:', error);
                setError('Failed to create connections for new devices.');
            }
        };

        createNewConnections();
    }, [labDevices]);

    // Handle deletion of connections when a lab device is deleted
    useEffect(() => {
        const existingLabDeviceNames = new Set(labDevices.map(device => device.name));
        const connectionsToDelete = connections.filter(conn => !existingLabDeviceNames.has(conn.labDeviceName));

        if (connectionsToDelete.length === 0) return;

        const deleteConnections = async () => {
            try {
                for (const connection of connectionsToDelete) {
                    await authenticatedApiClient.deleteConnection(connection.id!);
                }
                setConnections(prev => prev.filter(conn => existingLabDeviceNames.has(conn.labDeviceName)));
            } catch (error) {
                console.error('Error deleting connections for removed lab devices:', error);
                setError('Failed to delete connections for removed lab devices.');
            }
        };

        deleteConnections();
    }, [labDevices]);

    // Handle deletion of interconnect information for connections with deleted interconnect port or device
    useEffect(() => {
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
    }, [interconnectDevices, availablePortsMap]);

    const saveConnection = async (connection: Connection) => {
        try {
            const payload: CreateConnectionRequestPayload = {
                labDeviceName: connection.labDeviceName,
                labDevicePort: connection.labDevicePort,
                interconnectDeviceName: connection.interconnectDeviceName,
                interconnectDevicePort: connection.interconnectDevicePort,
            };
            const response = await authenticatedApiClient.createOrUpdateConnection({
                ...payload,
                id: connection.id,
            });
            setConnections(prev => {
                const updated = [...prev];
                const index = updated.findIndex(c =>
                    c.labDeviceName === connection.labDeviceName &&
                    c.labDevicePort === connection.labDevicePort
                );
                if (index !== -1) {
                    updated[index] = { ...updated[index], id: response?.data?.id };
                } else {
                    updated.push({ ...connection, id: response?.data?.id });
                }
                return updated;
            });
            return response.data;
        } catch (error) {
            console.error('Error saving connection:', error);
            throw error;
        }
    };

    const handleDeviceChange = async (index: number, newDeviceName: string) => {
        const connection = connections[index];
        if (!connection) return;

        const updatedConnection = {
            ...connection,
            interconnectDeviceName: newDeviceName,
            interconnectDevicePort: '', // Reset port when device changes
        };

        try {
            await authenticatedApiClient.updateConnection(connection.id!, updatedConnection);
            setConnections(prev => prev.map((conn, i) => i === index ? updatedConnection : conn));
        } catch (error) {
            console.error('Error updating connection:', error);
        }
    };

    const handlePortChange = async (index: number, newPort: string) => {
        const connection = connections[index];
        if (!connection) return;

        const updatedConnection = {
            ...connection,
            interconnectDevicePort: newPort,
        };

        try {
            await authenticatedApiClient.updateConnection(connection.id!, updatedConnection);
            setConnections(prev => prev.map((conn, i) => i === index ? updatedConnection : conn));
        } catch (error) {
            console.error('Error updating connection:', error);
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

    if (isLoading) {
        return (
            <section className="p-4">
                <div className="text-center font-semibold text-gray-500">Loading connections...</div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="p-4">
                <div className="text-center font-semibold text-red-500">{error}</div>
            </section>
        );
    }

    return (
        <section className="p-4">
            {connections.length > 0 ? (
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
            ) : (
                <div className="text-center font-semibold text-gray-500">
                    Please add at least one interconnect device and one lab device to your inventory and configure their ports to view connections.
                </div>
            )}
        </section>
    );
}

export default ConnectionsTable;