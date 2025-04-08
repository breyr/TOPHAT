import { CircleCheck, CloudUpload } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from "../../../hooks/useAuth";
import { useTopology } from '../../../hooks/useTopology.ts';

export default function TopologyName() {
    const { topologyData, setTopologyData, setIsSaving, isSaving, setLastUpdated, lastUpdated } = useTopology();
    const [topologyName, setTopologyName] = useState(topologyData?.name || "Topology Name");
    const [isEditing, setIsEditing] = useState(false);
    const [inputWidth, setInputWidth] = useState(0);
    const spanRef = useRef<HTMLSpanElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { authenticatedApiClient } = useAuth();

    const prevRenderTopologyName = topologyData?.name || "Topology Name";

    useEffect(() => {
        if (spanRef.current) {
            setInputWidth(spanRef.current.offsetWidth);
        }
    }, [topologyName, isEditing]);

    useEffect(() => {
        if (!topologyData?.name) return;

        document.title = topologyData.name;

        return () => {
            document.title = 'TOPHAT'
        }
    }, [topologyData?.name]);

    const updateTopologyName = useCallback(async () => {
        setIsSaving(true);
        try {
            if (topologyData?.id) {
                const res = await authenticatedApiClient.updateTopology(topologyData?.id, { name: topologyName });
                // set last updated
                if (res.data) {
                    const updatedAt = new Date(res.data.updatedAt);
                    setLastUpdated(updatedAt.toLocaleString());
                    setTopologyData(res.data);
                }
            }
        } catch (error) {
            console.error("Failed to update topology name:", error);
        } finally {
            setIsSaving(false);
        }
    }, [authenticatedApiClient, topologyData?.id, topologyName, setIsSaving, setLastUpdated]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTopologyName(e.target.value);
    };

    const handleBlur = async () => {
        setIsEditing(false);
        if (topologyName !== prevRenderTopologyName) {
            await updateTopologyName();
        }
    };

    const handleClick = () => {
        setIsEditing(true);
    };

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (inputRef.current) {
                inputRef.current.blur();
            }
            await updateTopologyName();
        }
    };


    return (
        <div className="flex flex-row items-center">
            {/* Topology Name Input */}
            {isEditing ? (
                <input
                    ref={inputRef}
                    value={topologyName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
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
            {/* Saving and Last Saved Timestamp */}
            <div className="flex flex-row items-center gap-2">
                {isSaving ? (
                    <div className="text-blue-500"><CloudUpload /></div>
                ) : (
                    <>
                        {lastUpdated && (
                            <div className="ml-2 flex flex-row items-center gap-2"><CircleCheck className='text-green-500' size={22} /> <p>{lastUpdated}</p></div>
                        )}
                    </>
                )}
            </div>
            {/* Hidden span to measure text width */}
            <span ref={spanRef} className="absolute invisible p-2">{topologyName}</span>
        </div>
    );
}