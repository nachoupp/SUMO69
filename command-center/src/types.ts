export type RobotModel = "YELLOW" | "BLUE" | "TEST";
export type SearchMode = "Tornado" | "Zig-Zag";
export type Action = "ATAQUE_MANUAL" | "TURBO_PUSH" | "GIRO_180" | "RITUAL_360" | "MARCHAS" | "EMBRAGUE_PALA" | "NADA";

export interface ButtonMapping {
    LEFT: Action;
    RIGHT: Action;
}

export interface SumoConfig {
    ROBOT_MODEL: RobotModel;
    MARCHAS_CAJA: number[];
    SENSIBILIDAD_GIRO: number;     // 0.5 - 2.0
    ACELERACION_BASE: number;      // 100 - 1000
    ESTRATEGIA_ARIETE: boolean;
    DIST_RETROCESO: number;

    // Yellow Specific
    ANGULO_GOLPE: number;          // 0 - 180
    VELOCIDAD_GOLPE: number;       // 200 - 1000
    GOLPE_MANUAL_REPETICIONES: number; // 1 - 3

    // Blue Specific
    EMBRAGUE_PALA_ACTIVO: boolean;
    LIFT_HIGH_POS: number;

    // Common
    DISTANCIA_ATAQUE: number;      // 50 - 500mm
    VELOCIDAD_GIRO_BUSQUEDA: number; // 100 - 400
    MODO_BUSQUEDA: SearchMode;
    VOLUMEN_GENERAL: number;       // 0 - 10
    OPERAR_TUMBADO: boolean;       // Toggle
    PERSISTENCIA_FLASH: boolean;   // Toggle
    CANAL_HACKER: number;          // 0 - 255 (Hub Channel)

    INDICE_CARA: number;
    MODO_FANTASMA: boolean;
    UMBRAL_LINEA: number;
    MAPEO_ACCIONES: Record<number, ButtonMapping>;
}

export const DEFAULT_CONFIG: SumoConfig = {
    ROBOT_MODEL: "YELLOW",
    MARCHAS_CAJA: [30, 60, 100],
    SENSIBILIDAD_GIRO: 1.0,
    ACELERACION_BASE: 500,
    ESTRATEGIA_ARIETE: true,
    DIST_RETROCESO: 150,

    ANGULO_GOLPE: 180,
    VELOCIDAD_GOLPE: 1000,
    GOLPE_MANUAL_REPETICIONES: 1,

    EMBRAGUE_PALA_ACTIVO: true,
    LIFT_HIGH_POS: 320,

    DISTANCIA_ATAQUE: 300,
    VELOCIDAD_GIRO_BUSQUEDA: 200,
    MODO_BUSQUEDA: "Zig-Zag",
    VOLUMEN_GENERAL: 4,
    OPERAR_TUMBADO: false,
    PERSISTENCIA_FLASH: false,
    CANAL_HACKER: 0,

    INDICE_CARA: 5,
    MODO_FANTASMA: false,
    UMBRAL_LINEA: 35,
    MAPEO_ACCIONES: {
        0: { LEFT: "RITUAL_360", RIGHT: "MARCHAS" },
        1: { LEFT: "GIRO_180", RIGHT: "ATAQUE_MANUAL" },
        2: { LEFT: "NADA", RIGHT: "GIRO_180" },
        3: { LEFT: "NADA", RIGHT: "NADA" },
    }
};
