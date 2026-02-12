import React, { useState, useEffect } from 'react';
import type { SumoConfig } from '../types';

interface ScriptUploaderProps {
  config: SumoConfig;
  isConnected: boolean;
  upload: (script: string) => Promise<void>;
  stopCircle: () => Promise<void>;
  addTerminalLine: (line: string) => void;
}

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
    ? `  # Especificos Martillo (YELLOW)
  ANGULO_GOLPE = \${config.ANGULO_GOLPE}
  HAMMER_SPEED = \${config.VELOCIDAD_GOLPE}
  GOLPE_REPETICIONES = \${config.GOLPE_MANUAL_REPETICIONES}`
    : `  # Especificos Pala (BLUE)
  EMBRAGUE_PALA_ACTIVO = ${config.EMBRAGUE_PALA_ACTIVO}
  LIFT_HIGH_POS = \${config.LIFT_HIGH_POS}`;

  // Model-specific hardware setup
  const modelHardware = isYellow
    ? `  # Puerto D: Motor Acción (Martillo)
  motor_action = Motor(Port.D)
  # Puerto C: Sensor de Fuerza
  sensor_impacto = ForceSensor(Port.C)`
    : `  # Puerto D: Motor Acción (Elevación Pala)
  motor_action = Motor(Port.D)
  # Puerto C: Motor Inclinación
  motor_inclinacion = Motor(Port.C)
  # Embrague en Puerto C si está activo
  if EMBRAGUE_PALA_ACTIVO:
      motor_inclinacion.control.limits(actuation=20)`;

  // Model-specific functions
  const modelFunctions = isYellow
    ? `def accion_martillo():
    """Ejecuta el golpe de martillo."""
    for _ in range(GOLPE_REPETICIONES):
        motor_action.run_angle(HAMMER_SPEED, ANGULO_GOLPE, wait=False)`
    : `def accion_pala():
    """Mueve la pala hacia arriba/abajo."""
    if EMBRAGUE_PALA_ACTIVO:
        motor_inclinacion.run_until_stalled(-100, duty_limit=30)
    motor_action.run_target(500, LIFT_HIGH_POS, wait=False)`;

  return `from pybricks.hubs import PrimeHub, InventorHub
from pybricks.pupdevices import Motor, ColorSensor
from pybricks.parameters import Port, Direction, Stop, Color
from pybricks.robotics import DriveBase
from pybricks.tools import wait, StopWatch

try:
    hub = PrimeHub()
except:
    hub = InventorHub()

class SumoConfig:
  """Configuración del robot SUMO."""
  # Parámetros de movimiento
  VELOCIDAD_BASE = ${config.VELOCIDAD_BASE}
  VELOCIDAD_BUSQUEDA = ${config.VELOCIDAD_BUSQUEDA}
  ACELERACION = ${config.ACELERACION}
  VELOCIDAD_GIRO = ${config.VELOCIDAD_GIRO}
  
${modelParams}
  
  # Control y timing
  TIMEOUT_BUSQUEDA = ${config.TIMEOUT_BUSQUEDA}
  RETROCESO_DISTANCIA = ${config.RETROCESO_DISTANCIA}
  RETROCESO_VELOCIDAD = ${config.RETROCESO_VELOCIDAD}
  GIRO_BUSQUEDA_ANGULO = ${config.GIRO_BUSQUEDA_ANGULO}

config = SumoConfig()

# === HARDWARE SETUP ===
${modelHardware}

# Motores de tracción
motor_left = Motor(Port.${config.MOTOR_LEFT_PORT}, Direction.${config.MOTOR_LEFT_DIRECTION})
motor_right = Motor(Port.${config.MOTOR_RIGHT_PORT}, Direction.${config.MOTOR_RIGHT_DIRECTION})

# DriveBase
robot = DriveBase(
    motor_left, motor_right,
    wheel_diameter=${config.WHEEL_DIAMETER},
    axle_track=${config.AXLE_TRACK}
)

# Sensor de color
color_sensor = ColorSensor(Port.${config.COLOR_SENSOR_PORT})

# === FUNCIONES ===

${modelFunctions}

def detectar_linea():
    """Detecta si el sensor está sobre la línea blanca del borde."""
    return color_sensor.reflection() > ${config.UMBRAL_BLANCO}

def retroceder_y_girar():
    """Retrocede y gira al detectar el borde."""
    robot.straight(-config.RETROCESO_DISTANCIA)
    robot.turn(config.GIRO_BUSQUEDA_ANGULO)

def buscar_oponente():
    """Gira buscando al oponente."""
    robot.drive(0, config.VELOCIDAD_GIRO)

def atacar():
    """Avanza a máxima velocidad."""
    robot.drive(config.VELOCIDAD_BASE, 0)

# === PROGRAMA PRINCIPAL ===

hub.light.on(Color.${config.HUB_LIGHT_COLOR})
print("SUMO ROBOT READY")
wait(${config.STARTUP_DELAY})

timer = StopWatch()

while True:
    if detectar_linea():
        retroceder_y_girar()
        timer.reset()
    else:
        if timer.time() > config.TIMEOUT_BUSQUEDA:
            buscar_oponente()
        else:
            atacar()
    
    wait(10)
`;
}

function ScriptUploader({ config, isConnected, upload, stopCircle, addTerminalLine }: ScriptUploaderProps) {
  const [script, setScript] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Generate script when config changes
  useEffect(() => {
    const generatedScript = generateFullScript(config);
    setScript(generatedScript);
  }, [config]);

  const handleUploadAndRun = async () => {
    if (!isConnected) {
      addTerminalLine('❌ Error: No hay conexión con el hub');
      return;
    }

    setIsUploading(true);
    addTerminalLine('📤 Subiendo script al hub...');

    try {
      await upload(script);
      addTerminalLine('✅ Script subido y ejecutándose');
    } catch (error) {
      addTerminalLine(`❌ Error al subir script: ${error}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleStop = async () => {
    addTerminalLine('⏹️ Deteniendo programa...');
    try {
      await stopCircle();
      addTerminalLine('✅ Programa detenido');
    } catch (error) {
      addTerminalLine(`❌ Error al detener: ${error}`);
    }
  };

  return (
    <div className="script-uploader">
      <div className="script-controls">
        <button
          onClick={handleUploadAndRun}
          disabled={!isConnected || isUploading}
          className="btn-primary"
        >
          {isUploading ? '⏳ Subiendo...' : '▶️ SUBIR Y EJECUTAR'}
        </button>
        <button
          onClick={handleStop}
          disabled={!isConnected}
          className="btn-secondary"
        >
          ⏹️ DETENER
        </button>
      </div>

      <div className="script-editor">
        <h3>Script Python (Editable)</h3>
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          className="script-textarea"
          rows={20}
          spellCheck={false}
        />
      </div>
    </div>
  );
}

export default ScriptUploader;
