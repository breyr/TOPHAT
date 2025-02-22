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
    initialEntered?: boolean;
    children: React.ReactNode;
}

const AccordionItem = ({ header, children, ...rest }: AccordionItemProps) => (
    <Item
        {...rest}
        header={({ state: { isEnter } }) => (
            <div className="flex flex-row justify-between items-center w-full py-2 border-b-2">
                <div className="flex-grow accordion-header">{header}</div>
                <ChevronDown className={`transition-transform duration-200 ${isEnter ? "rotate-180" : ""}`} />
            </div>
        )}
        className="w-full"
        buttonProps={{
            className: () => "w-full"
        }}
        contentProps={{
            className: `transition-height duration-200 ease-out`
        }}
    >
        {children}
    </Item>
);

interface DeviceAccordionProps {
    labDevices: Device[];
    usedDevices: Set<string>;
}

export default function DeviceAccordion({ labDevices, usedDevices }: DeviceAccordionProps) {
    const [routers, setRouters] = useState<DraggableItemProps[]>([]);
    const [switches, setSwitches] = useState<DraggableItemProps[]>([]);
    const [servers, setServers] = useState<DraggableItemProps[]>([]);
    const [externalDevices, setExternalDevices] = useState<DraggableItemProps[]>([]);

    useEffect(() => {
        setRouters(labDevices.filter(d => d.icon === 'ROUTER').map(d => ({
            nodeSvg: <RouterSvg />, // Replace with your actual SVG component
            nodeType: 'Router',
            deviceData: d,
            isUsed: usedDevices.has(d.name)
        })));
        setSwitches(labDevices.filter(d => d.icon === 'SWITCH').map(d => ({
            nodeSvg: <SwitchSvg />, // Replace with your actual SVG component
            nodeType: 'Switch',
            deviceData: d,
            isUsed: usedDevices.has(d.name)
        })));
        setServers(labDevices.filter(d => d.icon === 'SERVER').map(d => ({
            nodeSvg: <ServerSvg />, // Replace with your actual SVG component
            nodeType: 'Server',
            deviceData: d,
            isUsed: usedDevices.has(d.name)
        })));
        setExternalDevices(labDevices.filter(d => d.icon === 'EXTERNAL').map(d => ({
            nodeSvg: <ExternalSvg />, // Replace with your actual SVG component
            nodeType: 'External',
            deviceData: d,
            isUsed: usedDevices.has(d.name)
        })));
    }, [labDevices, usedDevices]);

    return (
        <div className="flex-grow w-full">
            <Accordion allowMultiple transition transitionTimeout={200}>
                <AccordionItem header={<div className="flex flex-row items-center gap-2"><RouterIcon className="mr-2 size-8" /> <span className="text-xl">Routers</span></div>} initialEntered>
                    <DragAndDropContainer devices={routers} />
                </AccordionItem>
                <AccordionItem header={<div className="flex flex-row items-center gap-2"><SwitchIcon className="mr-2 size-8" /> <span className="text-xl">Switches</span></div>} initialEntered>
                    <DragAndDropContainer devices={switches} />
                </AccordionItem>
                <AccordionItem header={<div className="flex flex-row items-center gap-2"><ExternalIcon className="mr-2 size-8" /> <span className="text-xl">External</span></div>} initialEntered>
                    <DragAndDropContainer devices={externalDevices} />
                </AccordionItem>
                <AccordionItem header={<div className="flex flex-row items-center gap-2"><ServerIcon className="mr-2 size-8" /> <span className="text-xl">Servers</span></div>} initialEntered>
                    <DragAndDropContainer devices={servers} />
                </AccordionItem>
            </Accordion>
        </div>
    )
}
