export class Connection {
    id: number;
    labDeviceName: string;
    labDevicePort: string;
    interconnectDeviceName: string;
    interconnectDevicePort: string;

    constructor(
        id: number,
        labDeviceName: string,
        labDevicePort: string,
        interconnectDeviceName: string,
        interconnectDevicePort: string
    ) {
        this.id = id;
        this.labDeviceName = labDeviceName;
        this.labDevicePort = labDevicePort;
        this.interconnectDeviceName = interconnectDeviceName;
        this.interconnectDevicePort = interconnectDevicePort;
    }
}