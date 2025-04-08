import { Node } from '@xyflow/react';
import { ArrowLeft } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NotFound from '../components/reactflow/overlayui/NotFound';
import TopologyName from '../components/reactflow/overlayui/TopologyName';
import TopologyCanvasWrapper from '../components/reactflow/TopologyCanvas';
import { TopologyProvider } from '../context/TopologyContext';
import { useAuth } from '../hooks/useAuth';
import { useLinkOperationsBase } from '../hooks/useLinkOperations';
import { useTopology } from '../hooks/useTopology';
import { Device } from '../models/Device';

type ErrorState = {
    type: 'ID_MISSING' | 'NOT_FOUND' | 'FETCH_ERROR' | null;
    message: string;
};

const TopologyPageContent: React.FC = () => {
    const { topologyData, setIsReinitializingLinks, setTopologyData, setLastUpdated } = useTopology();
    const { createLinkBulk } = useLinkOperationsBase();
    const [error, setError] = useState<ErrorState>({ type: null, message: '' });
    const [loading, setLoading] = useState<boolean>(true);
    const [bookingErrors, setBookingErrors] = useState<string[]>([]);
    const [fadeOut, setFadeOut] = useState<boolean>(false);
    const [showContent, setShowContent] = useState<boolean>(false);
    const hasFetchedData = useRef(false);
    const hasReinitializedLinks = useRef(false);

    const { id } = useParams();
    const navigateTo = useNavigate();
    const { user, authenticatedApiClient } = useAuth();

    const bookDevices = useCallback(async (nodes: Node<{ deviceData?: Device }>[]) => {
        const errors: string[] = [];

        for (const node of nodes) {
            if (node.data?.deviceData?.id) {
                try {
                    await authenticatedApiClient.bookDevice(node.data.deviceData.id);
                } catch (error: any) {
                    const deviceName = node.data.deviceData.name || 'Unknown device';
                    if (error.status === 409) {
                        errors.push(`${deviceName} - already booked by another user`);
                    } else {
                        errors.push(`${deviceName} - booking failed`);
                    }
                }
            }
        }

        setBookingErrors(errors);
    }, [authenticatedApiClient]);

    const reinitializeLinks = useCallback(async (edges: any[]) => {
        setIsReinitializingLinks(true);

        const edgesForTopology = edges.map(e => ({
            value: e.id,
            label: `(${e.source}) ${e.data?.sourcePort ?? ''} -> (${e.target}) ${e.data?.targetPort ?? ''}`,
            firstLabDevice: e.source,
            firstLabDevicePort: e.data?.sourcePort ?? '',
            secondLabDevice: e.target,
            secondLabDevicePort: e.data?.targetPort ?? '',
        }));

        await createLinkBulk(new Set(edgesForTopology));

        setIsReinitializingLinks(false);
    }, [createLinkBulk, setIsReinitializingLinks]);

    useEffect(() => {
        if (hasFetchedData.current) return;
        (async () => {
            if (!user) {
                navigateTo("/");
                return;
            }

            setBookingErrors([]);
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

                    if (res.data.reactFlowState?.nodes) {
                        const nodes = res.data.reactFlowState?.nodes as Node<{ deviceData?: Device }>[] | undefined;
                        if (nodes) {
                            await bookDevices(nodes);
                        }
                    }
                }
            } catch (error) {
                setError({
                    type: 'FETCH_ERROR',
                    message: 'Failed to fetch topology data'
                });
                console.error("Failed to fetch topology data:", error);
            } finally {
                setFadeOut(true);
                setTimeout(() => {
                    setLoading(false);
                    setShowContent(true);
                }, 300); // 0.3-second delay for fade-out animation
            }

            hasFetchedData.current = true;
        })();
    }, [user, authenticatedApiClient, id, setTopologyData, setLastUpdated, navigateTo, bookDevices]);

    useEffect(() => {
        if (!loading && topologyData?.reactFlowState?.edges && !hasReinitializedLinks.current) {
            hasReinitializedLinks.current = true;
            reinitializeLinks(topologyData.reactFlowState.edges);
        }
    }, [loading, topologyData?.reactFlowState?.edges, reinitializeLinks]);

    return (
        <section className="flex flex-col h-screen">
            {
                loading ? (
                    <div className={`flex-1 flex justify-center items-center ${fadeOut ? 'fade-out' : 'fade-in'}`}>
                        <h2 className="m-5 mr-2 pb-4">
                            Loading
                        </h2>
                        <div className="loader">
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                        </div>
                    </div>
                ) : showContent ? (
                    error.type ? (
                        <div className="flex-1 flex justify-center items-center">
                            <NotFound errorData={error} />
                        </div>
                    ) : bookingErrors.length > 0 ? (
                        <div className='flex-1 flex flex-col justify-center items-center'>
                            <h1 className="text-2xl font-bold text-red-500">Failed to Book Devices</h1>
                            {bookingErrors.map((e, idx) => (
                                <span key={idx}>{e}</span>
                            ))}
                            <h4 onClick={() => navigateTo('/dashboard/')} className="hover:cursor-pointer hover:text-blue-400 border-b-2 border-spacing-2 flex flex-row items-center gap-1"> <ArrowLeft /> Go back to Dashboard</h4>
                        </div>
                    ) : (
                        <div className='flex-1 flex flex-col fade-in'>
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
                ) : null
            }
        </section >
    );
};

const TopologyPage: React.FC = () => (
    <TopologyProvider>
        <TopologyPageContent />
    </TopologyProvider>
);

export default TopologyPage;