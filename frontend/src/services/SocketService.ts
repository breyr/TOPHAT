import { io, Socket } from "socket.io-client";

class SocketService {
    private static instance: SocketService;
    private socket: Socket | null = null;
    private connecting: boolean = false;

    private constructor() {
        this.initSocket();
    }

    private initSocket() {
        if (this.socket || this.connecting) return;

        this.connecting = true;

        try {
            this.socket = io({
                path: '/hub',
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });
        } catch (error) {
            console.error('Failed to init socket', error);
            this.connecting = false;
        }
    }

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    public getSocket(): Socket {
        if (!this.socket) {
            throw new Error("Socket not initialized");
        }
        return this.socket;
    }

    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connecting = false;
        }
    }

    public isConnected() {
        return this.socket?.connected || false;
    }
}

export default SocketService;