import { Device } from "../../../models/Device";

export interface DraggableItemProps {
    nodeSvg: JSX.Element;
    nodeType: string;
    deviceData: Device;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ nodeSvg, nodeType, deviceData }) => {
    const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
        event.dataTransfer.setData("application/reactflow", JSON.stringify({ nodeType, deviceData }));
        event.dataTransfer.effectAllowed = "move";
    };

    return (
        <div
            className="w-24 h-24 flex flex-col justify-center items-center cursor-pointer transition-transform transform hover:scale-105"
            onDragStart={(event) => onDragStart(event, nodeType)}
            draggable
        >
            <div className="w-12 h-12 mb-2">
                {nodeSvg}
            </div>
            <p className="text-sm text-gray-700">{deviceData.name}</p>
        </div>
    );
};

export default DraggableItem;