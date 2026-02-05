import { useState, useCallback } from 'react';
import type { MatrixDesign } from '../types/botTypes';
import { createEmptyMatrixDesign, generateId, DEFAULT_MATRIX_DESIGNS } from '../types/botTypes';
import { Grid3X3, Save, Sparkles, Trash2 } from 'lucide-react';

interface MatrixDesignerProps {
    value: MatrixDesign;
    onChange: (design: MatrixDesign) => void;
    savedDesigns?: MatrixDesign[];
    onSaveDesign?: (design: MatrixDesign) => void;
    onDeleteDesign?: (id: string) => void;
    compact?: boolean;
}

const BRIGHTNESS_LEVELS = [0, 50, 100];
const BRIGHTNESS_COLORS = {
    0: 'bg-gray-900/50',
    50: 'bg-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.4)]',
    100: 'bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.8)]'
};

export function MatrixDesigner({
    value,
    onChange,
    savedDesigns = [],
    onSaveDesign,
    onDeleteDesign,
    compact = false
}: MatrixDesignerProps) {
    const [designName, setDesignName] = useState(value.name);
    const [showLibrary, setShowLibrary] = useState(false);

    const handlePixelClick = useCallback((row: number, col: number) => {
        const currentValue = value.pixels[row][col];
        const currentIndex = BRIGHTNESS_LEVELS.indexOf(currentValue);
        const nextIndex = (currentIndex + 1) % BRIGHTNESS_LEVELS.length;
        const nextValue = BRIGHTNESS_LEVELS[nextIndex];

        const newPixels = value.pixels.map((r, ri) =>
            ri === row ? r.map((c, ci) => (ci === col ? nextValue : c)) : [...r]
        );

        onChange({
            ...value,
            pixels: newPixels
        });
    }, [value, onChange]);

    const handleClear = useCallback(() => {
        onChange(createEmptyMatrixDesign(designName || 'Custom'));
    }, [onChange, designName]);

    const handleSave = useCallback(() => {
        if (onSaveDesign && designName.trim()) {
            onSaveDesign({
                ...value,
                id: generateId(),
                name: designName.trim().toUpperCase()
            });
        }
    }, [value, designName, onSaveDesign]);

    const handleLoadDesign = useCallback((design: MatrixDesign) => {
        onChange({
            ...design,
            id: generateId() // New ID for this instance
        });
        setDesignName(design.name);
        setShowLibrary(false);
    }, [onChange]);

    const pixelSize = compact ? 'w-6 h-6' : 'w-8 h-8';
    const gapSize = compact ? 'gap-1' : 'gap-1.5';

    return (
        <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Grid3X3 className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm font-bold text-cyan-400 tracking-wider">
                        MATRIX DESIGNER
                    </span>
                </div>
                <button
                    onClick={() => setShowLibrary(!showLibrary)}
                    className="px-3 py-1 text-xs font-bold tracking-wider text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-500/10 transition-colors"
                >
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    {showLibrary ? 'HIDE' : 'LIBRARY'}
                </button>
            </div>

            {/* Design Library */}
            {showLibrary && (
                <div className="p-3 bg-black/40 border border-cyan-500/20 rounded-lg">
                    <p className="text-xs text-gray-400 mb-2">Select a preset:</p>
                    <div className="flex flex-wrap gap-2">
                        {savedDesigns.map((design) => {
                            const isDefault = DEFAULT_MATRIX_DESIGNS.some(d => d.id === design.id);
                            return (
                                <div key={design.id} className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleLoadDesign(design)}
                                        className="px-2 py-1 text-xs font-mono bg-gray-800/50 border border-cyan-500/30 rounded hover:bg-cyan-500/20 hover:border-cyan-400 transition-all"
                                    >
                                        {design.name}
                                    </button>
                                    {onDeleteDesign && !isDefault && (
                                        <button
                                            onClick={() => onDeleteDesign(design.id)}
                                            className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                                            title="Delete design"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Matrix Grid */}
            <div className="flex flex-col items-center">
                <div
                    className={`grid grid-cols-5 ${gapSize} p-4 bg-black/60 border border-cyan-500/30 rounded-lg`}
                    style={{
                        boxShadow: '0 0 30px rgba(6, 182, 212, 0.15), inset 0 0 20px rgba(0,0,0,0.5)'
                    }}
                >
                    {value.pixels.map((row, rowIndex) =>
                        row.map((pixel, colIndex) => (
                            <button
                                key={`${rowIndex}-${colIndex}`}
                                onClick={() => handlePixelClick(rowIndex, colIndex)}
                                className={`
                  ${pixelSize} rounded-sm border border-cyan-500/20 
                  ${BRIGHTNESS_COLORS[pixel as keyof typeof BRIGHTNESS_COLORS] || BRIGHTNESS_COLORS[0]}
                  transition-all duration-150 hover:scale-110 hover:border-cyan-400
                `}
                                title={`Row ${rowIndex + 1}, Col ${colIndex + 1}: ${pixel}%`}
                            />
                        ))
                    )}
                </div>
                <p className="text-[10px] text-gray-500 mt-2">
                    Click pixels to cycle: OFF → DIM → BRIGHT
                </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={designName}
                    onChange={(e) => setDesignName(e.target.value.toUpperCase())}
                    placeholder="DESIGN NAME"
                    className="flex-1 px-3 py-2 text-xs font-mono bg-black/40 border border-cyan-500/30 rounded text-cyan-400 placeholder-gray-600 focus:outline-none focus:border-cyan-400"
                    maxLength={16}
                />

                <button
                    onClick={handleClear}
                    className="p-2 text-gray-400 hover:text-red-400 border border-gray-600/30 rounded hover:border-red-500/50 transition-all"
                    title="Clear Grid"
                >
                    <Trash2 className="w-4 h-4" />
                </button>

                {onSaveDesign && (
                    <button
                        onClick={handleSave}
                        disabled={!designName.trim()}
                        className="px-3 py-2 text-xs font-bold tracking-wider bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                    >
                        <Save className="w-3 h-3" />
                        SAVE
                    </button>
                )}
            </div>
        </div>
    );
}
