import { Topology } from 'common';
import { Trash } from "lucide-react";
import React, { useState } from 'react';
import { useAuth } from "../hooks/useAuth.ts";
import DeletionModal from "./DeletionModal.tsx";

interface TopologyProps extends Topology {
  onDelete: (topologyId: number) => void;
  onArchive: (topologyId: number) => void;
  readOnly?: boolean;
}

const TopologyDetailCard: React.FC<TopologyProps> = ({
  id,
  name,
  archived: initialArchived,
  updatedAt,
  onDelete,
  onArchive,
  userId,
  reactFlowState
}) => {
  const { user } = useAuth();
  const [archived, setArchived] = useState(initialArchived);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const ownsTopology = user?.id === userId;

  // get the devices on the topology
  const devicesUsedInTopology = reactFlowState?.nodes.map(n => n.id);

  // toggle the archive state
  const toggleArchived = (event: React.MouseEvent) => {
    event.stopPropagation();
    setArchived(!archived);
    onArchive(id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(id);
    setIsModalOpen(false);
  };

  return (
    <div className="relative group">
      <button
        onClick={handleDeleteClick}
        className="hidden group-hover:block absolute top-0 right-[-20px] m-1 p-2 shadow-md text-red-500 bg-gray-50 rounded-full hover:bg-gray-100 z-10">
        <Trash size={16} />
      </button>
      <div
        key={id}
        className={`my-5 rounded-lg border border-gray-200 bg-[#ffffff] shadow-sm transition-shadow duration-200 flex flex-col items-center text-gray-700`}
      >
        <div className="w-full flex-1 rounded-b-md p-5">
          <p className="text-sm font-medium text-gray-900 mb-1">{name}</p>
          <div className="flex justify-between w-full items-center">
            <div className="flex flex-col">
              <p className="text-xs text-gray-500">Last Modified</p>
              <p className="text-xs text-gray-500">
                {new Date(updatedAt).toLocaleDateString()}
              </p>
            </div>
            <span
              onClick={!ownsTopology ? undefined : toggleArchived}
              className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${archived
                ? `bg-red-100 text-red-700 ${!ownsTopology ? "cursor-default" : "hover:bg-red-300 cursor-pointer"}`
                : `bg-green-100 text-green-700 ${!ownsTopology ? "cursor-default" : "hover:bg-green-300 cursor-pointer"}`
                }`}
            >
              {archived ? "Archived" : "Active"}
            </span>
          </div>
          <div className='mt-2'>
            <p className='text-md text-gray-500'>Devices in Use</p>
            <div className='flex flex-col'>
              {devicesUsedInTopology?.map(d => (
                <span key={d} className='text-xs'>{d}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <DeletionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        name={name}
      />
    </div >
  );
}

export default TopologyDetailCard;