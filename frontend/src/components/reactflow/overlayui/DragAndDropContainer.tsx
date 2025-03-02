import DraggableItem, { DraggableItemProps } from "./DraggableItem";

interface DragAndDropContainerProps {
    devices: DraggableItemProps[];
}

export default function DragAndDropContainer({ devices }: DragAndDropContainerProps) {
    return (
        <div className="flex flex-wrap overflow-y-auto min-h-28 py-0">
            {
                devices.length > 0 ? (
                    devices.map((item, index) => (
                        <DraggableItem
                            nodeSvg={item.nodeSvg}
                            nodeType={item.nodeType}
                            deviceData={item.deviceData}
                            isUsed={item.isUsed}
                            key={index}
                        />
                    ))
                ) : (
                    <div className="flex justify-center items-center w-full">
                        <p className="italic text-gray-300">No devices.</p>
                    </div>
                )
            }
        </div>
    );
}