import React from 'react';
import { Topology } from '../types/types';

const TopologyCard: React.FC<Topology> = ({ id, name, thumbnail, react_flow_state, expires_on, archived }) => {
    return (
        <div key={id} className="my-5 rounded-md size-52 border-dashed border-2 bg-gray-50 flex flex-col justify-center items-center gap-3 text-gray-700 hover:cursor-pointer p-4">
            <img src={URL.createObjectURL(new Blob([thumbnail]))} alt={name} className="w-full h-32 object-cover rounded-md" />
            <h2 className="text-lg font-semibold">{name}</h2>
            <p className="text-sm text-gray-500">Expires on: {new Date(expires_on).toLocaleDateString()}</p>
            {archived && <span className="text-xs text-red-500">Archived</span>}
        </div>
    );
}

export default TopologyCard;