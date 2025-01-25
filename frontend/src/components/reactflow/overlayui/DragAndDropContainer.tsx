import React from "react";

// types of nodes
type NodeType = "input" | "default" | "output" | "textUpdater";

// interface for props
interface DraggableItem {
    displayText: string;
    nodeType: NodeType;
}

// draggable component
const Draggable: React.FC<DraggableItem> = ({ displayText, nodeType }) => {
    const onDragStart = (
        event: React.DragEvent<HTMLDivElement>,
        nodeType: NodeType
    ) => {
        event.dataTransfer.setData("application/reactflow", nodeType);
        event.dataTransfer.effectAllowed = "move";
    };

    return (
        <div
            className="border-2 border-blue-500 rounded-lg w-24 h-24 flex flex-col justify-center items-center p-2 text-blue-500 font-bold cursor-pointer transition-transform transform hover:scale-105 hover:bg-blue-100"
            onDragStart={(event) => onDragStart(event, nodeType)}
            draggable
        >
            <i className="bi bi-node-plus text-2xl mb-2"></i>
            <p>{displayText}</p>
        </div>
    );
};

export default function DragAndDropContainer() {
    const draggableItems: DraggableItem[] = [
        { displayText: "Input", nodeType: "input" },
        { displayText: "Default", nodeType: "default" },
        { displayText: "Output", nodeType: "output" },
        { displayText: "Text Updater", nodeType: "textUpdater" }
    ];

    return (
        <div className="grid grid-cols-2 gap-4 overflow-y-auto rounded-md rounded-tl-none bg-white w-full py-5 px-5 shadow-2xl">
            {draggableItems.map((item, index) => (
                <Draggable
                    displayText={item.displayText}
                    nodeType={item.nodeType}
                    key={index}
                />
            ))}
        </div>
    );
}