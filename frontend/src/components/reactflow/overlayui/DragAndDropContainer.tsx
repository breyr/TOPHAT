import React from "react";
import ExternalIcon from "../../svg/external.svg?react";
import RouterIcon from "../../svg/router.svg?react";
import ServerIcon from "../../svg/server.svg?react";
import SwitchIcon from "../../svg/switch.svg?react";

// types of nodes
type NodeType = "Switch" | "Router" | "Server" | "External";

// interface for props
interface DraggableItem {
    nodeSvg: JSX.Element;
    nodeType: NodeType;
    deviceName: string;
}

// draggable component
const Draggable: React.FC<DraggableItem> = ({ nodeSvg, nodeType, deviceName }) => {
    const onDragStart = (
        event: React.DragEvent<HTMLDivElement>,
        nodeType: NodeType,
        deviceName: string
    ) => {
        // set node & device information to be used in TopologyCanvas to create the nodes
        const data = JSON.stringify({ nodeType, deviceName });
        event.dataTransfer.setData("application/reactflow", data);
        event.dataTransfer.effectAllowed = "move";
    };

    return (
        <div
            className="w-24 h-24 rounded flex flex-col justify-center items-center p-2 cursor-pointer transition-transform transform hover:scale-105 hover:bg-blue-200 hover:shadow-lg"
            onDragStart={(event) => onDragStart(event, nodeType, deviceName)}
            draggable
        >
            {nodeSvg}
            <p>{deviceName}</p>
        </div>
    );
};

export default function DragAndDropContainer() {
    const draggableItems: DraggableItem[] = [
        { nodeSvg: <SwitchIcon />, nodeType: "Switch", deviceName: "Switch 1" },
        { nodeSvg: <RouterIcon />, nodeType: "Router", deviceName: "Router 1" },
        { nodeSvg: <ExternalIcon />, nodeType: "External", deviceName: "External 1" },
        { nodeSvg: <ServerIcon />, nodeType: "Server", deviceName: "Server 1" },
    ];

    return (
        <div className="grid grid-cols-2 gap-4 overflow-y-auto rounded-md rounded-tl-none bg-white w-full py-5 px-5 shadow-2xl">
            {draggableItems.map((item, index) => (
                <Draggable
                    nodeSvg={item.nodeSvg}
                    nodeType={item.nodeType}
                    deviceName={item.deviceName}
                    key={index}
                />
            ))}
        </div>
    );
}