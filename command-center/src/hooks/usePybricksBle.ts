import { useState, useCallback, useRef } from 'react';

// Nordic UART Service (NUS) UUIDs
const NUS_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const NUS_RX_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; // Write (Central -> Peripheral)
const NUS_TX_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'; // Notify (Peripheral -> Central)

// Standard Pybricks Service UUID (Critical for discovery)
const PYBRICKS_SERVICE_UUID = 'c5f50001-8280-46da-89f4-6d8051e4aeef';

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
    const txCharRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);

    // Handler for TX characteristic notifications (Hub -> App)
    const handleCharacteristicValueChanged = useCallback((event: Event) => {
        const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
        if (!characteristic.value) return;

        // Decode bytearray as UTF-8
        const textDecoder = new TextDecoder('utf-8');
        const rawBytes = new Uint8Array(characteristic.value.buffer);
        const decodedText = textDecoder.decode(rawBytes);

        // Log to console for debugging
        console.log("[TX Notification]", decodedText);

        // Append to output state - will display in Terminal Output component
        setState(prev => ({
            ...prev,
            output: prev.output + decodedText
        }));
    }, []);

    const clearOutput = useCallback(() => {
        setState(prev => ({ ...prev, output: "" }));
    }, []);

    const disconnect = useCallback(() => {
        // Remove notification listener if exists
        if (txCharRef.current) {
            txCharRef.current.removeEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
            txCharRef.current = null;
        }

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
    }, [handleCharacteristicValueChanged]);

    const connect = useCallback(async () => {
        setState(prev => ({ ...prev, isConnecting: true, error: null }));

        // Timeout after 15 seconds
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Connection timeout - device not responding")), 15000)
        );

        const attemptConnection = async () => {
            try {
                console.log("1. Requesting Pybricks/NUS device...");
                // Scanning for both Pybricks (discovery) and NUS (comms)
                const device = await navigator.bluetooth.requestDevice({
                    filters: [
                        { services: [PYBRICKS_SERVICE_UUID] }, // Standard Hub advertisement
                        { services: [NUS_SERVICE_UUID] }       // Direct NUS advertisement
                    ],
                    optionalServices: [NUS_SERVICE_UUID, PYBRICKS_SERVICE_UUID] // Allowed services after connect
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
                txCharRef.current = txChar;

                // Setup Notifications on TX (6e400003) for receiving Hub output
                console.log("6. Starting notifications on TX characteristic...");
                await txChar.startNotifications();
                txChar.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
                console.log("✓ TX Notifications enabled - Hub output will appear in Terminal");

                console.log("✓ Connected successfully via NUS!");
                setState({
                    isConnected: true,
                    isConnecting: false,
                    deviceName: device.name || "NUS Device",
                    error: null,
                    output: ">>> Connected to Hub. TX notifications active.\n"
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

    // Helper delay
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    // Validates script content rules
    const validateScript = (script: string): void => {
        if (script.includes("import hub")) {
            throw new Error("Validation Error: 'import hub' is banned. Use 'from pybricks.hubs import ...'");
        }
        if (!script.includes("from pybricks")) {
            throw new Error("Validation Error: Script must start with Pybricks imports.");
        }
    };

    // Write raw bytes directly to RX
    const writeRaw = useCallback(async (bytes: Uint8Array) => {
        if (!rxCharRef.current) return;
        try {
            // Create a new Uint8Array with its own ArrayBuffer to satisfy TypeScript
            const buffer = new Uint8Array(bytes).buffer;
            await rxCharRef.current.writeValue(buffer);
        } catch (err) {
            console.error("Write Raw Error:", err);
            throw err; // Propagate error for uploadScript handling
        }
    }, []);

    // Full Upload Protocol: Ctrl+C -> Ctrl+E -> Chunks -> Ctrl+D
    const uploadScript = useCallback(async (script: string) => {
        if (!rxCharRef.current) throw new Error("Not connected");

        try {
            // 1. Validate
            console.log("Validating script...");
            validateScript(script);

            const encoder = new TextEncoder();
            const bytes = encoder.encode(script);

            // 2. Interrupt (Ctrl+C) - 0x03
            console.log("Protocol: Sending Ctrl+C...");
            await writeRaw(new Uint8Array([0x03]));
            await delay(100);

            // 3. Paste Mode (Ctrl+E) - 0x05
            console.log("Protocol: Sending Ctrl+E (Paste Mode)...");
            await writeRaw(new Uint8Array([0x05]));
            await delay(200); // Wait for Hub to be ready

            // 4. Chunked Transfer (20 bytes max)
            console.log(`Protocol: Uploading ${bytes.length} bytes...`);
            for (let i = 0; i < bytes.length; i += 20) {
                const chunk = bytes.slice(i, i + 20);
                await writeRaw(chunk);
                // 20ms delay to prevent buffer overflow (Pybricks recommends 10-100ms depending on device)
                await delay(20);
            }

            // 5. Execute (Ctrl+D) - 0x04
            console.log("Protocol: Sending Ctrl+D (Reset & Run)...");
            await writeRaw(new Uint8Array([0x04]));

        } catch (err) {
            console.error("Upload Protocol Failed:", err);
            setState(prev => ({
                ...prev,
                error: err instanceof Error ? err.message : "Upload failed"
            }));
            throw err;
        }
    }, [writeRaw]);

    return {
        ...state,
        connect,
        disconnect,
        sendCommand,
        writeRaw,
        uploadScript,
        clearOutput
    };
}
