import { Spinner } from "@material-tailwind/react";
import { Edge, useEdges, useReactFlow } from "@xyflow/react";
import { LinkRequest } from "common";
import { Cable, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useToast } from "../../../hooks/useToast";
import { Device } from "../../../models/Device";
import { MultiSelect, Option } from "../../MultiSelect";

interface DeleteLinkModalProps {
    deviceData?: Device;
    onClose: () => void;
}

interface CustomEdge extends Edge {
    data: {
        sourcePort: string;
        targetPort: string;
    }
}

export default function DeleteLinkModal({ deviceData, onClose }: DeleteLinkModalProps) {
    const { authenticatedApiClient } = useAuth();
    const { addToast, updateToast } = useToast();
    const { setEdges } = useReactFlow();
    const edges = useEdges<CustomEdge>();

    const [availableConnections, setAvailableConnections] = useState<Option[]>([]);
    const [selectedConnections, setSelectedConnections] = useState<Set<Option>>(new Set());
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    useEffect(() => {
        const edgesForDevice = edges.filter(e => e.source === deviceData?.name).map(e => ({
            value: e.id,
            label: `(${e.source}) ${e.data?.sourcePort ?? ''} -> (${e.target}) ${e.data?.targetPort ?? ''}`,
            firstLabDevice: e.source,
            firstLabDevicePort: e.data?.sourcePort ?? '',
            secondLabDevice: e.target,
            secondLabDevicePort: e.data?.targetPort ?? '',
        }));
        setAvailableConnections(edgesForDevice);
    }, [edges, deviceData]);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
          if (event.key === "Escape") {
            onClose();
          }
        };
        document.addEventListener("keydown", handleEsc);
        return () => {
          document.removeEventListener("keydown", handleEsc);
        };
      }, []);

    const handleSelectChange = (selectedOption: Option) => {
        const selectedEdges = new Set(selectedConnections);
        if (selectedEdges.has(selectedOption)) {
            selectedEdges.delete(selectedOption);
        } else {
            selectedEdges.add(selectedOption);
        }
        setSelectedConnections(selectedEdges);
    };

    const handleDeleteLinks = async () => {
        onClose();
        setIsDeleting(true);
        const deletedConnectionIds = new Set<string>();

        const deletePromises = Array.from(selectedConnections).map(async (selectedConnection) => {
            const toastId = Date.now().toString();
            const connectionLabel = selectedConnection.label;
            addToast({ id: toastId, title: 'Deleting Link', body: `Deleting ${connectionLabel}`, status: 'pending' });

            try {
                const connectionInfo = availableConnections.find(c => c.value === selectedConnection.value);
                if (!connectionInfo) {
                    updateToast(toastId, 'error', 'Connection information not found.');
                    return;
                }

                const firstDeviceConnections = await authenticatedApiClient.getConnectionsByDeviceName(connectionInfo.firstLabDevice);
                if (!connectionInfo.secondLabDevice) {
                    updateToast(toastId, 'error', 'Second lab device not selected.');
                    return;
                }
                const secondDeviceConnections = await authenticatedApiClient.getConnectionsByDeviceName(connectionInfo.secondLabDevice);

                const firstConnectionInfo = firstDeviceConnections.data?.find(c => c.labDevicePort === connectionInfo.firstLabDevicePort);
                const secondConnectionInfo = secondDeviceConnections.data?.find(c => c.labDevicePort === connectionInfo.secondLabDevicePort);

                if (!firstConnectionInfo || !secondConnectionInfo) {
                    updateToast(toastId, 'error', 'Connection information not found.');
                    return;
                }

                const interconnectDevices = await authenticatedApiClient.getDevicesByType('INTERCONNECT');
                const firstInterconnectInfo = interconnectDevices.data?.find(d => d.name === firstConnectionInfo.interconnectDeviceName);
                const secondInterconnectInfo = interconnectDevices.data?.find(d => d.name === secondConnectionInfo.interconnectDeviceName);

                if (!firstInterconnectInfo || !secondInterconnectInfo) {
                    updateToast(toastId, 'error', 'Interconnect information not found. Please message an Administrator.');
                    return;
                }

                if (firstInterconnectInfo.deviceNumber == null || firstInterconnectInfo.username == null || firstInterconnectInfo.password == null || firstInterconnectInfo.secretPassword == null ||
                    secondInterconnectInfo.deviceNumber == null || secondInterconnectInfo.username == null || secondInterconnectInfo.password == null || secondInterconnectInfo.secretPassword == null) {
                    updateToast(toastId, 'error', 'Interconnect is not configured properly. Please message an Administrator.');
                    return;
                }

                const ip1 = firstInterconnectInfo.ipAddress ?? 'none';
                const ip2 = secondInterconnectInfo.ipAddress ?? 'none';

                if (ip1 === 'none' || ip2 === 'none') {
                    updateToast(toastId, 'error', 'Interconnect is not configured properly. Please message an Administrator.');
                    return;
                }

                const removePortNumber = (port: string) => port.replace(/\/\d+$/, '/');

                const interconnect1Prefix = removePortNumber(firstConnectionInfo.interconnectDevicePort);
                const interconnect2Prefix = removePortNumber(secondConnectionInfo.interconnectDevicePort);

                const offsetPort1 = Number(firstConnectionInfo.interconnectDevicePort.split('/').pop()) * firstInterconnectInfo.deviceNumber;
                const offsetPort2 = Number(secondConnectionInfo.interconnectDevicePort.split('/').pop()) * secondInterconnectInfo.deviceNumber;

                const deleteLinkPayload: LinkRequest = {
                    interconnect1IP: ip1,
                    interconnect1Prefix,
                    interconnect2IP: ip2,
                    interconnect2Prefix,
                    interconnectPortID1: offsetPort1,
                    interconnectPortID2: offsetPort2,
                    username: firstInterconnectInfo.username,
                    password: firstInterconnectInfo.password,
                    secret: firstInterconnectInfo.secretPassword
                };

                const res = await authenticatedApiClient.clearLink(deleteLinkPayload);
                if ((res as any).status !== 'success') {
                    updateToast(toastId, 'error', 'Failed to delete link.');
                    console.error("Failed to delete link");
                    return;
                }

                updateToast(toastId, 'success', 'Successfully deleted link');
                deletedConnectionIds.add(selectedConnection.value);
            } catch (error) {
                console.error("Error deleting link:", error);
                updateToast(toastId, 'error', `Error deleting link: ${connectionLabel}. Please contact an Administrator.`);
            }
        });

        await Promise.all(deletePromises);

        // update edges to remove those deleted
        setEdges((prevEdges) => prevEdges.filter(edge => !deletedConnectionIds.has(edge.id)));
        setIsDeleting(false);
    };

    return (
        <section className="bg-zinc-950 bg-opacity-50 w-full h-full fixed top-0 left-0 flex items-center justify-center z-50">
            <div className="bg-[#ffffff] w-2/5 p-6 rounded-lg shadow-lg">
                <div className="flex flex-row justify-between items-center">
                    <h2 className="m-0">Delete Link(s) for {deviceData?.name || "Lab Devices"}</h2>
                    <button onClick={onClose} className="r-btn text-red-500 hover:text-red-700">
                        <X />
                    </button>
                </div>
                <div className="mb-4 p-4">
                    <div className="flex flex-col gap-2">
                        {
                            availableConnections.length > 0 ? (
                                <MultiSelect
                                    options={availableConnections}
                                    isDeleting={isDeleting}
                                    onChange={handleSelectChange}
                                />
                            ) : (
                                <p className="text-center p-8 italic">No available links.</p>
                            )
                        }
                    </div>
                </div>
                <div className="p-5 flex flex-row justify-end">
                    <button
                        className="r-btn primary danger flex flex-row items-center justify-center gap-1"
                        onClick={handleDeleteLinks}
                        disabled={selectedConnections.size === 0 || isDeleting}
                    >
                        {
                            !isDeleting ? <Cable /> : <Spinner color="error" />
                        }
                        Delete Link(s)
                    </button>
                </div>
            </div>
        </section>
    );
};