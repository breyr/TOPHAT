import { Node } from "@xyflow/react";
import type { Topology } from "common";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import CreateTopology from "../components/CreateTopology";
import TopologyCard from "../components/TopologyCard";
import { useAuth } from "../hooks/useAuth";
import { useLinkOperationsBase } from "../hooks/useLinkOperations";
import { Device } from "../models/Device";

export default function UserTopologiesPage() {
    const { token, authenticatedApiClient } = useAuth();
    const { deleteLinkBulk } = useLinkOperationsBase();
    const [topologies, setTopologies] = useState([] as Topology[]);
    const [isLoading, setIsLoading] = useState(true);

    // get user's topologies on page load by making authenticated request
    useEffect(() => {
        (async () => {
            if (!token) return;

            try {
                setIsLoading(true);
                const response = await authenticatedApiClient.getAllTopologies();
                setTopologies(response.data?.filter(topology => !topology.archived) ?? []);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [token, authenticatedApiClient]);

    const unbookDevicesInTopology = async (topologyData: Topology) => {
        try {
            // check if nodes exist
            const nodes = topologyData.reactFlowState?.nodes as Node<{ deviceData?: Device }>[] | undefined;

            if (nodes && nodes.length > 0) {
                // extract device IDs from all nodes in the topology
                const devicePromises = nodes
                    .filter(node => node.data?.deviceData?.id)
                    .map(node => {
                        // send request to unbook each device
                        if (node.data.deviceData)
                            return authenticatedApiClient.unbookDevice(node.data.deviceData.id);
                    });

                // if there are devices to unbook, wait for all requests to complete
                if (devicePromises.length > 0) {
                    await Promise.all(devicePromises);
                }
            }
        } catch (error) {
            console.error('Error unbooking devices:', error);
        }
    };

    const handleDelete = async (topologyId: number) => {
        if (!token) return;

        try {
            // First, get the topology data to unbook devices
            const getResponse = await authenticatedApiClient.getTopology(topologyId);
            const topology = getResponse.data;

            if (topology) {
                const deletedTopology = topologies.find((t) => t.id === topologyId);
                const deletedTopologyIndex = topologies.findIndex((t) => t.id === topologyId);

                // Update UI - remove the topology immediately
                setTopologies((prevTopologies) =>
                    prevTopologies.filter(t => t.id !== deletedTopology?.id)
                );

                // Unbook devices first
                await unbookDevicesInTopology(topology);

                // Get a list of Options to pass into the clearLinkBulk function
                const edgesForTopology = topology.reactFlowState?.edges.map(e => ({
                    value: e.id,
                    label: `(${e.source}) ${e.data?.sourcePort ?? ''} -> (${e.target}) ${e.data?.targetPort ?? ''}`,
                    firstLabDevice: e.source,
                    firstLabDevicePort: e.data?.sourcePort ?? '',
                    secondLabDevice: e.target,
                    secondLabDevicePort: e.data?.targetPort ?? '',
                }));

                // Clear Links
                const numFailures = await deleteLinkBulk(new Set(edgesForTopology));

                if (numFailures === 0) {
                    // then delete the topology
                    await authenticatedApiClient.deleteTopology(topologyId);
                } else {
                    // add topology back
                    setTopologies((prevTopologies) => {
                        const newTopologies = [...prevTopologies];

                        // if we have a valid index and a deleted topology
                        if (deletedTopologyIndex >= 0 && deletedTopology) {
                            // insert back at original position
                            newTopologies.splice(deletedTopologyIndex, 0, deletedTopology);
                        } else if (deletedTopology) {
                            newTopologies.push(deletedTopology);
                        }

                        return newTopologies;
                    });
                }
            }
        } catch (error) {
            console.error('Error deleting topology:', error);
        }
    };

    const handleArchive = async (topologyId: number) => {
        if (!token) return;

        try {
            // First, get the topology data to unbook devices
            const getResponse = await authenticatedApiClient.getTopology(topologyId);
            const topology = getResponse.data;

            if (topology) {
                const archivedTopology = topologies.find((t) => t.id === topologyId);
                const archivedTopologyIndex = topologies.findIndex((t) => t.id === topologyId);

                // Update UI - remove the topology immediately
                setTopologies((prevTopologies) =>
                    prevTopologies.filter(t => t.id !== archivedTopology?.id)
                );


                // Unbook devices first
                await unbookDevicesInTopology(topology);

                // Get a list of Options to pass into the clearLinkBulk function
                const edgesForTopology = topology.reactFlowState?.edges.map(e => ({
                    value: e.id,
                    label: `(${e.source}) ${e.data?.sourcePort ?? ''} -> (${e.target}) ${e.data?.targetPort ?? ''}`,
                    firstLabDevice: e.source,
                    firstLabDevicePort: e.data?.sourcePort ?? '',
                    secondLabDevice: e.target,
                    secondLabDevicePort: e.data?.targetPort ?? '',
                }));

                // Clear Links
                const numFailures = await deleteLinkBulk(new Set(edgesForTopology));

                if (numFailures === 0) {
                    // Then archive the topology
                    await authenticatedApiClient.updateTopology(topologyId, {
                        archived: true
                    });
                } else {
                    // add topology back
                    setTopologies((prevTopologies) => {
                        const newTopologies = [...prevTopologies];

                        // if we have a valid index and a deleted topology
                        if (archivedTopologyIndex >= 0 && archivedTopology) {
                            // insert back at original position
                            newTopologies.splice(archivedTopologyIndex, 0, archivedTopology);
                        } else if (archivedTopology) {
                            newTopologies.push(archivedTopology);
                        }

                        return newTopologies;
                    });
                }

            }
        } catch (error) {
            console.error('Error archiving topology:', error);
        }
    };

    return (
        <section className="pt-4 flex flex-row flex-wrap gap-x-8">
            <CreateTopology />
            {isLoading ? (
                <div className="flex items-center justify-center min-h-[200px]">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
            ) : (
                topologies.length !== 0 && (
                    topologies.map((topology) => (
                        <TopologyCard
                            key={topology.id}
                            {...topology}
                            onDelete={() => handleDelete(topology.id)}
                            onArchive={() => handleArchive(topology.id)}
                        />
                    ))
                )
            )}
        </section>
    );
}