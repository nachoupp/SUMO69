import React from 'react';
import type { SumoConfig, Action } from '../types';
import { MousePointer2, Zap, AlertTriangle } from 'lucide-react';

interface ButtonMapperProps {
    config: SumoConfig;
    activeMode: number;
    onChange: (newConfig: SumoConfig) => void;
}

const MODE_NAMES = ["0: DRIVE", "1: ACTION", "2: AUTO", "3: MENTAL"];
const MODE_COLORS = ["text-neon-green", "text-neon-orange", "text-neon-magenta", "text-neon-blue"];

export const ButtonMapper: React.FC<ButtonMapperProps> = ({ config, activeMode, onChange }) => {
    const isYellow = config.ROBOT_MODEL === 'YELLOW';
    const isBlue = config.ROBOT_MODEL === 'BLUE';

    const getAvailableActions = (): Action[] => {
        const common: Action[] = ["GIRO_180", "RITUAL_360", "NADA"];
        if (activeMode === 0) return ["MARCHAS", ...common];
        if (activeMode === 1) {
            if (isYellow) return ["ATAQUE_MANUAL", "TURBO_PUSH", ...common];
            if (isBlue) return ["EMBRAGUE_PALA", ...common];
        }
        return common;
    };

    const handleActionChange = (side: 'LEFT' | 'RIGHT', action: Action) => {
        const newMapeo = { ...config.MAPEO_ACCIONES };
        newMapeo[activeMode] = { ...newMapeo[activeMode], [side]: action };
        onChange({ ...config, MAPEO_ACCIONES: newMapeo });
    };

    const currentMapping = config.MAPEO_ACCIONES[activeMode] || { LEFT: "NADA" as Action, RIGHT: "NADA" as Action };
    const actions = getAvailableActions();

    return (
        <div className="flex flex-col gap-4 p-4 cyber-box border-white/10 bg-black/40">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                    <MousePointer2 className={`w-3 h-3 ${MODE_COLORS[activeMode]}`} />
                    <h3 className={`text-[10px] font-bold tracking-[0.2em] uppercase ${MODE_COLORS[activeMode]}`}>
                        {MODE_NAMES[activeMode]} :: MAPPING
                    </h3>
                </div>
            </div>

            <div className="space-y-4">
                {/* LEFT BUTTON CONFIG */}
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            PAD_LEFT
                        </label>
                        <span className="text-[8px] text-slate-600 font-mono">ID: 0x01</span>
                    </div>
                    <select
                        value={currentMapping.LEFT}
                        onChange={(e) => handleActionChange('LEFT', e.target.value as Action)}
                        className="w-full bg-slate-900/50 border border-white/10 text-[10px] text-slate-200 p-2 rounded outline-none focus:border-white/30 transition-all font-bold tracking-tight"
                    >
                        {actions.map(action => (
                            <option key={action} value={action}>{action}</option>
                        ))}
                    </select>
                </div>

                {/* RIGHT BUTTON CONFIG */}
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            PAD_RIGHT
                        </label>
                        <span className="text-[8px] text-slate-600 font-mono">ID: 0x02</span>
                    </div>
                    <select
                        value={currentMapping.RIGHT}
                        onChange={(e) => handleActionChange('RIGHT', e.target.value as Action)}
                        className="w-full bg-slate-900/50 border border-white/10 text-[10px] text-slate-200 p-2 rounded outline-none focus:border-white/30 transition-all font-bold tracking-tight"
                    >
                        {actions.map(action => (
                            <option key={action} value={action}>{action}</option>
                        ))}
                    </select>
                </div>
            </div>

            {isBlue && activeMode === 1 && (
                <div className="mt-2 p-2 bg-neon-blue/5 rounded border border-neon-blue/20 flex gap-2">
                    <Zap className="w-3 h-3 text-neon-blue shrink-0 mt-0.5" />
                    <p className="text-[8px] text-neon-blue/80 font-bold uppercase leading-tight italic">
                        BLUE_OVERRIDE: PAD_RIGHT activates Shovel_Clutch. Movements will control Arm (D) & Scoop (C).
                    </p>
                </div>
            )}

            <div className="mt-2 p-2 bg-black/40 rounded border border-white/5 flex gap-2">
                <AlertTriangle className="w-3 h-3 text-slate-600 shrink-0 mt-0.5" />
                <p className="text-[8px] text-slate-500 font-mono italic leading-tight">
                    // Protocol: Critical combat functions. Always verify port configuration before deployment.
                </p>
            </div>
        </div>
    );
};
