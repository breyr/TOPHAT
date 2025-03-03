import { Node } from '@xyflow/react';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NotFound from '../components/reactflow/overlayui/NotFound';
import TopologyName from '../components/reactflow/overlayui/TopologyName';
import TopologyCanvasWrapper from '../components/reactflow/TopologyCanvas';
import { TopologyProvider } from '../context/TopologyContext';
import { useAuth } from '../hooks/useAuth';
import { useTopology } from '../hooks/useTopology';
import { Device } from '../models/Device';

type ErrorState = {
    type: 'ID_MISSING' | 'NOT_FOUND' | 'FETCH_ERROR' | null;
    message: string;
};

const TopologyPageContent: React.FC = () => {
    const { setTopologyData, setLastUpdated } = useTopology();
    const [error, setError] = useState<ErrorState>({ type: null, message: '' });
    const [loading, setLoading] = useState<boolean>(true);
    const [isBookingDevices, setIsBookingDevices] = useState<boolean>(false);
    const [bookingErrors, setBookingErrors] = useState<string[]>([]);
    const hasFetchedData = useRef(false);

    const { id } = useParams();
    const navigateTo = useNavigate();
    const { user, authenticatedApiClient } = useAuth();

    // on mount get the topology data
    useEffect(() => {
        if (hasFetchedData.current) return; // prevent running effect twice
        (async () => {
            if (!user) {
                navigateTo("/");
                return;
            }

            // reset error
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

                    // attempt to book devices required for topology
                    if (res.data.reactFlowState?.nodes) {
                        setIsBookingDevices(true);
                        const nodes = res.data.reactFlowState?.nodes as Node<{ deviceData?: Device }>[] | undefined;
                        const errors: string[] = [];

                        if (nodes) {
                            for (const node of nodes) {
                                if (node.data?.deviceData?.id) {
                                    try {
                                        // only try to book if it's not already booked by this user
                                        await authenticatedApiClient.bookDevice(node.data.deviceData.id);
                                    } catch (error: any) {
                                        // capture booking errors but continue with other devices
                                        const deviceName = node.data.deviceData.name || 'Unknown device';
                                        if (error.status === 409) {
                                            errors.push(`${deviceName} - already booked by another user`);
                                        } else {
                                            errors.push(`${deviceName} - booking failed`);
                                        }
                                    }
                                }
                            }
                        }

                        // update state with any errors
                        if (errors.length > 0) {
                            setBookingErrors(errors);
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
                setTimeout(() => {
                    setLoading(false);
                    setIsBookingDevices(false);
                }, 2000); // 1-second delay after successful booking of all devices
            }

            hasFetchedData.current = true;
        })();
    }, [user, authenticatedApiClient, id, setTopologyData, setLastUpdated, navigateTo]);

    return (
        <section className="flex flex-col h-screen">
            {
                loading ? (
                    <div className="flex-1 flex justify-center items-center">
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
                ) : error.type ? (
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
        </section >
    );
};

const TopologyPage: React.FC = () => (
    <TopologyProvider>
        <TopologyPageContent />
    </TopologyProvider>
);

export default TopologyPage;