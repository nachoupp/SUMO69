import React, { useMemo } from 'react';
import type { RobotModel } from '../types';

interface HubVisualizerProps {
    number: number;
    mode: number;
    doubleVision: boolean;
    ghostMode: boolean;
    showIcon?: boolean;
    robotModel: RobotModel;
    highlightedPort?: string | null;
}

const FONT_MAP: Record<number, string[]> = {
    0: ["09990", "09090", "09090", "09090", "09990"],
    1: ["00900", "09900", "00900", "00900", "09990"],
    2: ["09990", "00090", "09990", "09000", "09990"],
    3: ["09990", "00090", "09990", "00090", "09990"],
    4: ["09090", "09090", "09990", "00090", "00090"],
    5: ["09990", "09000", "09990", "00090", "09990"],
    6: ["09990", "09000", "09990", "09090", "09990"],
    7: ["09990", "00090", "00900", "00900", "00900"],
    8: ["09990", "09090", "09990", "09090", "09990"],
    9: ["09990", "09090", "09990", "00090", "09990"]
};

const KANJI_DAI = [
    "00900",
    "99999",
    "00900",
    "09090",
    "90009"
];

const MODE_COLORS = ['#10b981', '#f59e0b', '#d946ef', '#0ea5e9'];
const MODE_NAMES = ['DRIVE', 'ACTION', 'AUTO', 'MENTAL'];

export const HubVisualizer: React.FC<HubVisualizerProps> = ({
    number,
    mode,
    doubleVision,
    ghostMode,
    showIcon = false,
    robotModel,
    highlightedPort = null
}) => {
    const activeColor = MODE_COLORS[mode % MODE_COLORS.length];

    const matrix = useMemo(() => {
        const n = Math.max(0, Math.min(99, Math.floor(number)));
        const tens = Math.floor(n / 10);
        const units = n % 10;

        const rows = Array(5).fill(0).map(() => Array(5).fill(0));

        if (ghostMode && (mode === 2 || mode === 3)) return rows;

        if (showIcon && mode === 2) {
            for (let r = 0; r < 5; r++) {
                for (let c = 0; c < 5; c++) {
                    if (KANJI_DAI[r][c] === '9') rows[r][c] = 100;
                }
            }
            return rows;
        }

        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                let brightness = 0;
                if (doubleVision) {
                    if (FONT_MAP[tens][r][c] === '9') brightness = 100;
                    if (FONT_MAP[units][r][c] === '9') brightness = Math.max(brightness, 30);
                } else {
                    if (FONT_MAP[units][r][c] === '9') brightness = 100;
                }
                rows[r][c] = brightness;
            }
        }
        return rows;
    }, [number, mode, doubleVision, ghostMode, showIcon]);

    const renderPort = (id: string, label: string, colorClass: string) => {
        const isHighlighted = highlightedPort === id;
        return (
            <div className="flex flex-col items-center relative">
                {isHighlighted && (
                    <div className="absolute -inset-2 bg-white/20 rounded-xl animate-pulse -z-10 border border-white/40" />
                )}
                <div className={`w-8 h-8 border-2 ${isHighlighted ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.6)]' : 'border-slate-700'} bg-slate-800 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:border-${colorClass} transition-all duration-300`}>
                    {id}
                </div>
                <span className={`text-[7px] mt-1 uppercase tracking-tighter ${isHighlighted ? 'text-white font-bold' : 'text-slate-500'}`}>
                    {label}
                </span>
            </div>
        );
    };

    return (
        <div className="relative w-[340px] h-96 bg-slate-900 rounded-[3rem] border-8 border-slate-800 p-6 flex items-center justify-between shadow-[0_0_40px_rgba(0,0,0,0.5)] holographic overflow-hidden group gap-4">

            {/* Left Column: A, C, E */}
            <div className="flex flex-col justify-between h-full py-2 z-10">
                {renderPort('A', 'Eyes_Ultra', 'neon-green')}
                {renderPort('C', robotModel === 'YELLOW' ? 'Sensor_Force' : robotModel === 'BLUE' ? 'Motor_Tilt' : '---', 'neon-blue')}
                {renderPort('E', 'Drive_R', 'neon-green')}
            </div>

            {/* Center Hub Matrix */}
            <div className="flex flex-col items-center gap-6 z-10 relative">
                {/* Hub Background Logo/Label */}
                <div className="absolute -top-6 text-[8px] font-bold tracking-[0.3em] text-slate-700 uppercase">Hub_Core</div>

                <div className="bg-black/80 p-3 rounded-xl border border-white/5 shadow-inner">
                    <div className="grid grid-cols-5 gap-1.5">
                        {matrix.map((row, r) =>
                            row.map((brightness, c) => (
                                <div
                                    key={`${r}-${c}`}
                                    className="w-4 h-4 rounded-sm transition-all duration-300"
                                    style={{
                                        backgroundColor: brightness > 0 ? activeColor : '#1e293b',
                                        opacity: brightness / 100 + 0.05,
                                        boxShadow: brightness > 0 ? `0 0 12px ${activeColor}` : 'none'
                                    }}
                                />
                            ))
                        )}
                    </div>
                </div>

                <div className="relative">
                    <div
                        className="w-12 h-12 rounded-full border-4 border-white/10 transition-all duration-500"
                        style={{
                            backgroundColor: activeColor,
                            boxShadow: `0 0 30px ${activeColor}`
                        }}
                    />
                    <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-[8px] font-bold tracking-[0.2em] whitespace-nowrap opacity-50" style={{ color: activeColor }}>
                        MODE_{MODE_NAMES[mode]}
                    </div>
                </div>
            </div>

            {/* Right Column: B, D, F */}
            <div className="flex flex-col justify-between h-full py-2 z-10">
                {renderPort('B', 'Safety_Color', 'neon-orange')}
                {renderPort('D', robotModel === 'YELLOW' ? 'Motor_Hammer' : robotModel === 'BLUE' ? 'Motor_Lift' : '---', 'neon-magenta')}
                {renderPort('F', 'Drive_L', 'neon-green')}
            </div>
        </div>
    );
};
