import { Handle, Position } from "@xyflow/react";
import { useCallback } from "react";

export default function TextUpdaterNode() {
    const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
        console.log(evt.target.value);
    }, []);

    return (
        <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
            {/* <Handle type="target" position={Position.Top} /> */}
            <div className="flex flex-col">
                <label>Words:</label>
                <input
                    onChange={onChange}
                    className="nodrag border shadow-md"
                />
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                id="a"
                className="w-20 bg-teal-500"
            />
        </div>
    );
}