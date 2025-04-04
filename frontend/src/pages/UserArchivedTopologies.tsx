import { Topology } from "common";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import TopologyCard from "../components/TopologyCard";
import { useAuth } from "../hooks/useAuth";

export default function UserArchivedTopologiesPage() {
    const { token, authenticatedApiClient } = useAuth();
    const [archivedTopologies, setArchivedTopologies] = useState([] as Topology[]);
    const [isLoading, setIsLoading] = useState(true);

    // get user's archived topologies on page load by making authenticated request
    useEffect(() => {
        (async () => {
            if (!token) return;
            try {
                setIsLoading(true);
                const response = await authenticatedApiClient.getAllTopologies();
                setArchivedTopologies(response.data?.filter(topology => topology.archived) ?? []);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [token]);

    const handleDelete = async (topologyId: number) => {
        if (!token) {
            return;
        }
        try {
            await authenticatedApiClient.deleteTopology(topologyId);
            // update topologies list on success
            setArchivedTopologies((prevTopologies) => prevTopologies.filter(topology => topology.id !== topologyId));
        } catch (error) {
            console.error('Error deleting topology:', error);
        }
    }

    const handleArchive = async (topologyId: number) => {
        if (!token) {
            return;
        }
        try {
            await authenticatedApiClient.updateTopology(topologyId, {
                archived: false
            });
            // update topologies list on success
            setArchivedTopologies((prevTopologies) => prevTopologies.filter(topology => topology.id !== topologyId));
        } catch (error) {
            console.error('Error activating topology:', error);
        }
    };

    return (
        <section className="pt-4 flex flex-row flex-wrap gap-x-8">
            {isLoading ? (
                <div className="flex items-center justify-center min-h-[200px]">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
            ) : (
                archivedTopologies.length !== 0 ? (
                    archivedTopologies.map((topology) => (
                        <TopologyCard key={topology.id} {...topology} onDelete={() => handleDelete(topology.id)} onArchive={() => handleArchive(topology.id)} readOnly={true} />
                    ))
                ) : (
                    <p className="pt-4">No archived topologies found.</p>
                )
            )}
        </section>
    )
}