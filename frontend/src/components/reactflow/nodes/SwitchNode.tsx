import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import Icon from '../../svg/switch_blue.svg?react';

export type SwitchNode = Node<
    {
        deviceName?: number;
    },
    'switch'
>;

export default function SwitchNode(props: NodeProps<SwitchNode>) {
    return (
        <div className="flex flex-col justify-center items-center size-12">
            <Handle type="target" position={Position.Top} />
            <Icon />
            <p style={{ fontSize: "0.5rem" }}>{props.data.deviceName}</p>
        </div>
    )
}
