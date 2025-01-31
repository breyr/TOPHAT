import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import { Device } from "../../../models/Device";
import Icon from '../../svg/router_blue.svg?react';

export type RouterNode = Node<
    {
        deviceData?: Device;
    },
    'router'
>;

export default function RouterNode(props: NodeProps<RouterNode>) {
    return (
        <div className="flex flex-col justify-center items-center size-12">
            <Handle type="target" position={Position.Top} />
            <Icon />
            <p style={{ fontSize: "0.5rem" }}>{props.data.deviceData?.name}</p>
        </div>
    )
}
