import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import Icon from '../../svg/server_blue.svg?react';

export type ServerNode = Node<
    {
        deviceName?: number;
    },
    'server'
>;

export default function ServerNode(props: NodeProps<ServerNode>) {
    return (
        <div className="flex flex-col justify-center items-center size-12">
            <Handle type="target" position={Position.Top} />
            <Icon />
            <p style={{ fontSize: "0.5rem" }}>{props.data.deviceName}</p>
        </div>
    )
}
