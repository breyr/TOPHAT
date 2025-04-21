import { Edge, Node, useReactFlow } from "@xyflow/react";
import { LinkRequest } from "common";
import { Option } from "../components/MultiSelect";
import { substringFromFirstNumber } from "../lib/helpers";
import { Connection } from "../models/Connection";
import { Device } from "../models/Device";
import { useAuth } from "./useAuth";
import { useToast } from "./useToast";

interface LinkOperationParams {
    firstDeviceName: string;
    firstDevicePort: string;
    secondDeviceName: string;
    secondDevicePort: string;
}

// Create a base hook with API operations that don't depend on ReactFlow
export function useLinkOperationsBase() {
    const { authenticatedApiClient } = useAuth();
    const { addToast, updateToast } = useToast();

    // get connection information for a specific device and port
    const fetchConnectionDetails = async (deviceName: string, devicePort: string) => {
        const conns = await authenticatedApiClient.getConnectionsByDeviceName(deviceName);
        return conns.data?.find(c => c.labDevicePort === devicePort);
    };

    // get interconnect information
    const fetchInterconnectDevice = async (connectionInfo: Connection) => {
        if (!connectionInfo?.interconnectDeviceName) {
            return null;
        }

        const interconnectDevices = await authenticatedApiClient.getDevicesByType('INTERCONNECT');
        // only two devices here so find is okay
        return interconnectDevices.data?.find(d => d.name === connectionInfo.interconnectDeviceName);
    };

    const validateInterconnectDevice = (interconnectInfo: any, toastId?: string): boolean => {
        if (!interconnectInfo) {
            if (toastId) updateToast(toastId, 'error', 'Link Operation', 'Interconnect information not found. Please message an Administrator.');
            return false;
        }

        if (interconnectInfo.deviceNumber == null ||
            interconnectInfo.username == null ||
            interconnectInfo.password == null ||
            interconnectInfo.secretPassword == null) {
            if (toastId) updateToast(toastId, 'error', 'Link Operation', 'Interconnect is not configured properly. Please message an Administrator.');
            return false;
        }

        if (interconnectInfo.ipAddress === 'none' || !interconnectInfo.ipAddress) {
            if (toastId) updateToast(toastId, 'error', 'Link Operation', 'Interconnect is not configured properly. Please message an Administrator.');
            return false;
        }

        return true;
    };

    const removePortNumber = (port?: string) => port?.split('|')[0];

    const calculateOffsetPort = (port: string, deviceNumber: number) => {
        // splits off interface number and calculates offset
        let devicePort = Number(port.split('/').pop())
        if (deviceNumber === 2) {
            devicePort += 44 // For IDs being fed to the VLAN mapping algorithm.
        }
        return devicePort;
    };

    const checkDevicesExist = async (firstDeviceName: string, secondDeviceName: string): Promise<boolean> => {
        try {
            const devices = await authenticatedApiClient.getAllDevices();
            const firstDeviceMatches = devices.data?.filter(d => d.name === firstDeviceName) || [];
            const secondDeviceMatches = devices.data?.filter(d => d.name === secondDeviceName) || [];

            // Return true if one or both devices don't exist
            return firstDeviceMatches.length === 0 || secondDeviceMatches.length === 0;
        } catch (error) {
            // In case of API error, assume devices don't exist for safety
            console.error("Error checking device existence:", error);
            return true;
        }
    };

    // API operations without ReactFlow dependencies
    const performLinkOperation = async (params: LinkOperationParams, operation: 'create' | 'delete', createToastPerLink: boolean = true) => {
        const { firstDeviceName, firstDevicePort, secondDeviceName, secondDevicePort } = params;
        let toastId: string | undefined = undefined;
        if (createToastPerLink) toastId = Date.now().toString();

        const operationTitle = operation === 'create' ? 'Creating Link' : 'Deleting Link';

        try {
            if (createToastPerLink) addToast({
                id: toastId!,
                title: operationTitle,
                body: `${operation === 'create' ? 'Connecting' : 'Disconnecting'} ${firstDeviceName}[${substringFromFirstNumber(firstDevicePort)}] <> ${secondDeviceName}[${substringFromFirstNumber(secondDevicePort)}]`,
                status: 'pending'
            });

            // Fetch and validate connection info
            const firstConnectionInfo = await fetchConnectionDetails(firstDeviceName, firstDevicePort);
            const secondConnectionInfo = await fetchConnectionDetails(secondDeviceName, secondDevicePort);

            if (!firstConnectionInfo || !secondConnectionInfo) {
                if (createToastPerLink) updateToast(toastId!, 'error', operationTitle, 'Connection information not found.');
                return false;
            }

            // Fetch and validate interconnect devices
            const firstInterconnectInfo = await fetchInterconnectDevice(firstConnectionInfo);
            const secondInterconnectInfo = await fetchInterconnectDevice(secondConnectionInfo);

            if (!validateInterconnectDevice(firstInterconnectInfo, toastId) ||
                !validateInterconnectDevice(secondInterconnectInfo, toastId)) {
                return false;
            }

            // Check to see if the devices exist, if one or both don't anymore
            // just show the Toast as a success and do not perform the interconnect configs
            const devicesNotFound = await checkDevicesExist(firstDeviceName, secondDeviceName);
            if (devicesNotFound) {
                return true; // return true to indicate success
            }

            // Prepare link payload
            // Get the correct interconnect information based on the device number for the interconnect
            const [interconnect1, interconnect2] = firstInterconnectInfo?.deviceNumber === 1
                ? [firstInterconnectInfo, secondInterconnectInfo]
                : [secondInterconnectInfo, firstInterconnectInfo];

            const interconnect1Prefix = removePortNumber(interconnect1?.ports);
            const interconnect2Prefix = removePortNumber(interconnect2?.ports);

            // if ports is undefined
            if (!interconnect1Prefix || !interconnect2Prefix) {
                return false;
            }

            const [offsetPort1, offsetPort2] = firstInterconnectInfo?.deviceNumber === 1
                ?
                [
                    calculateOffsetPort(firstConnectionInfo.interconnectDevicePort, firstInterconnectInfo!.deviceNumber!),
                    calculateOffsetPort(secondConnectionInfo.interconnectDevicePort, secondInterconnectInfo!.deviceNumber!)
                ]
                :
                [
                    calculateOffsetPort(secondConnectionInfo.interconnectDevicePort, secondInterconnectInfo!.deviceNumber!),
                    calculateOffsetPort(firstConnectionInfo.interconnectDevicePort, firstInterconnectInfo!.deviceNumber!)
                ]

            const linkPayload: LinkRequest = {
                interconnect1IP: interconnect1!.ipAddress,
                interconnect1Prefix,
                interconnect2IP: interconnect2!.ipAddress,
                interconnect2Prefix,
                interconnectPortID1: offsetPort1,
                interconnectPortID2: offsetPort2,
                username: interconnect1!.username!,
                password: interconnect1!.password!,
                secret: interconnect1!.secretPassword!
            };

            // Perform the requested operation
            const res = operation === 'create'
                ? await authenticatedApiClient.createLink(linkPayload)
                : await authenticatedApiClient.clearLink(linkPayload);

            if ((res as any).status === 'success') {
                if (createToastPerLink) updateToast(toastId!, 'success', `Successfully ${operation === 'create' ? 'Created' : 'Deleted'} Link`);
                return true;
            } else {
                if (createToastPerLink) updateToast(toastId!, 'error', `Failed to ${operation === 'create' ? 'Create' : 'Delete'} Link`);
                return false;
            }
        } catch {
            if (createToastPerLink) updateToast(toastId!, 'error', operationTitle, 'Could not establish connection to devices.');
            return false;
        }
    };

    // Public API for non-ReactFlow components
    const createLink = async (params: LinkOperationParams, createToastPerLink: boolean = true) => {
        return performLinkOperation(params, 'create', createToastPerLink);
    };

    const deleteLink = async (params: LinkOperationParams, createToastPerLink: boolean = true) => {
        return performLinkOperation(params, 'delete', createToastPerLink);
    };

    const createLinkBulk = async (selectedConnections: Set<Option>): Promise<{ numFailed: number, numSucceed: number }> => {
        let successCount = 0;
        const numSelectedConnections = selectedConnections.size;

        const toastId = Date.now().toString();

        addToast({
            id: toastId,
            title: 'Reinitializing Link(s)',
            body: `Creating ${numSelectedConnections} link${numSelectedConnections > 1 ? 's' : ''} for preexisting node connections.`,
            status: 'pending'
        });

        const createPromises = Array.from(selectedConnections).map(async (sc) => {
            const linkOptionParams = {
                firstDeviceName: sc.firstLabDevice,
                firstDevicePort: sc.firstLabDevicePort,
                secondDeviceName: sc.secondLabDevice,
                secondDevicePort: sc.secondLabDevicePort
            };

            const result = await createLink(linkOptionParams, false);

            return {
                connection: sc,
                success: result
            };
        });

        const results = await Promise.all(createPromises);
        successCount = results.filter(r => r.success).length;

        if (successCount === numSelectedConnections) {
            updateToast(toastId, 'success', 'Reinitializing Link(s)',
                `${numSelectedConnections} link${numSelectedConnections > 1 || numSelectedConnections == 0 ? 's were' : ' was'} successfully reinitialized.`);
        } else {
            updateToast(toastId, 'error', 'Reinitializing Link(s)',
                `${successCount} of ${numSelectedConnections} link${numSelectedConnections > 1 || numSelectedConnections == 0 ? 's were' : ' was'} successfully reinitialized.`);
        }

        return {
            numFailed: results.length - successCount,
            numSucceed: successCount
        };
    };

    const deleteLinkBulk = async (selectedConnections: Set<Option>): Promise<number> => {
        let successCount = 0;
        const numSelectedConnections = selectedConnections.size;
        const toastId = Date.now().toString();

        addToast({
            id: toastId,
            title: 'Clearing Link(s)',
            body: `Clearing ${numSelectedConnections} link${numSelectedConnections > 1 ? 's' : ''}`,
            status: 'pending'
        });

        const deletePromises = Array.from(selectedConnections).map(async (sc) => {
            const result = await deleteLink({
                firstDeviceName: sc.firstLabDevice,
                firstDevicePort: sc.firstLabDevicePort,
                secondDeviceName: sc.secondLabDevice,
                secondDevicePort: sc.secondLabDevicePort
            }, false);

            return {
                connection: sc,
                success: result
            };
        });

        const results = await Promise.all(deletePromises);
        successCount = results.filter(r => r.success).length;

        if (successCount === numSelectedConnections) {
            updateToast(toastId, 'success', 'Cleared Link(s)',
                `${numSelectedConnections} link${numSelectedConnections > 1 || numSelectedConnections == 0 ? 's were' : ' was'} successfully cleared`);
        } else {
            updateToast(toastId, 'error', 'Cleared Link(s)',
                `${successCount} of ${numSelectedConnections} link${numSelectedConnections > 1 || numSelectedConnections == 0 ? 's were' : ' was'} successfully cleared`);
        }

        const failedConnections = results.filter(r => !r.success).map(r => r.connection);

        if (failedConnections.length > 0) {
            console.error(`Failed to clear ${failedConnections.length} links:`, failedConnections);
        }

        return failedConnections.length;
    };

    return {
        createLink,
        deleteLink,
        createLinkBulk,
        deleteLinkBulk
    };
}

// Enhanced hook that includes ReactFlow functionality (must be used within ReactFlowProvider)
export function useLinkOperations() {
    const baseOperations = useLinkOperationsBase();
    const { getNodes, setEdges } = useReactFlow<Node<{ deviceData?: Device; }>, Edge>();
    const { addToast, updateToast } = useToast();

    const createEdge = (params: LinkOperationParams) => {
        const { firstDeviceName, firstDevicePort, secondDeviceName, secondDevicePort } = params;
        const nodes = getNodes();
        const sourceNode = nodes.find(node => (node.data.deviceData?.name === firstDeviceName));
        const targetNode = nodes.find(node => (node.data.deviceData?.name === secondDeviceName));

        if (sourceNode && targetNode) {
            const newEdge: Edge = {
                id: `edge-${firstDeviceName}-${firstDevicePort}-${secondDeviceName}-${secondDevicePort}`,
                source: sourceNode.id,
                target: targetNode.id,
                sourceHandle: `source`,
                targetHandle: `target`,
                type: "Custom",
                data: {
                    sourcePort: firstDevicePort,
                    targetPort: secondDevicePort,
                    status: 'pending',
                }
            };

            setEdges((oldEdges) => oldEdges.concat(newEdge));
            return true;
        }

        return false;
    };

    const updateEdgeStatus = (edgeId: string, status: string) => {
        setEdges((edges) =>
            edges.map((edge: Edge) =>
                edge.id === edgeId ? { ...edge, data: { ...edge.data, status } } : edge
            )
        );
    };

    const deleteEdge = (edgeId: string) => {
        setEdges((edges) =>
            edges.filter((edge: Edge) => edge.id !== edgeId)
        );
    };

    // Override the base methods to include ReactFlow operations
    const createLink = async (params: LinkOperationParams, createToastPerLink: boolean = true) => {
        console.log(params);
        const edgeId = `edge-${params.firstDeviceName}-${params.firstDevicePort}-${params.secondDeviceName}-${params.secondDevicePort}`;
        createEdge(params);
        const result = await baseOperations.createLink(params, createToastPerLink);
        // Update edge status or remove edge based on the result
        if (result) {
            updateEdgeStatus(edgeId, 'success');
        } else {
            deleteEdge(edgeId);
        }
        return result;
    };

    const createLinkBulk = async (selectedConnections: Set<Option>): Promise<{ numFailed: number, numSucceed: number }> => {
        const createPromises = Array.from(selectedConnections).map(async (sc) => {
            const linkOptionParams = {
                firstDeviceName: sc.firstLabDevice,
                firstDevicePort: sc.firstLabDevicePort,
                secondDeviceName: sc.secondLabDevice,
                secondDevicePort: sc.secondLabDevicePort
            };

            const result = await baseOperations.createLink(linkOptionParams, false);

            const edgeId = `edge-${sc.firstLabDevice}-${sc.firstLabDevicePort}-${sc.secondLabDevice}-${sc.secondLabDevicePort}`;
            createEdge(linkOptionParams);

            // Update edge status or remove edge based on the result
            if (result) {
                updateEdgeStatus(edgeId, 'success');
            } else {
                deleteEdge(edgeId);
            }

            return {
                connection: sc,
                success: result
            };
        });

        const results = await Promise.all(createPromises);
        const successCount = results.filter(r => r.success).length;

        return {
            numFailed: results.length - successCount,
            numSucceed: successCount
        };
    };

    const deleteLinkBulk = async (selectedConnections: Set<Option>): Promise<number> => {
        const numSelectedConnections = selectedConnections.size;
        const toastId = Date.now().toString();

        addToast({
            id: toastId,
            title: 'Clearing Link(s)',
            body: `Attempting to clear ${numSelectedConnections} link${numSelectedConnections > 1 ? 's' : ''}`,
            status: 'pending'
        });

        const deletePromises = Array.from(selectedConnections).map(async (sc) => {

            const params = {
                firstDeviceName: sc.firstLabDevice,
                firstDevicePort: sc.firstLabDevicePort,
                secondDeviceName: sc.secondLabDevice,
                secondDevicePort: sc.secondLabDevicePort
            };

            // update edge to make it dashed
            updateEdgeStatus(sc.value, 'deleting'); // sc.value is the edge's unique id

            const result = await baseOperations.deleteLink(params, false);

            // Update edge status or remove edge based on the result
            if (result) {
                deleteEdge(sc.value); // sc.value is the edge's unique id
            } else {
                updateEdgeStatus(sc.value, 'failed'); // sc.value is the edge's unique id
            }

            return {
                connection: sc,
                success: result
            };
        });

        const results = await Promise.all(deletePromises);
        const successCount = results.filter(r => r.success).length;

        if (successCount === numSelectedConnections) {
            updateToast(toastId, 'success', 'Cleared Link(s)', `${numSelectedConnections} link${numSelectedConnections > 1 ? 's were' : ' was'} successfully cleared`);
        } else {
            updateToast(toastId, 'error', 'Cleared Link(s)', `${successCount} of ${numSelectedConnections} link${numSelectedConnections > 1 ? 's were' : ' was'} successfully cleared`);
        }

        return results.length - successCount;
    };

    return {
        ...baseOperations,
        createLink,
        createLinkBulk,
        deleteLinkBulk,
        createEdge,
        deleteEdge
    };
}