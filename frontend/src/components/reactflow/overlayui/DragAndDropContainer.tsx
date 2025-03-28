import { useAuth } from "../../../hooks/useAuth";
import DraggableItem, { DraggableItemProps } from "./DraggableItem";

interface DragAndDropContainerProps {
    devices: DraggableItemProps[];
}

export default function DragAndDropContainer({ devices }: DragAndDropContainerProps) {
    const { user } = useAuth();
    // all devices should be marked as in use when they have a value for userId that doesn't match the current user's id
    const allDevicesUsed = devices.filter((device) => device.deviceData.userId != user?.id);

    return (
        <div className="flex flex-wrap overflow-y-auto min-h-28 py-0 px-4">
            {
                devices.length === 0 ? (
                    <div className="flex justify-center items-center w-full">
                        <p className="italic text-gray-300">No devices.</p>
                    </div>
                ) : allDevicesUsed.length === 0 ? (
                    <div className="flex justify-center items-center w-full">
                        <p className="italic text-gray-300">No devices available.</p>
                    </div>
                ) : (
                    devices.map((item, index) => (
                        <DraggableItem
                            nodeSvg={item.nodeSvg}
                            nodeType={item.nodeType}
                            deviceData={item.deviceData}
                            isUsed={item.isUsed}
                            key={index}
                        />
                    ))
                )
            }
        </div>
    );
}