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
    }

    // get interconnect information
    const fetchInterconnectDevice = async (connectionInfo: Connection) => {
        if (!connectionInfo?.interconnectDeviceName) {
            return null;
        }

        const interconnectDevices = await authenticatedApiClient.getDevicesByType('INTERCONNECT');
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

    const removePortNumber = (port: string) => port.replace(/\/\d+$/, '/');

    const calculateOffsetPort = (port: string, deviceNumber: number) => {
        // splits off interface number and calculates offset
        return Number(port.split('/').pop()) * deviceNumber;
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

            // Prepare link payload
            const interconnect1Prefix = removePortNumber(firstConnectionInfo.interconnectDevicePort);
            const interconnect2Prefix = removePortNumber(secondConnectionInfo.interconnectDevicePort);

            const offsetPort1 = calculateOffsetPort(
                firstConnectionInfo.interconnectDevicePort,
                firstInterconnectInfo!.deviceNumber!
            );

            const offsetPort2 = calculateOffsetPort(
                secondConnectionInfo.interconnectDevicePort,
                secondInterconnectInfo!.deviceNumber!
            );

            const linkPayload: LinkRequest = {
                interconnect1IP: firstInterconnectInfo!.ipAddress,
                interconnect1Prefix,
                interconnect2IP: secondInterconnectInfo!.ipAddress,
                interconnect2Prefix,
                interconnectPortID1: offsetPort1,
                interconnectPortID2: offsetPort2,
                username: firstInterconnectInfo!.username!,
                password: firstInterconnectInfo!.password!,
                secret: firstInterconnectInfo!.secretPassword!
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
                id: `edge-${firstDevicePort}-${secondDevicePort}`,
                source: sourceNode.id,
                target: targetNode.id,
                sourceHandle: `source`,
                targetHandle: `target`,
                type: "Custom",
                data: {
                    sourcePort: firstDevicePort,
                    targetPort: secondDevicePort,
                }
            };

            setEdges((oldEdges) => oldEdges.concat(newEdge));
            return true;
        }

        return false;
    };

    const deleteEdge = (edgeId: string) => {
        setEdges((edges) =>
            edges.filter((edge: Edge) => edge.id !== edgeId)
        );
    };

    // Override the base methods to include ReactFlow operations
    const createLink = async (params: LinkOperationParams, createToastPerLink: boolean = true) => {
        const result = await baseOperations.createLink(params, createToastPerLink);
        if (result) {
            createEdge(params);
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

            if (result) {
                createEdge(linkOptionParams);
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

            const result = await baseOperations.deleteLink(params, false);

            if (result) {
                deleteEdge(sc.value); // sc.value is the edge's unique id
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