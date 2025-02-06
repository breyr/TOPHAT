import { Accordion, AccordionItem as Item } from "@szhsin/react-accordion";
import { ChevronDown, EthernetPort, Server, SquareTerminal } from "lucide-react";
import { useEffect, useState } from "react";
import ConnectionsTable from "../components/table/ConnectionsTable";
import LabDevicesTable from "../components/table/LabDevicesTable";
import { useAuth } from "../hooks/useAuth";
import { Device } from "../models/Device";
import InterconnectDeviceCard from "./InterconnectDeviceCard";

interface AccordionItemProps {
    header: React.ReactNode;
    isFirst?: boolean;
    isLast?: boolean;
    children: React.ReactNode;
}

const AccordionItem = ({ header, isFirst, isLast, children, ...rest }: AccordionItemProps) => (
    <Item
        {...rest}
        header={({ state: { isEnter } }) => (
            <div className="flex flex-row justify-between items-center w-full">
                <div className="flex-grow accordion-header">{header}</div>
                <ChevronDown className={`transition-transform duration-200 ${isEnter ? "rotate-180" : ""}`} />
            </div>
        )}
        className=""
        buttonProps={{
            className: ({ isEnter }) =>
                `flex w-full p-4 text-left border-2 hover:bg-gray-100 ${isEnter ? "bg-gray-100" : ""} ${isFirst ? "rounded-t-lg border-t-2" : ""} ${isLast && !isEnter ? "rounded-b-lg border-t-0" : "rounded-b-none border-t-0"
                }`
        }}
        contentProps={{
            className: `transition-height duration-200 ease-out`
        }}
        panelProps={{ className: ({ isEnter }) => `border-t-0 border-2 ${isLast && isEnter ? "rounded-b-lg" : ""}` }}
    >
        {children}
    </Item>
);

export default function DeviceManagement() {
    const { authenticatedApiClient } = useAuth();
    const [firstInterconnectDevice, setFirstInterconnectDevice] = useState<Device | null>(null);
    const [secondInterconnectDevice, setSecondInterconnectDevice] = useState<Device | null>(null);
    const [mergedInterconnectDevices, setMergedInterconnectDevices] = useState<Device[]>([]);
    const [labDevices, setLabDevices] = useState<Device[]>([]);

    useEffect(() => {
        const fetchInterconnectDevices = async () => {
            try {
                const res = await authenticatedApiClient.getDevicesByType('INTERCONNECT');
                setFirstInterconnectDevice(res.data?.filter(d => d.deviceNumber == 1)[0] ?? null);
                setSecondInterconnectDevice(res.data?.filter(d => d.deviceNumber == 2)[0] ?? null);
            } catch (error) {
                console.error("Failed to fetch interconnect devices:", error);
            }
        };
        const fetchLabDevices = async () => {
            try {
                const res = await authenticatedApiClient.getDevicesByType('LAB');
                setLabDevices(res.data || []);
            } catch (error) {
                console.error("Failed to fetch lab devices:", error);
            }
        };

        fetchInterconnectDevices();
        fetchLabDevices();
    }, [authenticatedApiClient]);

    useEffect(() => {
        const devices: Device[] = [];
        if (firstInterconnectDevice) devices.push(firstInterconnectDevice);
        if (secondInterconnectDevice) devices.push(secondInterconnectDevice);
        setMergedInterconnectDevices(devices);
    }, [firstInterconnectDevice, secondInterconnectDevice]);

    return (
        <div className="flex-grow w-full">
            <Accordion allowMultiple transition transitionTimeout={200}>
                <AccordionItem header={<div className="flex flex-row items-center gap-2"><Server className="mr-2" /> Interconnect Devices</div>} isFirst>
                    <div className="flex flex-row justify-center items-center gap-20">
                        <InterconnectDeviceCard deviceNumber={1} deviceInformation={firstInterconnectDevice} setDeviceInformation={setFirstInterconnectDevice} />
                        <InterconnectDeviceCard deviceNumber={2} deviceInformation={secondInterconnectDevice} setDeviceInformation={setSecondInterconnectDevice} />
                    </div>
                </AccordionItem>
                <AccordionItem header={<div className="flex flex-row items-center gap-2"><SquareTerminal className="mr-2" /> Lab Devices</div>}>
                    <LabDevicesTable labDevices={labDevices} setLabDevices={setLabDevices} />
                </AccordionItem>
                <AccordionItem header={<div className="flex flex-row items-center gap-2"><EthernetPort className="mr-2" /> Connections</div>} isLast>
                    <ConnectionsTable interconnectDevices={mergedInterconnectDevices} labDevices={labDevices} />
                </AccordionItem>
            </Accordion>
        </div>
    )
}
