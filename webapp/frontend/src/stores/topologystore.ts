import { create } from 'zustand';

type TopologyState = {
    isSaving: boolean;
    lastUpdated: Date;  // We'll store the last updated timestamp here
}

type TopologyActions = {
    setIsSaving: (id: string, isSaving: boolean) => void;
    setLastUpdated: (id: string, lastUpdated: Date) => void;
}

type TopologyStore = {
    topologies: Record<string, TopologyState>;
} & TopologyActions;

// Create the Zustand store
export const useTopologyStore = create<TopologyStore>((set) => ({
    topologies: {},

    // Update the saving status of a specific topology by its ID
    setIsSaving: (id: string, isSaving: boolean) =>
        set((state) => ({
            topologies: {
                ...state.topologies,
                [id]: {
                    ...state.topologies[id],
                    isSaving,
                },
            },
        })),

    // Update the lastUpdated field of a specific topology by its ID
    setLastUpdated: (id: string, lastUpdated: Date) =>
        set((state) => ({
            topologies: {
                ...state.topologies,
                [id]: {
                    ...state.topologies[id],
                    lastUpdated,
                },
            },
        })),
}));