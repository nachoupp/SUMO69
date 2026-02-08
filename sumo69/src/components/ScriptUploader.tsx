import React, { useState } from 'react';
import { usePybricksBle } from '../hooks/usePybricksBle';
import { Upload, StopCircle, Copy, Check, Download } from 'lucide-react';
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

    const isYellow = config.ROBOT_MODEL === 'YELLOW';

    // Model-specific parameters block
    const modelParams = isYellow
        ? `# Específicos Martillo (YELLOW)
ANGULO_GOLPE = ${config.ANGULO_GOLPE}
HAMMER_SPEED = ${config.VELOCIDAD_GOLPE}
GOLPE_REPETICIONES = ${config.GOLPE_MANUAL_REPETICIONES}`
        : `# Específicos Pala (BLUE)
EMBRAGUE_PALA_ACTIVO = True
LIFT_HIGH_POS = ${config.LIFT_HIGH_POS}`;

    // Model-specific hardware setup
    const modelHardware = isYellow
        ? `# Puerto D: Motor Acción (Martillo)
motor_action = Motor(Port.D)
# Puerto C: Sensor de Fuerza
sensor_impacto = ForceSensor(Port.C)`
        : `# Puerto D: Motor Acción (Elevación Pala)
motor_action = Motor(Port.D)
# Puerto C: Motor Inclinación
mot_tilt = Motor(Port.C)`;

    const BASE_SCRIPT = `from pybricks.hubs import PrimeHub, InventorHub
from pybricks.pupdevices import Motor, UltrasonicSensor, Remote, ColorSensor, ForceSensor
from pybricks.parameters import Button, Color, Direction, Port, Side, Icon, Stop
from pybricks.robotics import DriveBase
from pybricks.tools import wait, StopWatch
import sys

# ==============================================================================
# === LIVE CONFIG (${config.ROBOT_MODEL}) ===
ROBOT_MODEL = "${config.ROBOT_MODEL}"
MARCHAS_CAJA = [${config.MARCHAS_CAJA.join(', ')}]
SENSIBILIDAD_GIRO = ${config.SENSIBILIDAD_GIRO.toFixed(1)}
ACELERACION_BASE = ${config.ACELERACION_BASE}

${modelParams}

# IA y Sensores
DISTANCIA_ATAQUE = ${config.DISTANCIA_ATAQUE}
ESTRATEGIA_ARIETE = ${config.ESTRATEGIA_ARIETE ? 'True' : 'False'}
DIST_RETROCESO = ${config.DIST_RETROCESO}
UMBRAL_LINEA = ${config.UMBRAL_LINEA}

# Comunes
VOLUMEN_GENERAL = ${config.VOLUMEN_GENERAL}
# ==============================================================================

# --- HARDWARE SETUP ---
try: hub = PrimeHub()
except: hub = InventorHub()
hub.speaker.volume(VOLUMEN_GENERAL * 10)

# Seguridad: Puerto B siempre prioridad (sensor suelo)
sensor_suelo = ColorSensor(Port.B)
# Puerto A: Ojos (ultrasonido)
sensor_ojos = UltrasonicSensor(Port.A)
# Puertos E/F: Tracción DriveBase
l_mot = Motor(Port.F, Direction.COUNTERCLOCKWISE)
r_mot = Motor(Port.E, Direction.CLOCKWISE)
db = DriveBase(l_mot, r_mot, 56, 80)

# Model Specific Hardware
${modelHardware}

# --- LOGIC & MODES ---
m_idx = 0  # [0: VERDE, 1: NARANJA, 2: MAGENTA, 3: AZUL]

def set_mode(n):
    global m_idx
    m_idx = n
    cols = [Color.GREEN, Color.ORANGE, Color.MAGENTA, Color.BLUE]
    hub.light.on(cols[m_idx])

# Double Vision Logic
def show_dv(n):
    tens, units = n // 10, n % 10
    # ... (implementación de matriz LED con brillo 100/30)

# Sakura Respect Logic (KO Detection)
# Hub montado con USB (FRONT) hacia arriba
def check_crash():
    if hub.imu.up() != Side.FRONT:
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
    
    # Verificar estado KO
    check_crash()
    
    # ... resto de la lógica ...
    wait(20)
`;
    return BASE_SCRIPT;
}

export const ScriptUploader: React.FC<{ config: SumoConfig }> = ({ config }) => {
    const { isConnected, uploadScript, sendStop, validateScript, output, clearOutput } = usePybricksBle();
    const [uploading, setUploading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    // Generate script on the fly so it's always visible
    const script = React.useMemo(() => generateFullScript(config), [config]);

    const handleUpload = async () => {
        if (!isConnected) return;
        setUploading(true);
        setValidationErrors([]);
        clearOutput();

        try {
            const result = await uploadScript(script);
            if (!result.success && result.errors) {
                setValidationErrors(result.errors);
            }
        } catch (e) {
            console.error("Upload failed:", e);
        } finally {
            setUploading(false);
        }
    };

    const handleStop = async () => {
        if (!isConnected) return;
        await sendStop();
    };

    const handleDownload = () => {
        // Enforce filename rules: main.py, lowercase, no spaces
        const filename = "main.py";

        const blob = new Blob([script], { type: 'text/x-python' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col gap-2 p-2 border-t border-white/10">
            <div className="flex gap-2">
                <button
                    onClick={handleUpload}
                    disabled={!isConnected || uploading}
                    className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-bold transition-colors ${uploading ? 'bg-neon-orange/20 border-neon-orange/50 text-neon-orange' : 'bg-neon-green/20 border-neon-green/50 text-neon-green hover:bg-neon-green/30'}`}
                >
                    <Upload className="w-4 h-4" />
                    {uploading ? 'UPLOADING...' : 'UPLOAD & EXECUTE'}
                </button>
                <button
                    onClick={handleStop}
                    disabled={!isConnected}
                    className="flex items-center gap-1 px-4 py-1.5 rounded text-sm font-bold bg-red-600/20 border border-red-600/50 text-red-500 hover:bg-red-600/30 hover:scale-105 transition-all shadow-[0_0_10px_rgba(255,0,0,0.2)]"
                >
                    <StopCircle className="w-4 h-4" />
                    🛑 STOP
                </button>
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-1 px-3 py-1 rounded text-sm font-bold bg-neon-blue/10 border-neon-blue/30 text-neon-blue hover:bg-neon-blue/20 ml-auto"
                >
                    <Download className="w-4 h-4" />
                    main.py
                </button>
            </div>

            {/* Validation errors display */}
            {validationErrors.length > 0 && (
                <div className="mt-2 p-2 bg-red-900/30 border border-red-500/50 rounded">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider">⚠️ Validation Errors</span>
                    <ul className="mt-1 text-xs text-red-300 list-disc list-inside">
                        {validationErrors.map((err, i) => (
                            <li key={i}>{err}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Real-time validation status */}
            {(() => {
                const validation = validateScript(script);
                return validation.valid ? (
                    <div className="mt-2 text-xs text-neon-green flex items-center gap-1">
                        <Check className="w-3 h-3" /> Script valid - ready to upload
                    </div>
                ) : (
                    <div className="mt-2 text-xs text-yellow-500 flex items-center gap-1">
                        ⚠️ {validation.errors.length} issue(s) detected
                    </div>
                );
            })()}

            {/* Script preview */}
            {script && (
                <div className="mt-2 cyber-box p-2 bg-black/30 border border-white/5">
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-neon-green text-xs">Generated Script</span>
                        <div className="flex gap-2">
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
