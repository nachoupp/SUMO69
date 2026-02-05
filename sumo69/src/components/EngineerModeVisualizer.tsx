import React, { useState } from 'react';

const MENU_ITEMS = [
    { id: 'A', label: 'Actions', desc: 'Select execution routines' },
    { id: 'S', label: 'Sensors', desc: 'Calibrate & Test Sensors' },
    { id: 'V', label: 'Variables', desc: 'View Live Data' },
    { id: 'P', label: 'Programs', desc: 'Stored Scripts' },
    { id: 'X', label: 'Exit', desc: 'Reboot System' },
];

export const EngineerModeVisualizer: React.FC = () => {
    const [selected, setSelected] = useState('A');

    return (
        <div className="w-48 h-80 bg-slate-900/80 rounded-[2rem] border-4 border-slate-700 p-4 flex flex-col items-center gap-4 shadow-xl relative overflow-hidden">
            {/* Holographic Header */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-50" />

            <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Engineer_Menu</div>

            {/* Simulated Hub Screen */}
            <div className="w-32 h-32 bg-black border-2 border-slate-600 rounded-lg flex items-center justify-center relative shadow-inner">
                {/* 5x5 Matrix Simulation for the Letter */}
                <span className="text-6xl font-mono font-bold text-neon-blue drop-shadow-[0_0_10px_rgba(14,165,233,0.8)] animate-pulse">
                    {selected}
                </span>

                {/* Scanlines */}
                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-20 pointer-events-none" />
            </div>

            {/* Menu Items */}
            <div className="flex flex-col gap-1 w-full">
                {MENU_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        onMouseEnter={() => setSelected(item.id)}
                        className={`text-[10px] font-bold py-1 px-2 rounded flex justify-between items-center transition-all ${selected === item.id
                                ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                                : 'text-slate-600 hover:text-slate-400'
                            }`}
                    >
                        <span>[{item.id}]</span>
                        <span className="uppercase tracking-tight">{item.label}</span>
                    </button>
                ))}
            </div>

            {/* Description Box */}
            <div className="mt-auto w-full p-2 bg-slate-800/50 rounded border border-white/5">
                <p className="text-[9px] text-slate-300 text-center leading-tight">
                    {MENU_ITEMS.find(i => i.id === selected)?.desc}
                </p>
            </div>
        </div>
    );
};
