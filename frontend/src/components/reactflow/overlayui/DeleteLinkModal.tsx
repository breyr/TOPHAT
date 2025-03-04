import { Spinner } from "@material-tailwind/react";
import { useEdges } from "@xyflow/react";
import { Cable, Undo2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useEscapeKey } from "../../../hooks/useEscapeKey";
import { useLinkOperations } from "../../../hooks/useLinkOperations";
import { Device } from "../../../models/Device";
import { CustomEdge } from "../../../types/frontend";
import { MultiSelect, Option } from "../../MultiSelect";

interface DeleteLinkModalProps {
    deviceData?: Device;
    onClose: () => void;
}

export default function DeleteLinkModal({ deviceData, onClose }: DeleteLinkModalProps) {
    const { deleteLinkBulk } = useLinkOperations();
    const edges = useEdges<CustomEdge>();
    const [availableConnections, setAvailableConnections] = useState<Option[]>([]);
    const [selectedConnections, setSelectedConnections] = useState<Set<Option>>(new Set());
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    useEscapeKey(onClose);

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
        deleteLinkBulk(selectedConnections);
        setIsDeleting(false);
    };

    return (
        <section className="bg-zinc-950 bg-opacity-50 w-full h-full fixed top-0 left-0 flex items-center justify-center z-50">
            <div className="bg-[#ffffff] w-2/5 p-6 rounded-lg shadow-lg">
                <div className="flex flex-row justify-between items-center">
                    <h3 className="text-xl font-bold">Delete Link(s) for {deviceData?.name || "Lab Devices"}</h3>
                    <button onClick={onClose} className="r-btn text-blue-400 hover:text-blue-500 flex items-center">
                        Back <Undo2 className="ml-1" size={18} />
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