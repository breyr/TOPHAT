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
            className="size-20 flex flex-col justify-center items-center p-2 text-blue-500 font-bold cursor-pointer transition-transform transform hover:scale-105 hover:bg-blue-100"
            onDragStart={(event) => onDragStart(event, nodeType)}
            draggable
        >
            {nodeSvg}
            <p>{deviceData.name}</p>
        </div>
    );
};

export default DraggableItem;