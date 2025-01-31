import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import Icon from '../../svg/router.svg?react';

export type RouterNode = Node<
    {
        deviceName?: number;
    },
    'router'
>;

export default function RouterNode(props: NodeProps<RouterNode>) {
    return (
        <div className="flex flex-col justify-center items-center size-12">
            <Handle type="target" position={Position.Top} />
            <Icon />
            <p style={{ fontSize: "0.5rem" }}>{props.data.deviceName}</p>
        </div>
    )
}
