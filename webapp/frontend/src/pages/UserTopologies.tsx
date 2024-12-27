import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Topology } from "../../../common/shared-types";
import CreateTopology from "../components/CreateTopology";
import TopologyCard from "../components/TopologyCard";
import { useAuth } from "../hooks/useAuth";

export default function UserTopologiesPage() {
    const { token, authenticatedApiClient } = useAuth();
    const [topologies, setTopologies] = useState([] as Topology[]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // get user's topologies on page load by making authenticated request
    useEffect(() => {
        (async () => {
            if (!token) return;

            try {
                setIsLoading(true);
                setError(null);
                const response = await authenticatedApiClient.getAllTopologies();
                setTopologies(response.data ?? []);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'An error occurred');
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [token, authenticatedApiClient]);

    const handleDelete = async (topologyId: number) => {
        if (!token) {
            return;
        }
        try {
            const response = await authenticatedApiClient.deleteTopology(topologyId);
            // update topologies list on success
            setTopologies((prevTopologies) => prevTopologies.filter(topology => topology.id !== response.data?.topologyId));
        } catch (error) {
            console.error('Error deleting topology:', error);
        }
    }

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
                        <TopologyCard key={topology.id} {...topology} onDelete={() => handleDelete(topology.id)} />
                    ))
                )
            )}
        </section>
    )
}
