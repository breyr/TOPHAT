import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import { Device } from "../../../models/Device";
import Icon from '../../svg/switch_blue.svg?react';

export type SwitchNode = Node<
    {
        deviceData?: Device;
    },
    'switch'
>;

export default function SwitchNode(props: NodeProps<SwitchNode>) {
    const { selected } = props;

    return (
        <div className={`flex flex-col justify-center items-center size-12 border rounded p-1 ${selected ? 'border-gray-300' : 'border-transparent'}`}>
            <Handle type="target" position={Position.Top} className="bg-transparent" />
            <Icon />
            <p style={{ fontSize: "0.5rem" }}>{props.data.deviceData?.name}</p>
        </div>
    );
}
