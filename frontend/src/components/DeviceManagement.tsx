import { Accordion, AccordionItem as Item } from "@szhsin/react-accordion";
import { ChevronDown, EthernetPort, Server, SquareTerminal } from "lucide-react";
import { useEffect, useState } from "react";
import ConnectionsTable from "../components/table/ConnectionsTable";
import InterconnectDevicesTable from "../components/table/InterconnectDevicesTable";
import LabDevicesTable from "../components/table/LabDevicesTable";
import { useAuth } from "../hooks/useAuth";
import { Device } from "../models/Device";

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
    const [interconnectDevices, setInterconnectDevices] = useState<Device[]>([]);
    const [labDevices, setLabDevices] = useState<Device[]>([]);

    useEffect(() => {
        const fetchInterconnectDevices = async () => {
            try {
                const res = await authenticatedApiClient.getDevicesByType('INTERCONNECT');
                setInterconnectDevices(res.data || []);
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

    return (
        <div className="flex-grow w-full">
            <Accordion transition transitionTimeout={200}>
                <AccordionItem header={<div className="flex flex-row items-center gap-2"><Server className="mr-2" /> Interconnect Devices</div>} isFirst>
                    <InterconnectDevicesTable interconnectDevices={interconnectDevices} setInterconnectDevices={setInterconnectDevices} />
                </AccordionItem>
                <AccordionItem header={<div className="flex flex-row items-center gap-2"><SquareTerminal className="mr-2" /> Lab Devices</div>}>
                    <LabDevicesTable labDevices={labDevices} setLabDevices={setLabDevices} />
                </AccordionItem>
                <AccordionItem header={<div className="flex flex-row items-center gap-2"><EthernetPort className="mr-2" /> Connections</div>} isLast>
                    <ConnectionsTable interconnectDevices={interconnectDevices} labDevices={labDevices} />
                </AccordionItem>
            </Accordion>
        </div>
    )
}
