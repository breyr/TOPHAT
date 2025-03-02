import { Node, useNodes } from "@xyflow/react";
import { CircleMinus, CirclePlus } from "lucide-react";
import { useEffect, useState } from "react";
import { EmitTypes } from "../../../../../common/src/index";
import { useAuth } from "../../../hooks/useAuth";
import { useSocket } from "../../../hooks/useSocket";
import { Device } from "../../../models/Device";
import DeviceAccordion from "./DeviceAccordion";

interface CustomNode extends Node {
    data: {
        deviceData?: Device;
    }
}

export default function NodePicker() {
    const nodes = useNodes<CustomNode>();
    const { on } = useSocket();
    const { authenticatedApiClient } = useAuth();
    const [showItems, setShowItems] = useState(false);
    const [labDevices, setLabDevices] = useState<Device[]>([]);
    const [usedDevices, setUsedDevices] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchLabDevices = async () => {
            try {
                const res = await authenticatedApiClient.getDevicesByType('LAB');
                setLabDevices(res.data || []);
            } catch (error) {
                console.error("Failed to fetch lab devices:", error);
            }
        };

        fetchLabDevices();
    }, [authenticatedApiClient]);

    // get list of device names that are currently on the topology
    useEffect(() => {
        // filter out any null values and type assert
        const deviceNames = nodes.map(n => n.data.deviceData?.name).filter(Boolean) as string[];
        setUsedDevices(new Set(deviceNames));
    }, [nodes]);

    // socket listener for when devices get booked
    useEffect(() => {
        const unsubscribe = on(EmitTypes.BookDevice, (data) => {
            const bookedDevice = data.bookedDevice;

            if (bookedDevice) {
                // update device with new data
                setLabDevices((prev) => {
                    return prev.map(device => device.id === bookedDevice.id ? bookedDevice : device);
                })
            }
        });
        return unsubscribe;
    }, [on]);

    // socket listener for when devices get unbooked
    useEffect(() => {
        const unsubscribe = on(EmitTypes.UnbookDevice, (data) => {
            const unbookedDevice = data.unbookedDevice;

            if (unbookedDevice) {
                // update device with new data
                setLabDevices((prev) => {
                    return prev.map(device => device.id === unbookedDevice.id ? unbookedDevice : device);
                })
            }
        });
        return unsubscribe;
    }, [on]);

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
                bg-[#ffffff]
                `}
            >
                <div className="p-4 h-full">
                    <DeviceAccordion labDevices={labDevices} usedDevices={usedDevices} />
                </div>
            </div>

            {/* Tab Button */}
            <div
                className={`
                fixed right-0
                mt-20
                transform -rotate-90 origin-top-left
                bg-blue-500 text-[#ffffff] cursor-pointer 
                px-4 py-2 rounded-t-md
                flex items-center gap-1
                transition-all duration-300
                ${showItems ? 'translate-x-[-287px]' : 'translate-x-[75%]'}
                `}
                onClick={() => setShowItems(!showItems)}
            >
                {!showItems ? <CirclePlus className="mr-2" /> : <CircleMinus className="mr-2" />} Add Device
            </div>
        </div>
    );
}