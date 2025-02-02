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
    return (
        <div className="relative flex flex-col justify-center items-center">
            <div className="relative">
                <div className="size-8">
                    <Icon />
                </div>
                <Handle
                    type="source"
                    id="source"
                    position={Position.Right}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-transparent"
                    style={{ width: 10, height: 10 }}
                    isConnectable={false}
                />
                <Handle
                    type="target"
                    id="target"
                    position={Position.Left}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-transparent"
                    style={{ width: 10, height: 10 }}
                    isConnectable={false}
                />
            </div>
            <p className="absolute" style={{ bottom: '-1rem', fontSize: '0.5rem' }}>
                {props.data.deviceData?.name}
            </p>
        </div>
    );
}
