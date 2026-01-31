// Bot Workshop Types
import type { SumoConfig, Action } from '../types';

/**
 * 5x5 Matrix LED design for hub display
 * Pixel values: 0 = off, 50 = dim, 100 = bright
 */
export interface MatrixDesign {
    id: string;
    name: string;
    pixels: number[][];  // 5x5 grid
}

/**
 * Configuration for a single operating mode
 */
export interface ModeConfig {
    modeIndex: number;           // 0-3
    name: string;                // "Drive", "Attack", "Auto", "Custom"
    displayName: string;         // Custom user-facing name
    matrixDesign: MatrixDesign;
    centerButtonAction: Action;
    leftButtonAction: Action;
    rightButtonAction: Action;
}

/**
 * Complete bot profile with all configurations
 */
export interface BotProfile {
    id: string;
    name: string;                // "HAMMER_NINJA", "SPEED_DEMON"
    createdAt: string;           // ISO date
    updatedAt: string;
    robotModel: 'YELLOW' | 'BLUE';
    config: SumoConfig;
    modes: ModeConfig[];
    customMatrixDesigns: MatrixDesign[];
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT MATRIX DESIGNS
// ═══════════════════════════════════════════════════════════════

const O = 0;    // Off
const B = 100;  // Bright

export const DEFAULT_MATRIX_DESIGNS: MatrixDesign[] = [
    {
        id: 'skull',
        name: 'SKULL',
        pixels: [
            [O, B, B, B, O],
            [B, O, B, O, B],
            [B, B, B, B, B],
            [O, B, O, B, O],
            [O, B, B, B, O],
        ]
    },
    {
        id: 'star',
        name: 'STAR',
        pixels: [
            [O, O, B, O, O],
            [O, B, B, B, O],
            [B, B, B, B, B],
            [O, B, B, B, O],
            [B, O, B, O, B],
        ]
    },
    {
        id: 'arrow',
        name: 'ARROW',
        pixels: [
            [O, O, B, O, O],
            [O, B, B, B, O],
            [B, O, B, O, B],
            [O, O, B, O, O],
            [O, O, B, O, O],
        ]
    },
    {
        id: 'heart',
        name: 'HEART',
        pixels: [
            [O, B, O, B, O],
            [B, B, B, B, B],
            [B, B, B, B, B],
            [O, B, B, B, O],
            [O, O, B, O, O],
        ]
    },
    {
        id: 'lightning',
        name: 'LIGHTNING',
        pixels: [
            [O, O, B, B, O],
            [O, B, B, O, O],
            [B, B, B, B, B],
            [O, O, B, B, O],
            [O, B, B, O, O],
        ]
    },
    {
        id: 'target',
        name: 'TARGET',
        pixels: [
            [O, B, B, B, O],
            [B, O, O, O, B],
            [B, O, B, O, B],
            [B, O, O, O, B],
            [O, B, B, B, O],
        ]
    },
    {
        id: 'blank',
        name: 'BLANK',
        pixels: [
            [O, O, O, O, O],
            [O, O, O, O, O],
            [O, O, O, O, O],
            [O, O, O, O, O],
            [O, O, O, O, O],
        ]
    }
];

// ═══════════════════════════════════════════════════════════════
// DEFAULT MODE CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════

export const DEFAULT_MODE_CONFIGS: ModeConfig[] = [
    {
        modeIndex: 0,
        name: 'DRIVE',
        displayName: 'Conducción',
        matrixDesign: DEFAULT_MATRIX_DESIGNS[2], // Arrow
        centerButtonAction: 'MARCHAS',
        leftButtonAction: 'RITUAL_360',
        rightButtonAction: 'MARCHAS',
    },
    {
        modeIndex: 1,
        name: 'ATTACK',
        displayName: 'Combate',
        matrixDesign: DEFAULT_MATRIX_DESIGNS[0], // Skull
        centerButtonAction: 'ATAQUE_MANUAL',
        leftButtonAction: 'GIRO_180',
        rightButtonAction: 'ATAQUE_MANUAL',
    },
    {
        modeIndex: 2,
        name: 'AUTO',
        displayName: 'Automático',
        matrixDesign: DEFAULT_MATRIX_DESIGNS[5], // Target
        centerButtonAction: 'GIRO_180',
        leftButtonAction: 'NADA',
        rightButtonAction: 'GIRO_180',
    }
];

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createEmptyMatrixDesign(name: string = 'Custom'): MatrixDesign {
    return {
        id: generateId(),
        name,
        pixels: Array(5).fill(null).map(() => Array(5).fill(0))
    };
}

export function cloneMatrixDesign(design: MatrixDesign, newName?: string): MatrixDesign {
    return {
        id: generateId(),
        name: newName || `${design.name}_copy`,
        pixels: design.pixels.map(row => [...row])
    };
}
