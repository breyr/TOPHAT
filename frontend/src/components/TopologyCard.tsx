import { Topology } from 'common';
import { Image, Trash } from "lucide-react";
import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.ts";
import useContextMenu from "../hooks/useContextMenu.ts";
import DeletionModal from "./DeletionModal.tsx";

interface TopologyProps extends Topology {
  onDelete: (topologyId: number) => void;
  onArchive: (topologyId: number) => void;
  readOnly?: boolean;
}

const TopologyCard: React.FC<TopologyProps> = ({
  id,
  name,
  thumbnail,
  archived: initialArchived,
  updatedAt,
  onDelete,
  onArchive,
  readOnly,
  userId
}) => {
  const { menuOpen, hideMenu } = useContextMenu();
  const { user } = useAuth();
  const navigateTo = useNavigate();
  const [thumbnailSrc, setThumbnailSrc] = useState<string | null>(null);
  const [archived, setArchived] = useState(initialArchived);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const ownsTopology = user?.id === userId;

  const handleClick = (event: React.MouseEvent) => {
    if (archived) return;

    if (readOnly && !(user?.accountType === "ADMIN" || user?.accountType === "OWNER")) return;
    if (menuOpen) {
      event.stopPropagation();
      hideMenu();
    } else {
      navigateTo(`/topology/${id}`);
    }
  };

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
    <div className="relative">
      <button
        onClick={handleDeleteClick}
        className="absolute top-0 right-[-20px] m-1 p-2 shadow-md text-red-500 bg-gray-50 rounded-full hover:bg-gray-100 z-10"
      >
        <Trash size={16} />
      </button>
      <div
        key={id}
        onClick={handleClick}
        className={`my-5 rounded-lg size-56 border border-gray-200 bg-[#ffffff] shadow-sm transition-shadow duration-200 flex flex-col items-center text-gray-700 ${readOnly || archived ? "hover:cursor-default" : "hover:cursor-pointer hover:shadow-md"}`}
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
        <div className="w-full flex-1 rounded-b-md p-3">
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

export default TopologyCard;