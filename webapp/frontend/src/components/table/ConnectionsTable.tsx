import { useEffect, useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Connection, CreateConnectionRequestPayload } from '../../../../common/shared-types';
import { useAuth } from '../../hooks/useAuth';
import { useOnboardingStore } from '../../stores/onboarding';
import customStyles from './dataTableStyles';

function ConnectionsTable() {
    const { labDevices, interconnectDevices } = useOnboardingStore(
        (state) => state,
    );
    const { authenticatedApiClient } = useAuth();
    const [connections, setConnections] = useState<Connection[]>([]);
    const [usedPorts, setUsedPorts] = useState<Record<string, Set<string>>>({});
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // utility function to generate ports from a port definition string
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
                    labDeviceName: device.deviceName,
                    labDevicePort: port,
                    interconnectDeviceName: '',
                    interconnectDevicePort: '', // Initially empty
                }))
            )
        );
        setConnections(newConnections);
    }, [labDevices]);

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

    // handle cleanup of connections when a device is deleted
    useEffect(() => {
        const labDeviceNames = new Set(labDevices.map((d) => d.deviceName));
        const interconnectDeviceNames = new Set(interconnectDevices.map((d) => d.deviceName));

        setConnections((prevConnections) =>
            prevConnections.filter(
                (connection) =>
                    labDeviceNames.has(connection.labDeviceName) &&
                    (!connection.interconnectDeviceName || interconnectDeviceNames.has(connection.interconnectDeviceName))
            )
        );
    }, [labDevices, interconnectDevices]);

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
            setConnections((prev) => {
                const updated = [...prev];
                const index = updated.findIndex((c) => c.labDeviceName === connection.labDeviceName && c.labDevicePort === connection.labDevicePort);
                if (index !== -1) {
                    updated[index] = { ...updated[index], id: response?.data?.id };
                }
                return updated;
            });
        } catch (error) {
            console.error('Error saving connection:', error);
        }
    };

    const handleDeviceChange = (index: number, newDeviceName: string) => {
        setConnections((prev) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                interconnectDeviceName: newDeviceName,
                interconnectDevicePort: '', // reset port because the selected interconnect device changed
            };
            saveConnection(updated[index]);
            return updated;
        });
    };

    const handlePortChange = (index: number, newPort: string) => {
        setConnections((prev) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                interconnectDevicePort: newPort, // changing the port for a selected connection
            };
            saveConnection(updated[index]);
            return updated;
        });
    };

    const getFilteredPorts = (deviceName: string, selectedPort: string): string[] => {
        const allPorts = availablePortsMap[deviceName] || [];
        const usedPortsForDevice = usedPorts[deviceName] || new Set();

        return allPorts.filter((port) => port === selectedPort || !usedPortsForDevice.has(port));
    }

    const columns = [
        { name: 'Lab Device', selector: (row: Connection) => row.labDeviceName },
        { name: 'Lab Port', selector: (row: Connection) => row.labDevicePort },
        {
            name: 'Interconnect Device',
            cell: (_, localIndex: number) => {
                const globalIndex = currentPage * rowsPerPage + localIndex;

                return (
                    <select
                        value={connections[globalIndex].interconnectDeviceName || ''}
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
                const selectedDevice = connections[globalIndex].interconnectDeviceName;
                const selectedPort = connections[globalIndex].interconnectDevicePort;
                const availablePorts = getFilteredPorts(selectedDevice, selectedPort);

                if (!selectedDevice) {
                    return <span className="text-gray-400">Select an interconnect device</span>
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