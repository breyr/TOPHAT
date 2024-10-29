import React from 'react';
import { Topology } from '../types/types';

const TopologyCard: React.FC<Topology> = ({ id, name, thumbnail, react_flow_state, expires_on, archived, updated_at }) => {
    return (
        <div
            key={id}
            className="my-5 rounded-lg size-56 border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col items-center text-gray-700 hover:cursor-pointer"
        >
            <div className="w-full">
                <img
                    src={URL.createObjectURL(new Blob([thumbnail]))}
                    alt='thumbnail'
                    className="w-full h-36 object-cover bg-gray-100 rounded-t-md"
                />
            </div>
            <div className="w-full flex-1 rounded-b-md p-3">
                <p className="text-sm font-medium text-gray-900 mb-1">
                    {name}
                </p>
                <div className="flex justify-between w-full items-center">
                    <div className="flex flex-col">
                        <p className="text-xs text-gray-500">Last Modified</p>
                        <p className="text-xs text-gray-500">{new Date(updated_at).toLocaleDateString()}</p>
                    </div>
                    <span
                        className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                            archived
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                        }`}
                    >
                        {archived ? 'Archived' : 'Active'}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default TopologyCard;