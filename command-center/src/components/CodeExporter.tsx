import React from 'react';
import type { SumoConfig } from '../types';
import { Terminal, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CodeExporterProps {
    config: SumoConfig;
}

// Generate model-specific script
function generateCode(config: SumoConfig): string {
    const isYellow = config.ROBOT_MODEL === 'YELLOW';

    const modelParams = isYellow
        ? `# Específicos Martillo (YELLOW)
ANGULO_GOLPE = ${config.ANGULO_GOLPE}
ACTION_SPEED = ${config.VELOCIDAD_GOLPE}
GOLPE_REPETICIONES = ${config.GOLPE_MANUAL_REPETICIONES}`
        : `# Específicos Pala (BLUE)
EMBRAGUE_PALA_ACTIVO = True
LIFT_HIGH_POS = ${config.LIFT_HIGH_POS}`;

    const modelHardware = isYellow
        ? `# Puerto D: Motor Acción (Martillo)
motor_action = Motor(Port.D)
# Puerto C: Sensor de Fuerza
sensor_impacto = ForceSensor(Port.C)`
        : `# Puerto D: Motor Acción (Elevación Pala)
motor_action = Motor(Port.D)
# Puerto C: Motor Inclinación
mot_tilt = Motor(Port.C)`;

    return `from pybricks.hubs import PrimeHub, InventorHub
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
}

export const CodeExporter: React.FC<CodeExporterProps> = ({ config }) => {
    const [copied, setCopied] = useState(false);

    const generatedCode = generateCode(config);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="cyber-box flex-1 flex flex-col h-full border-white/5 bg-black/40">
            <div className="bg-slate-900/80 px-4 py-2 border-b border-white/10 flex justify-between items-center backdrop-blur-md">
                <span className="text-neon-green text-[10px] font-bold tracking-widest uppercase flex items-center gap-2">
                    <Terminal className="w-3 h-3" />
                    Live_Config_Stream
                </span>
                <button
                    onClick={copyToClipboard}
                    className={`text-[9px] px-3 py-1 rounded transition-all font-bold flex items-center gap-1.5 border ${copied
                        ? 'bg-neon-green/20 border-neon-green text-neon-green'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'COPIED_OK' : 'COPY_CONFIG'}
                </button>
            </div>
            <div className="flex-1 p-4 overflow-auto bg-black/20 custom-scrollbar font-mono">
                <div className="bg-slate-900/50 p-3 rounded border border-white/5 relative group">
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                    </div>
                    <pre className="text-[10px] text-slate-400 leading-relaxed">
                        {generatedCode.split('\n').filter(line => line.includes('LIVE CONFIG') || (line.includes('=') && !line.includes('if')) || line.startsWith('#')).map((line, i) => (
                            <div key={i} className="flex gap-4">
                                <span className="text-slate-800 w-4 text-right select-none">{i + 1}</span>
                                <span className={
                                    line.includes('===') ? 'text-neon-green font-bold' :
                                        line.startsWith('#') ? 'text-slate-600 italic' :
                                            'text-slate-300'
                                }>
                                    {line}
                                </span>
                            </div>
                        ))}
                    </pre>
                </div>

                <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 opacity-50">
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10" />
                        <span className="text-[8px] font-bold text-slate-500 uppercase">System_Payload</span>
                        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10" />
                    </div>
                    <p className="text-[8px] text-slate-600 text-center uppercase tracking-widest leading-relaxed">
                        Payload ready for terminal injection.<br />
                        Priority level: Critical. Prot: V25.
                    </p>
                </div>
            </div>
            <div className="bg-slate-900/50 p-2 text-[7px] text-slate-500 font-mono flex justify-between border-t border-white/5">
                <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                    UPLINK_READY
                </span>
                <span>SHA-256: 0x8C...F2</span>
            </div>
        </div>
    );
};
