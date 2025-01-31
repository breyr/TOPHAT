import { Accordion, AccordionItem as Item } from "@szhsin/react-accordion";
import { ChevronDown } from "lucide-react";
import ExternalIcon from "../../svg/external_gray.svg?react";
import RouterIcon from "../../svg/router_gray.svg?react";
import ServerIcon from "../../svg/server_gray.svg?react";
import SwitchIcon from "../../svg/switch_gray.svg?react";

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


export default function DeviceAccordion() {
    return (
        <div className="flex-grow w-full">
            <Accordion transition transitionTimeout={200}>
                <AccordionItem header={<div className="flex flex-row items-center gap-2"><RouterIcon className="mr-2 size-8" /> Routers</div>} isFirst>
                    <p>data</p>
                </AccordionItem>
                <AccordionItem header={<div className="flex flex-row items-center gap-2"><SwitchIcon className="mr-2 size-8" /> Switches</div>}>
                    <p>data</p>
                </AccordionItem>
                <AccordionItem header={<div className="flex flex-row items-center gap-2"><ExternalIcon className="mr-2 size-8" /> External</div>}>
                    <p>data</p>
                </AccordionItem>
                <AccordionItem header={<div className="flex flex-row items-center gap-2"><ServerIcon className="mr-2 size-8" /> Servers</div>} isLast>
                    <p>data</p>
                </AccordionItem>
            </Accordion>
        </div>
    )
}
