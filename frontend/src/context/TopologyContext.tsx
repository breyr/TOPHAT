import { Topology } from 'common';
import React, { createContext, useState } from 'react';

interface TopologyContextProps {
    topologyData: Topology | null;
    setTopologyData: (data: Topology | null) => void;
    isSaving: boolean;
    setIsSaving: (isSaving: boolean) => void;
    lastUpdated: string;
    setLastUpdated: (updatedAt: string) => void;
    isReinintializingLinks: boolean;
    setIsReinitializingLinks: (isReinitializingLinks: boolean) => void;
}

export const TopologyContext = createContext<TopologyContextProps | undefined>(undefined);

export const TopologyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [topologyData, setTopologyData] = useState<Topology | null>(null);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [lastUpdated, setLastUpdated] = useState<string>("");
    const [isReinintializingLinks, setIsReinitializingLinks] = useState<boolean>(false);

    return (
        <TopologyContext.Provider value={{ topologyData, setTopologyData, isSaving, setIsSaving, lastUpdated, setLastUpdated, isReinintializingLinks, setIsReinitializingLinks }}>
            {children}
        </TopologyContext.Provider>
    );
};