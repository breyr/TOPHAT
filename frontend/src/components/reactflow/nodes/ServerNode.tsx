import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import { Device } from "../../../models/Device";
import Icon from '../../svg/server_blue.svg?react';

export type ServerNode = Node<
    {
        deviceData?: Device;
    },
    'server'
>;

export default function ServerNode(props: NodeProps<ServerNode>) {
    return (
        <div className="flex flex-col justify-center items-center size-12">
            <Handle type="target" position={Position.Top} />
            <Icon />
            <p style={{ fontSize: "0.5rem" }}>{props.data.deviceData?.name}</p>
        </div>
    )
}
