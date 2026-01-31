import React from 'react';
import type { SumoConfig, SearchMode } from '../types';
import { Zap, Target, Volume2, Ghost, Hammer, MoveUp, RotateCcw, Save } from 'lucide-react';

interface ParameterEditorProps {
    config: SumoConfig;
    onChange: (newConfig: SumoConfig) => void;
}

export const ParameterEditor: React.FC<ParameterEditorProps> = ({ config, onChange }) => {
    const handleChange = (key: keyof SumoConfig, value: any) => {
        onChange({ ...config, [key]: value });
    };

    const isYellow = config.ROBOT_MODEL === 'YELLOW';
    const isBlue = config.ROBOT_MODEL === 'BLUE';

    return (
        <div className="flex flex-col gap-6 p-4">
            {/* 🏎️ Tracción & Marchas */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-neon-green/20 pb-1">
                    <Zap className="w-4 h-4 text-neon-green" />
                    <h3 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">PROPULSION_SYNC</h3>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Gearbox_3_Presets</label>
                    <div className="flex gap-1 overflow-x-auto custom-scrollbar pb-1">
                        {[
                            { label: 'Econ', values: [300, 500, 700] },
                            { label: 'Norm', values: [500, 750, 1000] },
                            { label: 'Pure', values: [800, 950, 1000] }
                        ].map((preset) => (
                            <button
                                key={preset.label}
                                onClick={() => handleChange("MARCHAS_CAJA", preset.values)}
                                className={`px-2 py-1 rounded text-[9px] font-bold border transition-all whitespace-nowrap ${JSON.stringify(config.MARCHAS_CAJA) === JSON.stringify(preset.values)
                                    ? "bg-neon-green/20 border-neon-green text-neon-green shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                    : "bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-500"
                                    }`}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Turn_Sensitivity</label>
                        <span className="text-[10px] text-neon-green font-mono">{config.SENSIBILIDAD_GIRO.toFixed(1)}x</span>
                    </div>
                    <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={config.SENSIBILIDAD_GIRO}
                        onChange={(e) => handleChange("SENSIBILIDAD_GIRO", parseFloat(e.target.value))}
                        className="w-full text-neon-green"
                    />
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between">
                        <label className="text-[10px] text-slate-500 font-bold uppercase" title="Qué tan rápido arranca para no patinar">Base_Acceleration ?</label>
                        <span className="text-[10px] text-neon-green font-mono">{config.ACELERACION_BASE}</span>
                    </div>
                    <input
                        type="range"
                        min="100"
                        max="1000"
                        step="50"
                        value={config.ACELERACION_BASE}
                        onChange={(e) => handleChange("ACELERACION_BASE", parseInt(e.target.value))}
                        className="w-full text-neon-green"
                    />
                </div>
            </section>

            {/* ⚔️ Modelo Amarillo: Hammer Config */}
            {isYellow && (
                <section className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-500">
                    <div className="flex items-center gap-2 border-b border-neon-orange/20 pb-1">
                        <Hammer className="w-4 h-4 text-neon-orange" />
                        <h3 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">HAMMER_MODULE</h3>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <label className="text-[10px] text-slate-500 font-bold uppercase">Strike_Velocity</label>
                            <span className="text-[10px] text-neon-orange font-mono">{config.VELOCIDAD_GOLPE}</span>
                        </div>
                        <input
                            type="range"
                            min="200"
                            max="1000"
                            step="50"
                            value={config.VELOCIDAD_GOLPE}
                            onChange={(e) => handleChange("VELOCIDAD_GOLPE", parseInt(e.target.value))}
                            className="w-full text-neon-orange accent-neon-orange"
                        />
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <label className="text-[10px] text-slate-500 font-bold uppercase">Strike_Angle</label>
                            <span className="text-[10px] text-neon-orange font-mono">{config.ANGULO_GOLPE}º</span>
                        </div>
                        <input
                            type="range"
                            min="45"
                            max="180"
                            step="5"
                            value={config.ANGULO_GOLPE}
                            onChange={(e) => handleChange("ANGULO_GOLPE", parseInt(e.target.value))}
                            className="w-full text-neon-orange accent-neon-orange"
                        />
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <label className="text-[10px] text-slate-500 font-bold uppercase" title="Golpes consecutivos al pulsar botón">Manual_Repeats ?</label>
                            <span className="text-[10px] text-neon-orange font-mono">{config.GOLPE_MANUAL_REPETICIONES}x</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="3"
                            step="1"
                            value={config.GOLPE_MANUAL_REPETICIONES}
                            onChange={(e) => handleChange("GOLPE_MANUAL_REPETICIONES", parseInt(e.target.value))}
                            className="w-full text-neon-orange accent-neon-orange"
                        />
                    </div>
                </section>
            )}

            {/* 🔩 Modelo Azul: Loader Config */}
            {isBlue && (
                <section className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-500">
                    <div className="flex items-center gap-2 border-b border-neon-blue/20 pb-1">
                        <MoveUp className="w-4 h-4 text-neon-blue" />
                        <h3 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">LOADER_MODULE</h3>
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Shovel_Clutch</label>
                        <button
                            onClick={() => handleChange("EMBRAGUE_PALA_ACTIVO", !config.EMBRAGUE_PALA_ACTIVO)}
                            className={`w-10 h-5 rounded-full transition-all relative ${config.EMBRAGUE_PALA_ACTIVO ? "bg-neon-blue shadow-[0_0_10px_rgba(14,165,233,0.5)]" : "bg-slate-700"
                                }`}
                        >
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${config.EMBRAGUE_PALA_ACTIVO ? "left-5.5" : "left-0.5"
                                }`} />
                        </button>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <label className="text-[10px] text-slate-500 font-bold uppercase">Lift_High_Pos</label>
                            <span className="text-[10px] text-neon-blue font-mono">{config.LIFT_HIGH_POS}º</span>
                        </div>
                        <input
                            type="range"
                            min="100"
                            max="500"
                            step="10"
                            value={config.LIFT_HIGH_POS}
                            onChange={(e) => handleChange("LIFT_HIGH_POS", parseInt(e.target.value))}
                            className="w-full text-neon-blue accent-neon-blue"
                        />
                    </div>
                </section>
            )}

            {/* 🧠 Inteligencia Artificial */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-neon-magenta/20 pb-1">
                    <Target className="w-4 h-4 text-neon-magenta" />
                    <h3 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">TACTICAL_AI</h3>
                </div>

                <div className="flex items-center justify-between">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Ram_Strategy</label>
                    <button
                        onClick={() => handleChange("ESTRATEGIA_ARIETE", !config.ESTRATEGIA_ARIETE)}
                        className={`w-10 h-5 rounded-full transition-all relative ${config.ESTRATEGIA_ARIETE ? "bg-neon-magenta shadow-[0_0_10px_rgba(217,70,239,0.5)]" : "bg-slate-700"
                            }`}
                    >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${config.ESTRATEGIA_ARIETE ? "left-5.5" : "left-0.5"
                            }`} />
                    </button>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Attack_Range</label>
                        <span className="text-[10px] text-neon-magenta font-mono">{config.DISTANCIA_ATAQUE}mm</span>
                    </div>
                    <input
                        type="range"
                        min="50"
                        max="500"
                        step="10"
                        value={config.DISTANCIA_ATAQUE}
                        onChange={(e) => handleChange("DISTANCIA_ATAQUE", parseInt(e.target.value))}
                        className="w-full accent-neon-magenta"
                    />
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Back_Distance</label>
                        <span className="text-[10px] text-neon-magenta font-mono">{config.DIST_RETROCESO}mm</span>
                    </div>
                    <input
                        type="range"
                        min="50"
                        max="300"
                        step="10"
                        value={config.DIST_RETROCESO}
                        onChange={(e) => handleChange("DIST_RETROCESO", parseInt(e.target.value))}
                        className="w-full accent-neon-magenta"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Search_Logic</label>
                    <div className="flex gap-1">
                        {(["Tornado", "Zig-Zag"] as SearchMode[]).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => handleChange("MODO_BUSQUEDA", mode)}
                                className={`flex-1 py-1 rounded text-[9px] font-bold border transition-all ${config.MODO_BUSQUEDA === mode
                                    ? "bg-neon-magenta/20 border-neon-magenta text-neon-magenta shadow-[0_0_10px_rgba(217,70,239,0.2)]"
                                    : "bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-500"
                                    }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between">
                        <label className="text-[10px] text-slate-500 font-bold uppercase" title="Velocidad al buscar oponente">Search_Spin_Speed ?</label>
                        <span className="text-[10px] text-neon-magenta font-mono">{config.VELOCIDAD_GIRO_BUSQUEDA}</span>
                    </div>
                    <input
                        type="range"
                        min="100"
                        max="400"
                        step="10"
                        value={config.VELOCIDAD_GIRO_BUSQUEDA}
                        onChange={(e) => handleChange("VELOCIDAD_GIRO_BUSQUEDA", parseInt(e.target.value))}
                        className="w-full accent-neon-magenta"
                    />
                </div>
            </section>

            {/* 🎨 Periféricos */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-neon-blue/20 pb-1">
                    <Volume2 className="w-4 h-4 text-neon-blue" />
                    <h3 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">SYSTEM_IO</h3>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Audio_Level</label>
                        <span className="text-[10px] text-neon-blue font-mono">{config.VOLUMEN_GENERAL}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={config.VOLUMEN_GENERAL}
                        onChange={(e) => handleChange("VOLUMEN_GENERAL", parseInt(e.target.value))}
                        className="w-full accent-neon-blue"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <label className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-2">
                        <Ghost className="w-3 h-3" /> Ghost_Mask
                    </label>
                    <button
                        onClick={() => handleChange("MODO_FANTASMA", !config.MODO_FANTASMA)}
                        className={`w-10 h-5 rounded-full transition-all relative ${config.MODO_FANTASMA ? "bg-neon-blue" : "bg-slate-700"
                            }`}
                    >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${config.MODO_FANTASMA ? "left-5.5" : "left-0.5"
                            }`} />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <label className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-2" title="Permite funcionar aunque el robot vuelque">
                        <RotateCcw className="w-3 h-3" /> Tilt_Override ?
                    </label>
                    <button
                        onClick={() => handleChange("OPERAR_TUMBADO", !config.OPERAR_TUMBADO)}
                        className={`w-10 h-5 rounded-full transition-all relative ${config.OPERAR_TUMBADO ? "bg-neon-blue" : "bg-slate-700"
                            }`}
                    >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${config.OPERAR_TUMBADO ? "left-5.5" : "left-0.5"
                            }`} />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <label className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-2" title="Guardar configuración en memoria permanente del Hub">
                        <Save className="w-3 h-3" /> Flash_Persist ?
                    </label>
                    <button
                        onClick={() => handleChange("PERSISTENCIA_FLASH", !config.PERSISTENCIA_FLASH)}
                        className={`w-10 h-5 rounded-full transition-all relative ${config.PERSISTENCIA_FLASH ? "bg-neon-blue" : "bg-slate-700"
                            }`}
                    >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${config.PERSISTENCIA_FLASH ? "left-5.5" : "left-0.5"
                            }`} />
                    </button>
                </div>
            </section>
        </div>
    );
};
