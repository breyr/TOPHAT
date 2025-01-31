import DraggableItem, { DraggableItemProps } from "./DraggableItem";

interface DragAndDropContainerProps {
    devices: DraggableItemProps[];
}

export default function DragAndDropContainer({ devices }: DragAndDropContainerProps) {
    return (
        <div className="flex overflow-y-auto h-full p-2">
            {
                devices.length > 0 ? (
                    devices.map((item, index) => (
                        <DraggableItem
                            nodeSvg={item.nodeSvg}
                            nodeType={item.nodeType}
                            deviceData={item.deviceData}
                            key={index}
                        />
                    ))
                ) : (
                    <p>No devices.</p>
                )
            }
        </div>
    );
}