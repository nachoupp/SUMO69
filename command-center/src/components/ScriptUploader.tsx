import React, { useState } from 'react';
import { usePybricksBle } from '../hooks/usePybricksBle';
import { Upload, StopCircle, Copy, Check } from 'lucide-react';
import type { SumoConfig } from '../types';

/**
 * Generates the full Pybricks script based on the current configuration.
 * This mirrors the logic used in CodeExporter to ensure the exact same script
 * is sent to the Hub.
 */
function generateFullScript(config: SumoConfig): string {
    if (config.ROBOT_MODEL === 'TEST') {
        return `from pybricks.hubs import PrimeHub, InventorHub
from pybricks.parameters import Color
from pybricks.tools import wait

# --- TEST CONNECTION SCRIPT ---
try:
    hub = PrimeHub()
except:
    hub = InventorHub()

hub.light.on(Color.GREEN)
hub.display.text("OK")
print("SYSTEM_ONLINE: CONNECTION VERIFIED")
wait(2000)
`;
    }

    const BASE_SCRIPT = `from pybricks.hubs import PrimeHub, InventorHub
from pybricks.pupdevices import Motor, UltrasonicSensor, Remote, ColorSensor, ForceSensor
from pybricks.parameters import Button, Color, Direction, Port, Side, Icon, Stop
from pybricks.robotics import DriveBase
from pybricks.tools import wait, StopWatch

# ==============================================================================
# === LIVE CONFIG ===
ROBOT_MODEL = "%ROBOT_MODEL%"
MARCHAS_CAJA = %MARCHAS_CAJA%
SENSIBILIDAD_GIRO = %SENSIBILIDAD_GIRO%
ESTRATEGIA_ARIETE = %ESTRATEGIA_ARIETE%
DIST_RETROCESO = %DIST_RETROCESO%

# Específicos Azul
EMBRAGUE_PALA_ACTIVO = %EMBRAGUE_PALA_ACTIVO%
LIFT_HIGH_POS = %LIFT_HIGH_POS%

# Específicos Amarillo
ANGULO_GOLPE = %ANGULO_GOLPE%
VELOCIDAD_GOLPE = %VELOCIDAD_GOLPE%

# Comunes
VOLUMEN_GENERAL = %VOLUMEN_GENERAL%
UMBRAL_LINEA = %UMBRAL_LINEA%
# ==============================================================================

# --- HARDWARE SETUP ---
try: hub = PrimeHub()
except: hub = InventorHub()
hub.speaker.volume(VOLUMEN_GENERAL * 10)

# Seguridad: Puerto B siempre prioridad
sensor_suelo = ColorSensor(Port.B) 
# Puerto A: Ojos
sensor_ojos = UltrasonicSensor(Port.A)
# Puertos E/F: Tracción DriveBase
l_mot = Motor(Port.F, Direction.COUNTERCLOCKWISE)
r_mot = Motor(Port.E, Direction.CLOCKWISE)
db = DriveBase(l_mot, r_mot, 56, 80)

# Model Specific Hardware
if ROBOT_MODEL == "YELLOW":
    # Puerto D: Motor Martillo
    mot_arma = Motor(Port.D)
    # Puerto C: Sensor de Fuerza
    sensor_impacto = ForceSensor(Port.C)
else:
    # Puerto D: Motor Elevación
    mot_lift = Motor(Port.D)
    # Puerto C: Motor Inclinación
    mot_tilt = Motor(Port.C)

# --- LOGIC & MODES ---
m_idx = 0 # [0: VERDE, 1: NARANJA, 2: MAGENTA, 3: AZUL]

def set_mode(n):
    global m_idx
    m_idx = n
    cols = [Color.GREEN, Color.ORANGE, Color.MAGENTA, Color.BLUE]
    hub.light.on(cols[m_idx])
    if rc: rc.light.on(cols[m_idx])

# Double Vision Logic
def show_dv(n):
    tens, units = n // 10, n % 10
    # ... (implementación de matriz LED con brillo 100/30)

# Sakura Respect Logic
def check_crash():
    if hub.imu.up() != Side.TOP:
        # KO Countdown
        hub.display.text("KO")
        wait(9000)
        sys.exit()

# Bucle Principal
while True:
    # Lógica de seguridad prioridad sensor B (Evitar suicidio)
    if sensor_suelo.reflection() < UMBRAL_LINEA:
        db.stop()
        db.straight(-100)
        db.turn(90)
    
    # ... resto de la lógica ...
    wait(20)
`;
    return BASE_SCRIPT
        .replace('%ROBOT_MODEL%', config.ROBOT_MODEL)
        .replace('%MARCHAS_CAJA%', `[${config.MARCHAS_CAJA.join(', ')}]`)
        .replace('%SENSIBILIDAD_GIRO%', config.SENSIBILIDAD_GIRO.toFixed(1))
        .replace('%ESTRATEGIA_ARIETE%', config.ESTRATEGIA_ARIETE ? 'True' : 'False')
        .replace('%DIST_RETROCESO%', config.DIST_RETROCESO.toString())
        .replace('%EMBRAGUE_PALA_ACTIVO%', config.EMBRAGUE_PALA_ACTIVO ? 'True' : 'False')
        .replace('%LIFT_HIGH_POS%', config.LIFT_HIGH_POS.toString())
        .replace('%ANGULO_GOLPE%', config.ANGULO_GOLPE.toString())
        .replace('%VELOCIDAD_GOLPE%', config.VELOCIDAD_GOLPE.toString())
        .replace('%VOLUMEN_GENERAL%', config.VOLUMEN_GENERAL.toString())
        .replace('%UMBRAL_LINEA%', config.UMBRAL_LINEA.toString());
}

export const ScriptUploader: React.FC<{ config: SumoConfig }> = ({ config }) => {
    const { isConnected, writeRaw, output, clearOutput } = usePybricksBle();
    const [uploading, setUploading] = useState(false);
    const [copied, setCopied] = useState(false);

    // Generate script on the fly so it's always visible
    const script = React.useMemo(() => generateFullScript(config), [config]);

    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    const uploadAndExecute = async () => {
        if (!isConnected) return;
        setUploading(true);
        clearOutput();

        const encoder = new TextEncoder();
        const bytes = encoder.encode(script);

        try {
            // 1. Interrupt (Ctrl+C) - 0x03
            console.log("Sending Ctrl+C...");
            await writeRaw(new Uint8Array([0x03]));
            await delay(100);

            // 2. Paste Mode (Ctrl+E) - 0x05
            console.log("Sending Ctrl+E (Paste Mode)...");
            await writeRaw(new Uint8Array([0x05]));
            // Wait for Paste Mode to be ready
            await delay(200);

            // 3. Transfer (Chunking 20 bytes max for NUS MTU safety)
            console.log(`Uploading ${bytes.length} bytes...`);
            for (let i = 0; i < bytes.length; i += 20) {
                const chunk = bytes.slice(i, i + 20);
                await writeRaw(chunk);
                // 15ms delay to prevent buffer overflow
                await delay(15);
            }

            // 4. Soft Reboot & Run (Ctrl+D) - 0x04
            console.log("Sending Ctrl+D (Reset & Run)...");
            await writeRaw(new Uint8Array([0x04]));
        } catch (e) {
            console.error("Upload failed:", e);
        } finally {
            setUploading(false);
        }
    };

    const stopRobot = async () => {
        if (!isConnected) return;
        await writeRaw(new Uint8Array([0x03])); // Ctrl+C
    };

    return (
        <div className="flex flex-col gap-2 p-2 border-t border-white/10">
            <div className="flex gap-2">
                <button
                    onClick={uploadAndExecute}
                    disabled={!isConnected || uploading}
                    className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-bold transition-colors ${uploading ? 'bg-neon-orange/20 border-neon-orange/50 text-neon-orange' : 'bg-neon-green/20 border-neon-green/50 text-neon-green hover:bg-neon-green/30'}`}
                >
                    <Upload className="w-4 h-4" />
                    {uploading ? 'UPLOADING...' : 'UPLOAD & EXECUTE'}
                </button>
                <button
                    onClick={stopRobot}
                    disabled={!isConnected}
                    className="flex items-center gap-1 px-3 py-1 rounded text-sm font-bold bg-red-600/10 border-red-600/30 text-red-600 hover:bg-red-600/20"
                >
                    <StopCircle className="w-4 h-4" />
                    STOP
                </button>
            </div>

            {/* Script preview */}
            {script && (
                <div className="mt-2 cyber-box p-2 bg-black/30 border border-white/5">
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-neon-green text-xs">Generated Script</span>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(script);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                            }}
                            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                        >
                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copied ? 'COPIED' : 'COPY'}
                        </button>
                    </div>
                    <div className="h-48 overflow-auto custom-scrollbar bg-black/50 p-2 rounded">
                        <pre className="text-[10px] text-slate-300 font-mono whitespace-pre-wrap">{script}</pre>
                    </div>
                </div>
            )}

            {/* Console output from the hub */}
            <div className="flex flex-col gap-1 mt-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Terminal Output</span>
                <div className="h-32 overflow-auto custom-scrollbar bg-black/20 p-2 rounded text-xs text-slate-300 font-mono border border-white/5">
                    <pre>{output || <span className="text-slate-600 italic">No output...</span>}</pre>
                </div>
            </div>
        </div>
    );
};
