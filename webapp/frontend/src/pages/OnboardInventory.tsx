import { Accordion, AccordionItem as Item } from "@szhsin/react-accordion";
import { ArrowRight, ChevronDown, EthernetPort, Server, SquareTerminal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ConnectionsTable from "../components/table/ConnectionsTable";
import InterconnectDevicesTable from "../components/table/InterconnectDevicesTable";
import LabDevicesTable from "../components/table/LabDevicesTable";
import { useOnboardingStore } from "../stores/onboarding";

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
    const { step, setStep, labDevices, interconnectDevices } = useOnboardingStore(
        (state) => state,
    )
    const navigateTo = useNavigate();

    const handleNext = () => {
        setStep(step + 1);
        navigateTo('/onboard/finish');
    };

    return (
        <section className="flex flex-col h-full w-full pt-8 items-center">
            <h1 className="text-4xl font-bold mb-4">Device Inventory</h1>
            <div className="flex-grow w-full">
                <Accordion transition transitionTimeout={200}>
                    <AccordionItem header={<div className="flex flex-row items-center gap-2"><Server className="mr-2" /> Interconnect Devices</div>} isFirst>
                        <InterconnectDevicesTable />
                    </AccordionItem>
                    <AccordionItem header={<div className="flex flex-row items-center gap-2"><SquareTerminal className="mr-2" /> Lab Devices</div>}>
                        <LabDevicesTable />
                    </AccordionItem>
                    <AccordionItem header={<div className="flex flex-row items-center gap-2"><EthernetPort className="mr-2" /> Connections</div>} isLast>
                        <ConnectionsTable />
                    </AccordionItem>
                </Accordion>
            </div>
            {labDevices.length > 0 && interconnectDevices.length > 0 &&
                <p className="text-blue-500 font-semibold text-lg flex items-center hover:text-blue-600 hover:cursor-pointer" onClick={handleNext}>
                    Continue <ArrowRight size={20} />
                </p>
            }
        </section>
    )
}