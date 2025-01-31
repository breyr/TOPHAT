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
    return (
        <div className="flex flex-col justify-center items-center size-12">
            <Handle type="target" position={Position.Top} />
            <Icon />
            <p style={{ fontSize: "0.5rem" }}>{props.data.deviceData?.name}</p>
        </div>
    )
}
