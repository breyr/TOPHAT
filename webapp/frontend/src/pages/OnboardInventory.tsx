import { Accordion, AccordionItem as Item } from "@szhsin/react-accordion";
import { ArrowRight, ChevronDown, EthernetPort, Server, SquareTerminal } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Device, DeviceType, IconType } from "../../../common/shared-types";
import ConnectionsTable from "../components/table/ConnectionsTable";
import InterconnectDevicesTable from "../components/table/InterconnectDevicesTable";
import LabDevicesTable from "../components/table/LabDevicesTable";
import { useAuth } from "../hooks/useAuth";
import { InterconnectDevice, LabDevice, useOnboardingStore } from "../stores/onboarding";

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
    const { authenticatedApiClient } = useAuth();
    const { step, setStep, labDevices, interconnectDevices } = useOnboardingStore(
        (state) => state,
    )
    const navigateTo = useNavigate();
    const [isLoading, setIsLoading] = useState(false);


    // handle bulk creation of devices only
    const handleDeviceBulkCreation = async () => {
        const devicesToRegister: Partial<Device>[] = [
            ...interconnectDevices.map((d: InterconnectDevice) => ({
                userId: null,
                topologyId: null,
                name: d.deviceName,
                model: d.model,
                serialNumber: d.serialNumber,
                ipAddress: d.ipAddress,
                description: null,
                password: d.password,
                username: d.username,
                secretPassword: d.secretPassword,
                ports: d.ports,
                type: 'INTERCONNECT' as DeviceType, // Set type to 'INTERCONNECT'
                icon: null, // null because this isn't a draggable device for topologies
            })),
            ...labDevices.map((d: LabDevice) => ({
                userId: null,
                topologyId: null,
                name: d.deviceName,
                model: d.model,
                serialNumber: d.serialNumber,
                ipAddress: null,
                description: d.description,
                password: null,
                username: null,
                secretPassword: null,
                ports: d.ports,
                type: 'LAB' as DeviceType, // Set type to 'LAB'
                icon: d.icon.toUpperCase() as IconType, // Set the icon based on the device
            }))
        ];

        // Call your API to register devices
        await authenticatedApiClient.createDeviceBulk(devicesToRegister);
    };

    const handleNext = async () => {
        setIsLoading(true);
        try {
            await handleDeviceBulkCreation();
            setStep(step + 1);
            navigateTo('/onboard/finish');
        } catch (error) {
            console.error('Error during bulk device creation:', error);
        } finally {
            setIsLoading(false);
        }
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
                <button className="r-btn primary w-1/5 flex flex-row items-center justify-center gap-1" onClick={handleNext} disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Continue'} <ArrowRight size={20} />
                </button>
            }
        </section>
    )
}