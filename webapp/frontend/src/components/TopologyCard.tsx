import React, { useEffect, useState } from "react";
import { Topology } from "../types/types";
import { useNavigate } from "react-router-dom";
import useContextMenu from "../hooks/useContextMenu.ts";
import { Trash2, Archive, CircleX } from "lucide-react";
import DeletionModal from "./DeletionModal.tsx";
// TODO add archival mechanism

interface BufferLike {
  type: "Buffer";
  data: number[];
}

interface TopologyProps extends Topology {
  onDelete: (topologyId: number) => void;
}

const TopologyCard: React.FC<TopologyProps> = ({
  id,
  name,
  thumbnail,
  expires_on,
  archived: initialArchived,
  updated_at,
  onDelete,
}) => {
  const { menuOpen, menuPos, showMenu, hideMenu } = useContextMenu();
  const navigateTo = useNavigate();
  const [thumbnailSrc, setThumbnailSrc] = useState<string | null>(null);
  const [archived, setArchived] = useState(initialArchived);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    showMenu(event.pageX, event.pageY);
  };

  const handleClick = (event: React.MouseEvent) => {
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
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(id);
    setIsModalOpen(false);
  };

  // close the context menu on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuOpen && !(event.target as HTMLElement).closest(".context-menu")) {
        hideMenu();
      }
    };

    if (menuOpen) {
      document.addEventListener("click", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [menuOpen, hideMenu]);

  // handle conversion of thumbnail
  useEffect(() => {
    if (!thumbnail) return;

    // Type assertion to handle the buffer-like object
    const bufferObj = thumbnail as unknown as BufferLike;

    if (bufferObj.type === "Buffer" && Array.isArray(bufferObj.data)) {
      try {
        // convert binary buffer to base64 string
        const base64String = btoa(
          Array.from(bufferObj.data)
            .map((byte) => String.fromCharCode(byte))
            .join("")
        );
        const thumbnailSourceString = `data:image/jpg;base64,${base64String}`;
        setThumbnailSrc(thumbnailSourceString);
      } catch (error) {
        console.error("Error converting to base64:", error);
      }
    }
  }, [thumbnail]);

  return (
    <div className="relative">
      <button
        onClick={handleDeleteClick}
        className="absolute top-2 left-[-10px] m-1 p-0 bg-white rounded-full hover:bg-gray-200"
        style={{ zIndex: 10 }}
      >
        <CircleX size={20} />
      </button>
      <div
        key={id}
        onClick={handleClick}
        className="my-5 rounded-lg size-56 border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col items-center text-gray-700 hover:cursor-pointer"
      >
        <div className="w-full">
          <img
            src={thumbnailSrc ?? ""}
            alt="thumbnail"
            className="w-full h-36 object-cover bg-gray-100 rounded-t-md"
          />
        </div>
        <div className="w-full flex-1 rounded-b-md p-3">
          <p className="text-sm font-medium text-gray-900 mb-1">{name}</p>
          <div className="flex justify-between w-full items-center">
            <div className="flex flex-col">
              <p className="text-xs text-gray-500">Last Modified</p>
              <p className="text-xs text-gray-500">
                {new Date(updated_at).toLocaleDateString()}
              </p>
            </div>
            <span
              onClick={toggleArchived}
              className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                archived
                  ? "bg-red-100 text-red-700 hover:bg-red-300"
                  : "bg-green-100 text-green-700 hover:bg-green-300"
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
    </div>
  );
};

export default TopologyCard;
