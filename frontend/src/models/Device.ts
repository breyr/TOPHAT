import { DeviceType, IconType } from "common";

export class Device {
    id: number;
    deviceNumber: number | null;
    userId: number | null;
    topologyId: number | null;
    name: string;
    model: string;
    serialNumber: string;
    ipAddress: string;
    description: string | null;
    username: string | null;
    password: string | null;
    secretPassword: string | null;
    ports: string;
    type: DeviceType;
    icon: IconType | null;

    constructor(
        id: number,
        deviceNumber: number | null,
        userId: number | null,
        topologyId: number | null,
        name: string,
        model: string,
        serialNumber: string,
        ipAddress: string,
        description: string | null,
        username: string | null,
        password: string | null,
        secretPassword: string | null,
        ports: string,
        type: DeviceType,
        icon: IconType | null
    ) {
        this.id = id;
        this.deviceNumber = deviceNumber;
        this.userId = userId;
        this.topologyId = topologyId;
        this.name = name;
        this.model = model;
        this.serialNumber = serialNumber;
        this.ipAddress = ipAddress;
        this.description = description;
        this.username = username;
        this.password = password;
        this.secretPassword = secretPassword;
        this.ports = ports;
        this.type = type;
        this.icon = icon;
    }
}