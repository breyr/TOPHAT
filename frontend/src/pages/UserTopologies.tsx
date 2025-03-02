import { Node } from "@xyflow/react";
import type { Topology } from "common";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import CreateTopology from "../components/CreateTopology";
import TopologyCard from "../components/TopologyCard";
import { useAuth } from "../hooks/useAuth";
import { Device } from "../models/Device";

export default function UserTopologiesPage() {
    const { token, authenticatedApiClient } = useAuth();
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
                    console.log(`Unbooked ${devicePromises.length} devices from topology ${topologyData.id}`);
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
                // Unbook devices first
                await unbookDevicesInTopology(topology);

                // Then delete the topology
                await authenticatedApiClient.deleteTopology(topologyId);

                // Update UI regardless of what the delete response contains
                setTopologies((prevTopologies) =>
                    prevTopologies.filter(t => t.id !== topologyId)
                );
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
                // Unbook devices first
                await unbookDevicesInTopology(topology);

                // Then archive the topology
                await authenticatedApiClient.updateTopology(topologyId, {
                    archived: true
                });

                // Update UI regardless of what the update response contains
                setTopologies((prevTopologies) =>
                    prevTopologies.filter(t => t.id !== topologyId)
                );
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