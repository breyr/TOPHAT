import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import { Device } from "../../../models/Device";
import Icon from '../../svg/external_blue.svg?react';

export type ExternalNode = Node<
    {
        deviceData?: Device;
    },
    'external'
>;

export default function ExternalNode(props: NodeProps<ExternalNode>) {
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
