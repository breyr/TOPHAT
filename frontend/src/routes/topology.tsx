import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NotFound from '../components/reactflow/overlayui/NotFound';
import TopologyName from '../components/reactflow/overlayui/TopologyName';
import TopologyCanvasWrapper from '../components/reactflow/TopologyCanvas';
import { TopologyProvider } from '../context/TopologyContext';
import { useAuth } from '../hooks/useAuth';
import { useTopology } from '../hooks/useTopology';

type ErrorState = {
    type: 'ID_MISSING' | 'NOT_FOUND' | 'FETCH_ERROR' | null;
    message: string;
};

const TopologyPageContent: React.FC = () => {
    const { setTopologyData, setLastUpdated } = useTopology();
    const [error, setError] = useState<ErrorState>({ type: null, message: '' });
    const [loading, setLoading] = useState<boolean>(true);

    const { id } = useParams();
    const navigateTo = useNavigate();
    const { authenticatedApiClient } = useAuth();

    // on mount get the topology data
    useEffect(() => {
        (async () => {
            // reset error
            setError({ type: null, message: '' });
            setLoading(true);

            if (!id) {
                setError({
                    type: 'ID_MISSING',
                    message: 'No topology ID provided'
                });
                setLoading(false);
                return;
            }

            try {
                const topologyId = parseInt(id);
                const res = await authenticatedApiClient.getTopology(topologyId);
                if (!res.data) {
                    setError({
                        type: 'NOT_FOUND',
                        message: `Topology with ID ${topologyId} not found`
                    });
                    return;
                } else {
                    setTopologyData(res.data);
                    const lastUpdated = new Date(res.data.updatedAt);
                    setLastUpdated(lastUpdated.toLocaleString());
                }
            } catch (error) {
                setError({
                    type: 'FETCH_ERROR',
                    message: 'Failed to fetch topology data'
                });
                console.error("Failed to fetch topology data:", error);
            } finally {
                setLoading(false);
            }

        })();
    }, [authenticatedApiClient, id, setTopologyData, setLastUpdated]);

    return (
        <section className="flex flex-col h-screen">
            {
                loading ? (
                    <div className="flex-1 flex justify-center items-center">
                        <h1 className="mr-2">Loading</h1>
                        <div className="loader">
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                        </div>
                    </div>
                ) : error.type ? (
                    <div className="flex-1 flex justify-center items-center">
                        <NotFound errorData={error} />
                    </div>
                ) : (
                    <div className='flex-1 flex flex-col'>
                        <nav className="w-full flex flex-row justify-between border-b-2 py-2 px-2">
                            <TopologyName />
                            <div className="flex flex-row items-center gap-2">
                                <h4 onClick={() => navigateTo('/dashboard/')} className="hover:cursor-pointer hover:text-blue-400">Dashboard</h4>
                            </div>
                        </nav>
                        <div className='flex-grow'>
                            <TopologyCanvasWrapper />
                        </div>
                    </div>
                )
            }
        </section>
    );
};

const TopologyPage: React.FC = () => (
    <TopologyProvider>
        <TopologyPageContent />
    </TopologyProvider>
);

export default TopologyPage;