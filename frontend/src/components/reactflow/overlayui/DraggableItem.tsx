import { useAuth } from "../../../hooks/useAuth";
import { Device } from "../../../models/Device";

export interface DraggableItemProps {
    nodeSvg: JSX.Element;
    nodeType: string;
    deviceData: Device;
    isUsed: boolean;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ nodeSvg, nodeType, deviceData, isUsed }) => {
    const { user } = useAuth();
    const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
        event.dataTransfer.setData("application/reactflow", JSON.stringify({ nodeType, deviceData }));
        event.dataTransfer.effectAllowed = "move";
    };

    const isAvailableToUser = !isUsed || (deviceData.userId === user?.id);

    return (
        <div
            className={`w-24 h-24 flex flex-col justify-center items-center transition-transform transform ${isAvailableToUser ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed'}`}
            onDragStart={isAvailableToUser ? (event) => onDragStart(event, nodeType) : undefined}
            draggable={isAvailableToUser}
        >
            <div className="w-12 h-12 mb-2">
                {nodeSvg}
            </div>
            <p className={`text-sm text-gray-700 ${isAvailableToUser ? 'line-through' : ''}`}>
                {deviceData.name}
            </p>
            {deviceData.userId && deviceData.userId !== user?.id &&
                <span className="block text-xs text-red-500">
                    In use
                </span>
            }
        </div>
    );
};

export default DraggableItem;