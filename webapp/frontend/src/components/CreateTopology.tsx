import { PlusCircle } from 'lucide-react';
import React from 'react';
import { useAuth } from '../hooks/useAuth';

const CreateTopology: React.FC = () => {
    const { token } = useAuth();

    const handleCreateTopology = async () => {
        if (!token) {
            return;
        }

        try {
            const response = await fetch('/api/topology/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: `Topology_${Date.now()}`,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create topology');
            }

            const data = await response.json();
            console.log('Topology created:', data);
        } catch (error) {
            console.error('Error creating topology:', error);
        }
    };

    return (
        <div onClick={handleCreateTopology} className="my-5 rounded-md size-52 border-dashed border-2 bg-gray-50 flex flex-col justify-center items-center gap-3 text-gray-300 hover:cursor-pointer">
            <PlusCircle size={40} />
            <p>Create Topology</p>
        </div>
    );
};

export default CreateTopology;