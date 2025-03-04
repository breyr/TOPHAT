import { Edge, Node, useReactFlow } from "@xyflow/react";
import { LinkRequest } from "common";
import { Option } from "../components/MultiSelect";
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

export function useLinkOperations() {
    const { authenticatedApiClient } = useAuth();
    const { addToast, updateToast } = useToast();
    const { getNodes, setEdges } = useReactFlow<Node<{ deviceData?: Device; }>, Edge>();

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

    const createLink = async (params: LinkOperationParams, createToastPerLink: boolean = true) => {
        const { firstDeviceName, firstDevicePort, secondDeviceName, secondDevicePort } = params;
        let toastId: string | undefined = undefined;
        if (createToastPerLink) toastId = Date.now().toString();

        try {
            if (createToastPerLink) addToast({
                id: toastId!,
                title: 'Creating Link',
                body: `Connecting ${firstDeviceName} on port ${firstDevicePort} to ${secondDeviceName} on port ${secondDevicePort}`,
                status: 'pending'
            });

            // Fetch and validate connection info
            const firstConnectionInfo = await fetchConnectionDetails(firstDeviceName, firstDevicePort);
            const secondConnectionInfo = await fetchConnectionDetails(secondDeviceName, secondDevicePort);

            if (!firstConnectionInfo || !secondConnectionInfo) {
                if (createToastPerLink) updateToast(toastId!, 'error', 'Creating Link', 'Connection information not found.');
                return false;
            }

            // Fetch and validate interconnect devices
            const firstInterconnectInfo = await fetchInterconnectDevice(firstConnectionInfo);
            const secondInterconnectInfo = await fetchInterconnectDevice(secondConnectionInfo);

            if (!validateInterconnectDevice(firstInterconnectInfo, toastId) ||
                !validateInterconnectDevice(secondInterconnectInfo, toastId)) {
                return false;
            }

            // Prepare link creation payload
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

            const createLinkPayload: LinkRequest = {
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

            const res = await authenticatedApiClient.createLink(createLinkPayload);

            if ((res as any).status === 'success') {
                createEdge(params);
                if (createToastPerLink) updateToast(toastId!, 'success', 'Successfully Created Link');
                return true;
            } else {
                if (createToastPerLink) updateToast(toastId!, 'error', 'Failed to Create Link');
                return false;
            }
        } catch {
            if (createToastPerLink) updateToast(toastId!, 'error', 'Creating Link', 'Could not establish connection to devices.');
            return false;
        }
    };

    const createLinkBulk = async (selectedConnections: Set<Option>): Promise<{ numFailed: number, numSucceed: number }> => {
        // to keep track of how many completed
        let successCount = 0;

        const createPromises = Array.from(selectedConnections).map(async (sc) => {
            // for each selected connection we need to make a delete link request
            const linkOptionParams = {
                firstDeviceName: sc.firstLabDevice,
                firstDevicePort: sc.firstLabDevicePort,
                secondDeviceName: sc.secondLabDevice,
                secondDevicePort: sc.secondLabDevicePort
            }

            const result = await createLink(linkOptionParams);

            if (result) {
                createEdge(linkOptionParams);
            }

            return {
                connection: sc,
                success: result // whether link was cleared or not
            }
        });

        const results = await Promise.all(createPromises);

        successCount = results.filter(r => r.success).length;

        const failedConnections = results
            .filter(r => !r.success)
            .map(r => r.connection);

        return { numFailed: failedConnections.length, numSucceed: successCount };
    }

    const deleteLink = async (params: LinkOperationParams) => {
        const { firstDeviceName, firstDevicePort, secondDeviceName, secondDevicePort } = params;

        try {
            // Similar logic to createLink to fetch connection details
            const firstConnectionInfo = await fetchConnectionDetails(firstDeviceName, firstDevicePort);
            const secondConnectionInfo = await fetchConnectionDetails(secondDeviceName, secondDevicePort);

            if (!firstConnectionInfo || !secondConnectionInfo) {
                return false;
            }

            const firstInterconnectInfo = await fetchInterconnectDevice(firstConnectionInfo);
            const secondInterconnectInfo = await fetchInterconnectDevice(secondConnectionInfo);

            if (!validateInterconnectDevice(firstInterconnectInfo) ||
                !validateInterconnectDevice(secondInterconnectInfo)) {
                return false;
            }

            // Prepare link deletion payload
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

            const deleteLinkPayload: LinkRequest = {
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

            const res = await authenticatedApiClient.clearLink(deleteLinkPayload);

            if ((res as any).status === 'success') {
                return true;
            } else {
                return false;
            }
        } catch {
            return false;
        }
    };

    const deleteLinkBulk = async (selectedConnections: Set<Option>): Promise<number> => {
        // to keep track of how many completed
        let successCount = 0;
        const numSelectedConnections = selectedConnections.size;
        // show toast for progress of clearing links
        const toastId = Date.now().toString();
        addToast(
            {
                id: toastId,
                title: 'Deleting Link',
                body: `Clearing ${numSelectedConnections} link${numSelectedConnections > 1 ? 's' : ''}`,
                status: 'pending'
            }
        );

        const deletePromises = Array.from(selectedConnections).map(async (sc) => {
            // for each selected connection we need to make a delete link request
            const result = await deleteLink({
                firstDeviceName: sc.firstLabDevice,
                firstDevicePort: sc.firstLabDevicePort,
                secondDeviceName: sc.secondLabDevice,
                secondDevicePort: sc.secondLabDevicePort
            });

            if (result) {
                deleteEdge(sc.value); // sc.value is the edge's unique id
            }

            return {
                connection: sc,
                success: result // whether link was cleared or not
            }
        });

        const results = await Promise.all(deletePromises);

        successCount = results.filter(r => r.success).length;

        if (successCount === numSelectedConnections) {
            updateToast(toastId, 'success', 'Successfully Cleared Links',
                `All ${numSelectedConnections} link${numSelectedConnections > 1 ? 's were' : ' was'} successfully cleared`);
        } else {
            updateToast(toastId, 'error', 'Partially Cleared Links',
                `${successCount} of ${numSelectedConnections} link${numSelectedConnections > 1 ? 's were' : ' was'} successfully cleared`);
        }

        const failedConnections = results
            .filter(r => !r.success)
            .map(r => r.connection);

        if (failedConnections.length > 0) {
            console.error(`Failed to clear ${failedConnections.length} links:`, failedConnections);
        }

        return failedConnections.length;
    }

    return {
        createLink,
        createLinkBulk,
        deleteLinkBulk,
    };
}