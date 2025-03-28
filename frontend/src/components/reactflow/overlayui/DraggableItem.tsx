import { Device } from "../../../models/Device";

export interface DraggableItemProps {
    nodeSvg: JSX.Element;
    nodeType: string;
    deviceData: Device;
    isUsed: boolean;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ nodeSvg, nodeType, deviceData, isUsed }) => {
    const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
        event.dataTransfer.setData("application/reactflow", JSON.stringify({ nodeType, deviceData }));
        event.dataTransfer.effectAllowed = "move";
    };

    const isAvailableToUser = !isUsed && (!deviceData.userId);

    return (
        isAvailableToUser && <div
            className={`w-24 h-24 flex flex-col justify-center items-center transition-transform transform ${isAvailableToUser ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed'}`}
            onDragStart={isAvailableToUser ? (event) => onDragStart(event, nodeType) : undefined}
            draggable={isAvailableToUser}
        >
            <div className="w-12 h-12 mb-1">
                {nodeSvg}
            </div>
            <p className='text-sm text-gray-700'>
                {deviceData.name}
            </p>
        </div>
    );
};

export default DraggableItem;