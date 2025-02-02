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
    const { selected } = props;

    return (
        <div className={`flex flex-col justify-center items-center size-12 border rounded p-1 ${selected ? 'border-gray-300' : 'border-transparent'}`}>
            <Handle type="target" id="target" position={Position.Top} className="bg-transparent" />
            <Handle type="source" id="source" position={Position.Top} className="bg-transparent" />
            <Icon />
            <p style={{ fontSize: "0.5rem" }}>{props.data.deviceData?.name}</p>
        </div>
    );
}
