import { useContext } from "react";
import { TopologyContext } from "../context/TopologyContext";

export const useTopology = () => {
    const context = useContext(TopologyContext);
    if (!context) {
        throw new Error('useTopology must be used within a TopologyProvider');
    }
    return context;
};