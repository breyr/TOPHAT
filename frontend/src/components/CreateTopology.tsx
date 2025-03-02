import type { CreateTopologyRequestPayload } from 'common';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';

const CreateTopology = () => {
    const { token, authenticatedApiClient } = useAuth();
    const navigateTo = useNavigate();

    const handleCreateTopology = async () => {
        if (!token) {
            return;
        }
        try {
            const requestPayload: CreateTopologyRequestPayload = { name: `Topology_${Date.now()}` }
            const response = await authenticatedApiClient.createTopology(requestPayload);
            navigateTo(`/topology/${response.data!.id}`);
        } catch (error) {
            console.error('Error creating topology:', error);
        }
    };

    return (
        <div onClick={handleCreateTopology}
            className="my-5 rounded-md size-56 border-dashed border-2 flex flex-col justify-center items-center gap-3 text-gray-300 transition-all duration-300 ease-in-out transform hover:scale-95 hover:cursor-pointer hover:border-gray-200">
            <PlusCircle size={40} className='text-blue-300' />
            <p className='text-gray-500'>Create Topology</p>
        </div>
    );
};

export default CreateTopology;