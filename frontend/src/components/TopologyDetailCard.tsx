import { Topology } from 'common';
import { Image, Trash } from "lucide-react";
import React, { useEffect, useState } from 'react';
import DeletionModal from "./DeletionModal.tsx";

interface TopologyProps extends Topology {
  onDelete: (topologyId: number) => void;
  onArchive: (topologyId: number) => void;
  readOnly?: boolean;
}

const TopologyDetailCard: React.FC<TopologyProps> = ({
  id,
  name,
  archived,
  updatedAt,
  onDelete,
  thumbnail,
  reactFlowState
}) => {
  const [thumbnailSrc, setThumbnailSrc] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // get the devices on the topology
  const devicesUsedInTopology = reactFlowState?.nodes.map(n => n.id);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(id);
    setIsModalOpen(false);
  };

  // handle conversion of thumbnail
  useEffect(() => {
    if (!thumbnail) return;
    try {
      // convert the object to a Uint8Array
      const byteArray = new Uint8Array(Object.values(thumbnail));

      // convert Uint8Array to binary string
      const binaryString = Array.from(byteArray)
        .map(byte => String.fromCharCode(byte))
        .join('');

      // convert binary string to base64
      const base64String = btoa(binaryString);
      // check if empty
      if (base64String !== "AA==") {
        const thumbnailSourceString = `data:image/jpg;base64,${base64String}`;
        setThumbnailSrc(thumbnailSourceString);
      }
    } catch (error) {
      console.error('Error converting to base64:', error);
    }
  }, [thumbnail]);

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
        <div className="w-full">
          {thumbnailSrc ? (
            <img
              src={thumbnailSrc}
              alt="Topology Thumbnail"
              className="w-full h-36 object-cover bg-gray-100 rounded-t-md"
            />
          ) : (
            <div className="w-full h-36 flex items-center justify-center bg-gray-100 rounded-t-md">
              <Image size={80} className="text-gray-400" />
            </div>
          )}
        </div>
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
              className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${archived
                ? `bg-red-100 text-red-700`
                : `bg-green-100 text-green-700`
                }`}
            >
              {archived ? "Archived" : "Active"}
            </span>
          </div>
          <div className='mt-2'>
            {
              !archived &&
              <>
                <p className='text-md text-gray-500'>Devices in Use</p>
                <div className='flex flex-col'>
                  {devicesUsedInTopology?.map(d => (
                    <span key={d} className='text-xs'>{d}</span>
                  ))}
                </div>
              </>
            }
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