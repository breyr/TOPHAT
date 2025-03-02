import { EmitTypes } from 'common';
import { useCallback, useEffect, useState } from "react";
import SocketService from "../services/SocketService";

export const useSocket = () => {
    const socketService = SocketService.getInstance();
    const [connected, setConnected] = useState(socketService.isConnected());

    useEffect(() => {
        try {
            const socket = socketService.getSocket();

            const onConnect = () => setConnected(true);
            const onDisconnect = () => setConnected(false);

            socket.on('connect', onConnect);
            socket.on('disconnect', onDisconnect);

            // intitial state
            setConnected(socket.connected);

            // cleanup function - runs when either
            // 1. Component using this hook unmounts
            // 2. The effect is about to run again
            return () => {
                // remove listeners
                socket.off('connect', onConnect);
                socket.off('disconnect', onDisconnect);
            }
        } catch (error) {
            console.error("Error accesing socket in hook", error);
            return () => { }
        }
    }, []); // empty dependency - runs only on mount/unmount

    const emit = useCallback((event: EmitTypes, ...args: any[]) => {
        try {
            socketService.getSocket().emit(event, ...args);
        } catch (error) {
            console.error(`Failed to emit ${event}`, error);
        }
    }, []);

    const on = useCallback((event: EmitTypes, callback: (...args: any[]) => void) => {
        try {
            const socket = socketService.getSocket();
            socket.on(event, callback);
            return () => socket.off(event, callback);
        } catch (error) {
            console.error(`Failed to subscribe to ${event}:`, error);
            return () => { };
        }
    }, []);

    return {
        connected,
        emit,
        on
    }
}