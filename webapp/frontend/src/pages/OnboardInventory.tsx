import { Accordion, AccordionItem as Item } from "@szhsin/react-accordion";
import { ChevronDown, EthernetPort, Server, SquareTerminal } from "lucide-react";
import InterconnectDevicesTable from "../components/table/InterconnectDevicesTable";
import LabDevicesTable from "../components/table/LabDevicesTable";

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
            className: `transition-height duration-200 ease-out `
        }}
        panelProps={{ className: ({ isEnter }) => `border-t-0 border-2 ${isLast && isEnter ? "rounded-b-lg" : ""}` }}
    >
        {children}
    </Item>
);

export default function OnboardInventoryPage() {
    return (
        <section className="flex flex-col h-full w-full pt-8 items-center">
            <h1 className="text-4xl font-bold mb-4">Device Inventory</h1>
            <div className="w-full">
                <Accordion transition transitionTimeout={200}>
                    <AccordionItem header={<div className="flex flex-row items-center gap-2"><EthernetPort className="mr-2" /> Interconnect Devices</div>} isFirst>
                        <InterconnectDevicesTable />
                    </AccordionItem>
                    <AccordionItem header={<div className="flex flex-row items-center gap-2"><Server className="mr-2" /> Lab Devices</div>}>
                        <LabDevicesTable />
                    </AccordionItem>
                    <AccordionItem header={<div className="flex flex-row items-center gap-2"><SquareTerminal className="mr-2" /> Physical Connections</div>} isLast>
                        test
                    </AccordionItem>
                </Accordion>
            </div>
        </section>
    )
}