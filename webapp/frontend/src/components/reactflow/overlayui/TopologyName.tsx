import { CircleCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function TopologyName() {
    const [topologyName, setTopologyName] = useState("Topology Name");
    const [isEditing, setIsEditing] = useState(false);
    const [inputWidth, setInputWidth] = useState(0);
    const spanRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (spanRef.current) {
            setInputWidth(spanRef.current.offsetWidth);
        }
    }, [topologyName, isEditing]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTopologyName(e.target.value);
    };

    const handleBlur = () => {
        setIsEditing(false);
    };

    const handleClick = () => {
        setIsEditing(true);
    };

    return (
        <div className="flex flex-row items-center">
            {isEditing ? (
                <input
                    value={topologyName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    autoFocus
                    style={{ width: inputWidth }}
                    className="border rounded-sm p-2 text-black"
                    placeholder="Enter topology name"
                />
            ) : (
                <div className="flex items-center cursor-pointer border border-transparent" onClick={handleClick}>
                    <span ref={spanRef} className="p-2">{topologyName}</span>
                </div>
            )}
            <CircleCheck className="ml-2 text-green-500" />
            {/* Hidden span to measure text width */}
            <span ref={spanRef} className="absolute invisible p-2">{topologyName}</span>
        </div>
    );
}