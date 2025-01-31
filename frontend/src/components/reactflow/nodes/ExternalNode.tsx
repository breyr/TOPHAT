import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import Icon from '../../svg/external.svg?react';

export type ExternalNode = Node<
    {
        deviceName?: number;
    },
    'external'
>;

export default function ExternalNode(props: NodeProps<ExternalNode>) {
    return (
        <div className="flex flex-col justify-center items-center size-12">
            <Handle type="target" position={Position.Top} />
            <Icon />
            <p style={{ fontSize: "0.5rem" }}>{props.data.deviceName}</p>
        </div>
    )
}
