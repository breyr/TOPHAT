import { Accordion, AccordionItem as Item } from "@szhsin/react-accordion";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Device } from "../../../models/Device";
import ExternalSvg from "../../svg/external_blue.svg?react";
import ExternalIcon from "../../svg/external_gray.svg?react";
import RouterSvg from "../../svg/router_blue.svg?react";
import RouterIcon from "../../svg/router_gray.svg?react";
import ServerSvg from "../../svg/server_blue.svg?react";
import ServerIcon from "../../svg/server_gray.svg?react";
import SwitchSvg from "../../svg/switch_blue.svg?react";
import SwitchIcon from "../../svg/switch_gray.svg?react";
import DragAndDropContainer from "./DragAndDropContainer";
import { DraggableItemProps } from "./DraggableItem";

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
                `flex w-full p-4 text-left border-2 hover:bg-gray-100 ${isEnter ? "bg-gray-100" : ""} ${isFirst ? "border-t-2" : ""} ${isLast && !isEnter ? "border-t-0" : "rounded-b-none border-t-0"
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

interface DeviceAccordionProps {
    labDevices: Device[];
}

export default function DeviceAccordion({ labDevices }: DeviceAccordionProps) {
    const [routers, setRouters] = useState<DraggableItemProps[]>([]);
    const [switches, setSwitches] = useState<DraggableItemProps[]>([]);
    const [servers, setServers] = useState<DraggableItemProps[]>([]);
    const [externalDevices, setExternalDevices] = useState<DraggableItemProps[]>([]);

    useEffect(() => {
        setRouters(labDevices.filter(d => d.icon === 'ROUTER').map(d => ({
            nodeSvg: <RouterSvg />, // Replace with your actual SVG component
            nodeType: 'Router',
            deviceData: d
        })));
        setSwitches(labDevices.filter(d => d.icon === 'SWITCH').map(d => ({
            nodeSvg: <SwitchSvg />, // Replace with your actual SVG component
            nodeType: 'Switch',
            deviceData: d
        })));
        setServers(labDevices.filter(d => d.icon === 'SERVER').map(d => ({
            nodeSvg: <ServerSvg />, // Replace with your actual SVG component
            nodeType: 'Server',
            deviceData: d
        })));
        setExternalDevices(labDevices.filter(d => d.icon === 'EXTERNAL').map(d => ({
            nodeSvg: <ExternalSvg />, // Replace with your actual SVG component
            nodeType: 'External',
            deviceData: d
        })));
    }, [labDevices]);

    return (
        <div className="flex-grow w-full">
            <Accordion transition transitionTimeout={200}>
                <AccordionItem header={<div className="flex flex-row items-center gap-2"><RouterIcon className="mr-2 size-8" /> Routers</div>} isFirst>
                    <DragAndDropContainer devices={routers} />
                </AccordionItem>
                <AccordionItem header={<div className="flex flex-row items-center gap-2"><SwitchIcon className="mr-2 size-8" /> Switches</div>}>
                    <DragAndDropContainer devices={switches} />
                </AccordionItem>
                <AccordionItem header={<div className="flex flex-row items-center gap-2"><ExternalIcon className="mr-2 size-8" /> External</div>}>
                    <DragAndDropContainer devices={externalDevices} />
                </AccordionItem>
                <AccordionItem header={<div className="flex flex-row items-center gap-2"><ServerIcon className="mr-2 size-8" /> Servers</div>} isLast>
                    <DragAndDropContainer devices={servers} />
                </AccordionItem>
            </Accordion>
        </div>
    )
}
