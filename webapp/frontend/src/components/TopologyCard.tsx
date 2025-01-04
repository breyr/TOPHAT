import { Archive, Trash2 } from "lucide-react";
import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Topology } from '../../../common/shared-types.ts';
import useContextMenu from "../hooks/useContextMenu.ts";

interface ContextMenuProps {
    x: number;
    y: number;
    onDelete: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onDelete }) => {
    return (
        <div
            style={{ position: "absolute", top: y, left: x }}
            className="bg-white border-2 p-4 shadow-md flex flex-col justify-center gap-2 context-menu"
        >
            <p className="flex flex-row items-center gap-2 r-btn secondary tertiary"><Archive size={24} /> Archive</p>
            <p onClick={onDelete} className="flex flex-row items-center gap-2 r-btn secondary danger"><Trash2 size={24} /> Delete</p>
        </div>
    )
}

interface TopologyProps extends Topology {
    onDelete: (topologyId: number) => void;
}

const TopologyCard: React.FC<TopologyProps> = ({ id, name, thumbnail, archived, updatedAt, onDelete }) => {
    const { menuOpen, menuPos, showMenu, hideMenu } = useContextMenu();
    const navigateTo = useNavigate();
    const [thumbnailSrc, setThumbnailSrc] = useState<string | null>(null);

    const handleContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        showMenu(event.pageX, event.pageY);
    }

    const handleClick = (event: React.MouseEvent) => {
        if (menuOpen) {
            event.stopPropagation();
            hideMenu();
        } else {
            navigateTo(`/topology/${id}`)
        }
    }

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
        }
    }, [menuOpen, hideMenu]);

    // handle conversion of thumbnail
    useEffect(() => {
        if (!thumbnail) return;
        try {
            // Convert the object to a Uint8Array
            const byteArray = new Uint8Array(Object.values(thumbnail));

            // Convert Uint8Array to binary string
            const binaryString = Array.from(byteArray)
                .map(byte => String.fromCharCode(byte))
                .join('');

            // Convert binary string to base64
            const base64String = btoa(binaryString);

            const thumbnailSourceString = `data:image/jpg;base64,${base64String}`;
            setThumbnailSrc(thumbnailSourceString);
        } catch (error) {
            console.error('Error converting to base64:', error);
        }
    }, [thumbnail]);

    return (
        <div
            key={id}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            className="my-5 rounded-lg size-56 border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col items-center text-gray-700 hover:cursor-pointer"
        >
            <div className="w-full">
                <img
                    src={thumbnailSrc ?? ""}
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
                        <p className="text-xs text-gray-500">{new Date(updatedAt).toLocaleDateString()}</p>
                    </div>
                    <span
                        className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${archived
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                            }`}
                    >
                        {archived ? 'Archived' : 'Active'}
                    </span>
                </div>
            </div>
            {menuOpen && <ContextMenu x={menuPos.x} y={menuPos.y} onDelete={() => onDelete(id)} />}
        </div>
    );
}

export default TopologyCard;