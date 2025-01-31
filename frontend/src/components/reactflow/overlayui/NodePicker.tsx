import { CirclePlus } from "lucide-react";
import { useState } from "react";
import DeviceAccordion from "./DeviceAccordion";

export default function NodePicker() {
    const [showItems, setShowItems] = useState(false);

    return (
        <div className="fixed right-0 h-full flex flex-col justify-center">
            {/* Sliding Panel */}
            <div
                className={`
                h-full w-[400px] 
                transform transition-transform duration-300 ease-in-out
                ${showItems ? 'translate-x-0' : 'translate-x-full'}
                border-l-2
                overflow-y-auto
                `}
            >
                <div className="p-4 h-full">
                    <DeviceAccordion />
                </div>
            </div>

            {/* Tab Button */}
            <div
                className={`
                fixed right-0
                mt-20
                transform -rotate-90 origin-top-left
                bg-blue-500 text-white cursor-pointer 
                px-4 py-2 rounded-t-md
                flex items-center gap-1
                transition-all duration-300
                ${showItems ? 'translate-x-[-287px]' : 'translate-x-[75%]'}
                `}
                onClick={() => setShowItems(!showItems)}
            >
                <CirclePlus className="mr-2" /> Add Device
            </div>
        </div>
    );
}