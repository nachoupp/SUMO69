import { useState, useCallback, useRef } from 'react';

// Nordic UART Service (NUS) UUIDs
const NUS_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const NUS_RX_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; // Write (Central -> Peripheral)
const NUS_TX_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'; // Notify (Peripheral -> Central)

export interface BluetoothState {
    isConnected: boolean;
    isConnecting: boolean;
    deviceName: string | null;
    error: string | null;
    output: string;
}

export function usePybricksBle() {
    const [state, setState] = useState<BluetoothState>({
        isConnected: false,
        isConnecting: false,
        deviceName: null,
        error: null,
        output: ""
    });

    const deviceRef = useRef<BluetoothDevice | null>(null);
    const serverRef = useRef<BluetoothRemoteGATTServer | null>(null);
    const rxCharRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);

    const handleCharacteristicValueChanged = (event: Event) => {
        const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
        if (!characteristic.value) return;

        // Raw UTF-8 data from NUS TX
        const textDecoder = new TextDecoder();
        const value = textDecoder.decode(characteristic.value);
        setState(prev => ({ ...prev, output: prev.output + value }));
    };

    const clearOutput = useCallback(() => {
        setState(prev => ({ ...prev, output: "" }));
    }, []);

    const disconnect = useCallback(() => {
        if (deviceRef.current && deviceRef.current.gatt?.connected) {
            deviceRef.current.gatt.disconnect();
        }
        setState({
            isConnected: false,
            isConnecting: false,
            deviceName: null,
            error: null,
            output: ""
        });
        deviceRef.current = null;
        serverRef.current = null;
        rxCharRef.current = null;
    }, []);

    const connect = useCallback(async () => {
        setState(prev => ({ ...prev, isConnecting: true, error: null }));

        // Timeout after 15 seconds
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Connection timeout - device not responding")), 15000)
        );

        const attemptConnection = async () => {
            try {
                console.log("1. Requesting NUS device...");
                const device = await navigator.bluetooth.requestDevice({
                    filters: [
                        { services: [NUS_SERVICE_UUID] }
                    ],
                    optionalServices: [NUS_SERVICE_UUID]
                });

                console.log("2. Device found:", device.name);
                deviceRef.current = device;

                device.addEventListener('gattserverdisconnected', () => {
                    console.log("Device disconnected");
                    disconnect();
                });

                console.log("3. Connecting to GATT...");
                const server = await device.gatt?.connect();
                if (!server) throw new Error("Could not connect to GATT Server");
                serverRef.current = server;

                console.log("4. Getting NUS service...");
                const service = await server.getPrimaryService(NUS_SERVICE_UUID);

                console.log("5. Getting standard NUS characteristics...");
                const rxChar = await service.getCharacteristic(NUS_RX_UUID);
                const txChar = await service.getCharacteristic(NUS_TX_UUID);
                rxCharRef.current = rxChar;

                // Setup Notifications on TX
                console.log("6. Starting notifications on TX...");
                await txChar.startNotifications();
                txChar.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
                console.log("✓ Notifications enabled");

                console.log("✓ Connected successfully via NUS!");
                setState({
                    isConnected: true,
                    isConnecting: false,
                    deviceName: device.name || "NUS Device",
                    error: null,
                    output: ""
                });

            } catch (err) {
                console.error("❌ Connection failed:", err);
                setState(prev => ({
                    ...prev,
                    isConnecting: false,
                    error: err instanceof Error ? err.message : "Connection failed"
                }));
                throw err;
            }
        };

        try {
            await Promise.race([attemptConnection(), timeout]);
        } catch (err) {
            console.error("❌ Connection failed:", err);
            setState(prev => ({
                ...prev,
                isConnecting: false,
                error: err instanceof Error ? err.message : "Connection failed"
            }));
        }
    }, [disconnect]);

    // Send a string command (Raw bytes)
    const sendCommand = useCallback(async (text: string) => {
        if (!rxCharRef.current) return;
        try {
            const encoder = new TextEncoder();
            const payload = encoder.encode(text);
            await rxCharRef.current.writeValue(payload);
        } catch (err) {
            console.error("Send Error:", err);
        }
    }, []);

    // Write raw bytes directly to RX
    const writeRaw = useCallback(async (bytes: Uint8Array) => {
        if (!rxCharRef.current) return;
        try {
            // Create a new Uint8Array with its own ArrayBuffer to satisfy TypeScript
            const buffer = new Uint8Array(bytes).buffer;
            await rxCharRef.current.writeValue(buffer);
        } catch (err) {
            console.error("Write Raw Error:", err);
        }
    }, []);

    return {
        ...state,
        connect,
        disconnect,
        sendCommand,
        writeRaw,
        clearOutput
    };
}
