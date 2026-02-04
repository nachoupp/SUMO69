# SUMO Command Center V25

Web application for configuring and controlling LEGO SUMO robots (Yellow/Hammer & Blue/Loader) running Pybricks firmware.

![Project Banner](public/logo.png)

## 🚀 Features

### 🤖 Bot Creation Wizard
- Step-by-step configuration for robot profiles.
- Support for **Yellow (Hammer)** and **Blue (Loader)** models.
- Custom parameter tuning (Speed, Angles, Strategies).
- **Pybricks-Safe Naming**: Automatically sanitizes names for compatibility.

### 🎨 Matrix Designer
- Visual editor for the 3x3 LED matrix on the Hub.
- Library system to **Save** and **Delete** custom designs.
- Pre-loaded presets (Skull, Star, Arrows, etc.).

### 📡 Bluetooth Connectivity (NUS)
Implements the **Nordic UART Service (NUS)** for robust communication with Pybricks Hubs.
- **Protocol**: Ctrl+C (Interrupt) → Ctrl+E (Paste Mode) → 20-byte Chunks (15ms delay) → Ctrl+D (Execute).
- **Dual-Filter Scanning**: Detects generic Pybricks advertisements and connects via NUS.
- **Live Terminal**: Displays `print()` output and Python errors from the Hub in real-time.

### 📜 Script Generation
- Generates complete MicroPython scripts tailored to the selected model.
- **Model-Specific Params**: 
  - `ANGULO_GOLPE`, `ACTION_SPEED` for Hammer.
  - `LIFT_HIGH_POS`, `EMBRAGUE_PALA` for Loader.
- **Hardware Safety**: Enforces port mappings and safety checks (e.g., IMU orientation).

## 🛠️ Usage

1. **Connect**: Click the Bluetooth icon to scan and pair with your LEGO Hub.
2. **Configure**: Use the **Workshop** to create a new bot or edit an existing one.
3. **Upload**: Click **UPLOAD & EXECUTE** to send the code. The app handles the Safe-Paste protocol automatically.
4. **Monitor**: Watch the **Terminal Output** for status messages and errors.

## 🔧 Technical Details

- **Stack**: React + TypeScript + Vite + TailwindCSS.
- **Deployment**: Vercel (https://sumo69.vercel.app).
- **Bluetooth UUIDs**:
  - Service: `6e400001-b5a3-f393-e0a9-e50e24dcca9e`
  - RX (Write): `6e400002-...`
  - TX (Notify): `6e400003-...`

## 📦 Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## ⚠️ Important Notes

- **IMU Orientation**: Configured for **Hub USB Port facing FRONT**.
- **Stop Button**: Sends `0x03` (Ctrl+C) for immediate interrupt.
