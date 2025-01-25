import { CirclePlus, Minus } from "lucide-react";
import { useState } from "react";
import DragAndDropContainer from "./DragAndDropContainer";

export default function NodePicker() {
    const [showItems, setShowItems] = useState(false);

    return (
        <section className="flex flex-col justify-end">
            <button
                className="r-btn primary flex flex-row items-center justify-center gap-1"
                onClick={() => setShowItems(!showItems)}
            >
                Add Node
                {
                    !showItems
                        ? <CirclePlus size={20} />
                        : <Minus size={20} />
                }
            </button>
            {showItems && (
                <div className="bg-white shadow-lg">
                    <DragAndDropContainer />
                </div>
            )}
        </section>
    );
}