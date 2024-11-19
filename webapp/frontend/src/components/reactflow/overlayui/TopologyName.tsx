import React, {useCallback} from 'react';
import { CircleCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../hooks/useAuth.ts";
import { useParams } from "react-router-dom";
import { Topology } from "../../../types/types";
import { useTopologyStore } from "../../../stores/topologystore.ts";

export default function TopologyName() {
    const [topologyName, setTopologyName] = useState("Topology Name");
    const [isEditing, setIsEditing] = useState(false);
    const [inputWidth, setInputWidth] = useState(0);
    const spanRef = useRef<HTMLSpanElement>(null);
    const initialNameRef = useRef<string>("");
    const { token } = useAuth();
    const { id } = useParams();
    const { topologies, setLastUpdated } = useTopologyStore();

    const currentTopology = topologies[id || ""];

    useEffect(() => {
        (async () => {
            try {
                const response = await fetch(`/api/topology/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const data: Topology = await response.json();
                setTopologyName(data.name);
                setLastUpdated(id!, data.updated_at);
                initialNameRef.current = data.name;
            } catch (error) {
                console.error("Failed to fetch topology data:", error);
            }
        })();
    }, [id, token]);

    useEffect(() => {
        if (spanRef.current) {
            setInputWidth(spanRef.current.offsetWidth);
        }
    }, [topologyName, isEditing]);

    const updateTopologyName = useCallback(async () => {
        try {
            const response = await fetch(`/api/topology/${id}`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: topologyName
                })
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error("Failed to update topology name:", error);
        }
    }, [id, token, topologyName]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTopologyName(e.target.value);
    };

    const handleBlur = async () => {
        setIsEditing(false);
        if (topologyName !== initialNameRef.current) {
           await updateTopologyName();
        }
    };

    const handleClick = () => {
        setIsEditing(true);
    };

    return (
        <div className="flex flex-row items-center">
            {isEditing ? (
                <input
                    value={topologyName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    autoFocus
                    style={{ width: inputWidth }}
                    className="border rounded-sm p-2 text-black"
                    placeholder="Enter topology name"
                />
            ) : (
                <div className="flex items-center cursor-pointer border border-transparent" onClick={handleClick}>
                    <span ref={spanRef} className="p-2">{topologyName}</span>
                </div>
            )}
            <div className="flex flex-row items-center gap-2">
                {/* Show a loading spinner or text when saving */}
                {currentTopology?.isSaving ? (
                    <div className="text-blue-500">Saving...</div>
                ) : (
                    <CircleCheck className="ml-2 text-green-500"/>
                )}
                <p className="text-gray-400">
                    {currentTopology?.lastUpdated ? new Date(currentTopology.lastUpdated).toLocaleString() : "Never updated"}
                </p>
            </div>
            {/* Hidden span to measure text width */}
            <span ref={spanRef} className="absolute invisible p-2">{topologyName}</span>
        </div>
    );
}