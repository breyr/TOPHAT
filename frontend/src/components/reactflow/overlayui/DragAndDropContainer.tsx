import DraggableItem, { DraggableItemProps } from "./DraggableItem";

interface DragAndDropContainerProps {
    devices: DraggableItemProps[];
}

export default function DragAndDropContainer({ devices }: DragAndDropContainerProps) {
    const allDevicesUsed = devices.every(device => device.isUsed);

    return (
        <div className="flex flex-wrap overflow-y-auto min-h-28 py-0">
            {
                devices.length === 0 ? (
                    <div className="flex justify-center items-center w-full">
                        <p className="italic text-gray-300">No devices.</p>
                    </div>
                ) : allDevicesUsed ? (
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