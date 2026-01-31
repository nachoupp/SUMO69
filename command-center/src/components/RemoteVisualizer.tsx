import React from 'react';

interface RemoteVisualizerProps {
    onCenterClick: () => void;
    activeMode: number;
}

const MODE_COLORS = ['#10b981', '#f59e0b', '#d946ef', '#0ea5e9'];

export const RemoteVisualizer: React.FC<RemoteVisualizerProps> = ({ onCenterClick, activeMode }) => {
    return (
        <div className="w-48 h-80 bg-slate-100 rounded-[3rem] border-8 border-slate-300 p-6 flex flex-col items-center justify-between shadow-xl relative">
            <div className="flex justify-between w-full h-[60%]">
                {/* Left Column */}
                <div className="flex flex-col items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center text-slate-400 font-bold shadow-inner">+</div>
                    <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center text-white font-bold shadow-md" style={{ backgroundColor: '#3b82f6' }}>L</div>
                    <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center text-slate-400 font-bold shadow-inner">-</div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center text-slate-400 font-bold shadow-inner">+</div>
                    <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center text-white font-bold shadow-md" style={{ backgroundColor: '#ef4444' }}>R</div>
                    <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center text-slate-400 font-bold shadow-inner">-</div>
                </div>
            </div>

            {/* Center Button */}
            <button
                onClick={onCenterClick}
                className="w-14 h-14 rounded-full border-4 border-slate-300 shadow-md flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
                style={{
                    backgroundColor: MODE_COLORS[activeMode % MODE_COLORS.length],
                    boxShadow: `0 0 10px ${MODE_COLORS[activeMode % MODE_COLORS.length]}`
                }}
            >
                <div className="w-8 h-8 rounded-full border-2 border-white/30" />
            </button>

            {/* Brand Label */}
            <div className="absolute top-1 text-[8px] font-black text-slate-400 tracking-tighter">LEGO TECHNIC</div>
        </div>
    );
};
