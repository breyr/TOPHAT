import { useEffect, useState } from "react";
import CreateTopology from "../components/CreateTopology";
import TopologyCard from "../components/TopologyCard";
import { useAuth } from "../hooks/useAuth";
import { Topology } from "../types/types";

export default function UserTopologiesPage() {
    const { token } = useAuth();
    const [topologies, setTopologies] = useState([] as Topology[]);

    // get user's topologies on page load by making authenticated request
    useEffect(() => {
        const fetchTopologies = async () => {
            try {
                const response = await fetch('/api/topology/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch topologies');
                }

                const data: Topology[] = await response.json();
                setTopologies(data);
            } catch (error) {
                console.error('Error fetching topologies:', error);
            }
        }

        fetchTopologies();
    }, [token])

    return (
        <section className="pt-[1rem]">
            <CreateTopology />
            {topologies.map((topology) => (
                <TopologyCard {...topology} key={topology.id} />
            ))}
        </section>
    )
}
