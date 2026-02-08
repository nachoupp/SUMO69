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

    // Validates script content rules (CRITICAL for Pybricks firmware)
    const validateScript = (script: string): { valid: boolean; errors: string[] } => {
        const errors: string[] = [];

        // Rule 1: Block official firmware imports
        if (script.includes("import hub")) {
            errors.push("'import hub' is from official firmware. Use 'from pybricks.hubs import ...' instead.");
        }

        // Rule 2: Must have Pybricks header
        const firstLines = script.split('\n').slice(0, 10).join('\n');
        if (!firstLines.includes("from pybricks")) {
            errors.push("Script must begin with Pybricks imports (e.g., 'from pybricks.hubs import InventorHub').");
        }

        // Rule 3: Check for common mistakes
        if (script.includes("\t")) {
            errors.push("Script contains tabs. Pybricks prefers 4-space indentation.");
        }

        return { valid: errors.length === 0, errors };
    };

    // Validates filename rules for Pybricks compatibility
    const validateFilename = (name: string): { valid: boolean; error?: string } => {
        // Must end with .py
        if (!name.endsWith('.py')) {
            return { valid: false, error: "Filename must end with .py extension." };
        }

        const baseName = name.slice(0, -3); // Remove .py

        // Only lowercase letters, numbers, underscores
        const validPattern = /^[a-z0-9_]+$/;
        if (!validPattern.test(baseName)) {
            return { valid: false, error: "Filename can only contain lowercase letters, numbers, and underscores. No spaces, dashes, or special characters." };
        }

        return { valid: true };
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

    // Emergency STOP - sends only Ctrl+C to immediately interrupt
    const sendStop = useCallback(async () => {
        if (!rxCharRef.current) {
            console.warn("Cannot send STOP - not connected");
            return;
        }
        try {
            console.log("🛑 EMERGENCY STOP: Sending Ctrl+C...");
            await writeRaw(new Uint8Array([0x03]));
            setState(prev => ({
                ...prev,
                output: prev.output + "\n>>> STOP signal sent\n"
            }));
        } catch (err) {
            console.error("STOP command failed:", err);
        }
    }, [writeRaw]);

    // Full Upload Protocol: Ctrl+C -> Ctrl+E -> Chunks -> Ctrl+D
    // Uses strict Pybricks NUS protocol with proper timing
    const uploadScript = useCallback(async (script: string): Promise<{ success: boolean; errors?: string[] }> => {
        if (!rxCharRef.current) {
            return { success: false, errors: ["Not connected to Hub"] };
        }

        try {
            // 1. Validate script content
            console.log("📋 Step 1: Validating script...");
            const validation = validateScript(script);
            if (!validation.valid) {
                console.error("Validation failed:", validation.errors);
                setState(prev => ({
                    ...prev,
                    error: validation.errors.join(" | ")
                }));
                return { success: false, errors: validation.errors };
            }

            const encoder = new TextEncoder();
            const bytes = encoder.encode(script);

            // 2. Interrupt any running code (Ctrl+C) - 0x03
            console.log("🛑 Step 2: Sending Ctrl+C (Stop)...");
            await writeRaw(new Uint8Array([0x03]));
            await delay(100);

            // 3. Enter Paste Mode (Ctrl+E) - 0x05
            // CRITICAL: This disables auto-indent that corrupts Python whitespace
            console.log("📝 Step 3: Sending Ctrl+E (Paste Mode)...");
            await writeRaw(new Uint8Array([0x05]));
            await delay(200); // Wait for Hub to enter paste mode

            // 4. Chunked Transfer (20 bytes max per BLE MTU)
            console.log(`📤 Step 4: Uploading ${bytes.length} bytes in ${Math.ceil(bytes.length / 20)} chunks...`);
            for (let i = 0; i < bytes.length; i += 20) {
                const chunk = bytes.slice(i, i + 20);
                await writeRaw(chunk);
                // 18ms delay (sweet spot in 15-20ms range) to prevent buffer overflow
                await delay(18);
            }

            // 5. Execute (Ctrl+D) - 0x04 triggers Soft Reboot
            console.log("🚀 Step 5: Sending Ctrl+D (Execute)...");
            await writeRaw(new Uint8Array([0x04]));

            console.log("✅ Upload complete!");
            return { success: true };

        } catch (err) {
            console.error("❌ Upload Protocol Failed:", err);
            const errorMsg = err instanceof Error ? err.message : "Upload failed";
            setState(prev => ({
                ...prev,
                error: errorMsg
            }));
            return { success: false, errors: [errorMsg] };
        }
    }, [writeRaw]);

    return {
        ...state,
        connect,
        disconnect,
        sendCommand,
        writeRaw,
        uploadScript,
        sendStop,
        validateScript,
        validateFilename,
        clearOutput
    };
}
