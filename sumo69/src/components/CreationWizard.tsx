import React, { useState, useCallback } from 'react';
import type { BotProfile, ModeConfig, MatrixDesign } from '../types/botTypes';
import { generateId, DEFAULT_MODE_CONFIGS } from '../types/botTypes';
import { DEFAULT_CONFIG, type Action, type SumoConfig } from '../types';
import { MatrixDesigner } from './MatrixDesigner';
import {
    ChevronLeft, ChevronRight, Save, X, Bot,
    Layers, Gamepad2, CheckCircle, Sparkles
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface CreationWizardProps {
    existingBot?: BotProfile;
    savedDesigns: MatrixDesign[];
    onSaveBot: (bot: BotProfile) => void;
    onSaveDesign: (design: MatrixDesign) => void;
    onDeleteDesign: (id: string) => void;
    onCancel: () => void;
}

type WizardStep = 'name' | 'model' | 'modes' | 'configure' | 'review';

const STEPS: { id: WizardStep; label: string; icon: React.ReactNode }[] = [
    { id: 'name', label: 'Name', icon: <Bot className="w-4 h-4" /> },
    { id: 'model', label: 'Model', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'modes', label: 'Modes', icon: <Layers className="w-4 h-4" /> },
    { id: 'configure', label: 'Configure', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'review', label: 'Review', icon: <CheckCircle className="w-4 h-4" /> },
];

const AVAILABLE_ACTIONS: { value: Action; label: string }[] = [
    { value: 'ATAQUE_MANUAL', label: 'Manual Attack' },
    { value: 'TURBO_PUSH', label: 'Turbo Push' },
    { value: 'GIRO_180', label: '180° Spin' },
    { value: 'RITUAL_360', label: '360° Ritual' },
    { value: 'MARCHAS', label: 'Gearbox' },
    { value: 'EMBRAGUE_PALA', label: 'Loader Clutch' },
    { value: 'NADA', label: 'Nothing' },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export function CreationWizard({
    existingBot,
    savedDesigns,
    onSaveBot,
    onSaveDesign,
    onDeleteDesign,
    onCancel
}: CreationWizardProps) {
    // === STATE ===
    const [currentStep, setCurrentStep] = useState<WizardStep>('name');
    const [botName, setBotName] = useState(existingBot?.name || '');
    const [robotModel, setRobotModel] = useState<'YELLOW' | 'BLUE'>(existingBot?.robotModel || 'YELLOW');
    const [modeCount, setModeCount] = useState(existingBot?.modes.length || 3);
    const [modes, setModes] = useState<ModeConfig[]>(
        existingBot?.modes.length ? existingBot.modes : DEFAULT_MODE_CONFIGS.slice(0, 3)
    );
    const [currentModeIndex, setCurrentModeIndex] = useState(0);

    // === NAVIGATION ===
    const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

    const canGoNext = useCallback(() => {
        switch (currentStep) {
            case 'name': return botName.trim().length >= 3;
            case 'model': return true;
            case 'modes': return modeCount >= 1 && modeCount <= 4;
            case 'configure': return true; // goNext() handles mode sub-navigation
            case 'review': return true;
            default: return false;
        }
    }, [currentStep, botName, modeCount]);

    const goNext = useCallback(() => {
        if (currentStep === 'configure' && currentModeIndex < modeCount - 1) {
            setCurrentModeIndex(prev => prev + 1);
            return;
        }

        const nextIndex = currentStepIndex + 1;
        if (nextIndex < STEPS.length) {
            setCurrentStep(STEPS[nextIndex].id);
            if (STEPS[nextIndex].id === 'configure') {
                setCurrentModeIndex(0);
            }
        }
    }, [currentStep, currentStepIndex, currentModeIndex, modeCount]);

    const goBack = useCallback(() => {
        if (currentStep === 'configure' && currentModeIndex > 0) {
            setCurrentModeIndex(prev => prev - 1);
            return;
        }

        const prevIndex = currentStepIndex - 1;
        if (prevIndex >= 0) {
            setCurrentStep(STEPS[prevIndex].id);
        }
    }, [currentStep, currentStepIndex, currentModeIndex]);

    // === MODE UPDATES ===
    const updateCurrentMode = useCallback((updates: Partial<ModeConfig>) => {
        setModes(prev => {
            const newModes = [...prev];
            newModes[currentModeIndex] = { ...newModes[currentModeIndex], ...updates };
            return newModes;
        });
    }, [currentModeIndex]);

    // Sanitize name for Pybricks compatibility
    const sanitizePybricksName = (name: string): string => {
        let sanitized = name
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '')
            .replace(/^[0-9]+/, '');

        if (!sanitized || /^[0-9]/.test(sanitized)) {
            sanitized = 'bot_' + sanitized;
        }
        return sanitized || 'sumo_bot';
    };

    // === SAVE ===
    const handleSave = useCallback(() => {
        const now = new Date().toISOString();

        const config: SumoConfig = {
            ...DEFAULT_CONFIG,
            ROBOT_MODEL: robotModel,
            MAPEO_ACCIONES: modes.reduce((acc, mode, idx) => {
                acc[idx] = {
                    LEFT: mode.leftButtonAction,
                    RIGHT: mode.rightButtonAction
                };
                return acc;
            }, {} as Record<number, { LEFT: Action; RIGHT: Action }>)
        };

        const safeName = sanitizePybricksName(botName);

        const bot: BotProfile = {
            id: existingBot?.id || generateId(),
            name: safeName.toUpperCase(),
            createdAt: existingBot?.createdAt || now,
            updatedAt: now,
            robotModel,
            config,
            modes: modes.slice(0, modeCount),
            customMatrixDesigns: []
        };

        onSaveBot(bot);
    }, [existingBot, botName, robotModel, modes, modeCount, onSaveBot]);

    // === RENDER HELPERS ===
    const isYellow = robotModel === 'YELLOW';

    return (
        <div className="flex flex-col h-full bg-black/80 rounded-xl border border-gray-700/50 overflow-hidden">
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isYellow ? 'border-orange-500/30' : 'border-cyan-500/30'}`}>
                <div className="flex items-center gap-3">
                    <Bot className={`w-6 h-6 ${isYellow ? 'text-orange-400' : 'text-cyan-400'}`} />
                    <h2 className={`text-lg font-bold tracking-wider ${isYellow ? 'text-orange-400' : 'text-cyan-400'}`}>
                        {existingBot ? 'EDIT BOT' : 'CREATE BOT'}
                    </h2>
                </div>
                <button
                    onClick={onCancel}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2 px-6 py-3 bg-black/40 border-b border-gray-800">
                {STEPS.map((step, idx) => (
                    <React.Fragment key={step.id}>
                        <div
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${step.id === currentStep
                                ? (isYellow ? 'bg-orange-500/20 text-orange-400' : 'bg-cyan-500/20 text-cyan-400')
                                : idx < currentStepIndex
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'text-gray-500'
                                }`}
                        >
                            {step.icon}
                            <span className="hidden sm:inline">{step.label}</span>
                        </div>
                        {idx < STEPS.length - 1 && (
                            <div className={`flex-1 h-px ${idx < currentStepIndex ? 'bg-green-500/50' : 'bg-gray-700'}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {/* Step: Name */}
                {currentStep === 'name' && (
                    <div className="max-w-md mx-auto text-center">
                        <h3 className="text-xl font-bold text-white mb-2">What's your bot's name?</h3>
                        <p className="text-gray-400 text-sm mb-8">Choose a memorable name for your creation</p>
                        <input
                            type="text"
                            value={botName}
                            onChange={(e) => setBotName(e.target.value.toUpperCase())}
                            placeholder="HAMMER_NINJA"
                            className={`w-full px-6 py-4 text-xl font-mono text-center bg-black/40 border-2 rounded-lg transition-all focus:outline-none ${isYellow
                                ? 'border-orange-500/30 focus:border-orange-400 text-orange-400'
                                : 'border-cyan-500/30 focus:border-cyan-400 text-cyan-400'
                                }`}
                            maxLength={20}
                            autoFocus
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Use letters, numbers, and underscores. Min 3 characters.
                        </p>
                    </div>
                )}

                {/* Step: Model */}
                {currentStep === 'model' && (
                    <div className="max-w-lg mx-auto text-center">
                        <h3 className="text-xl font-bold text-white mb-2">Choose your robot model</h3>
                        <p className="text-gray-400 text-sm mb-8">This affects available actions and hardware</p>
                        <div className="grid grid-cols-2 gap-4">
                            {(['YELLOW', 'BLUE'] as const).map((model) => (
                                <button
                                    key={model}
                                    onClick={() => setRobotModel(model)}
                                    className={`p-6 rounded-xl border-2 transition-all ${robotModel === model
                                        ? model === 'YELLOW'
                                            ? 'border-orange-400 bg-orange-500/10 shadow-[0_0_20px_rgba(251,146,60,0.3)]'
                                            : 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                                        : 'border-gray-700 bg-black/40 hover:border-gray-500'
                                        }`}
                                >
                                    <div className={`text-4xl mb-3 ${model === 'YELLOW' ? 'text-orange-400' : 'text-cyan-400'}`}>
                                        {model === 'YELLOW' ? '🔨' : '🏗️'}
                                    </div>
                                    <h4 className={`text-lg font-bold ${model === 'YELLOW' ? 'text-orange-400' : 'text-cyan-400'}`}>
                                        {model === 'YELLOW' ? 'HAMMER' : 'LOADER'}
                                    </h4>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {model === 'YELLOW' ? 'Attack-focused' : 'Defense-focused'}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step: Modes */}
                {currentStep === 'modes' && (
                    <div className="max-w-md mx-auto text-center">
                        <h3 className="text-xl font-bold text-white mb-2">How many modes?</h3>
                        <p className="text-gray-400 text-sm mb-8">Each mode has its own controls and display</p>
                        <div className="flex items-center justify-center gap-6 mb-4">
                            {[1, 2, 3, 4].map((count) => (
                                <button
                                    key={count}
                                    onClick={() => setModeCount(count)}
                                    className={`w-16 h-16 rounded-xl text-2xl font-bold border-2 transition-all ${modeCount === count
                                        ? isYellow
                                            ? 'border-orange-400 bg-orange-500/20 text-orange-400'
                                            : 'border-cyan-400 bg-cyan-500/20 text-cyan-400'
                                        : 'border-gray-700 bg-black/40 text-gray-400 hover:border-gray-500'
                                        }`}
                                >
                                    {count}
                                </button>
                            ))}
                        </div>
                        <p className="text-sm text-gray-500">
                            {modeCount} mode{modeCount > 1 ? 's' : ''} selected
                        </p>
                    </div>
                )}

                {/* Step: Configure */}
                {currentStep === 'configure' && modes[currentModeIndex] && (
                    <div className="max-w-2xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">
                                Configure Mode {currentModeIndex + 1}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isYellow ? 'bg-orange-500/20 text-orange-400' : 'bg-cyan-500/20 text-cyan-400'
                                }`}>
                                {currentModeIndex + 1} / {modeCount}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Mode Name */}
                            <div className="p-4 bg-black/40 rounded-lg border border-gray-700/50">
                                <label className="block text-xs font-bold text-gray-400 mb-2">MODE NAME</label>
                                <input
                                    type="text"
                                    value={modes[currentModeIndex].displayName}
                                    onChange={(e) => updateCurrentMode({ displayName: e.target.value })}
                                    className={`w-full px-4 py-2 bg-black/40 border rounded text-sm ${isYellow ? 'border-orange-500/30 text-orange-400' : 'border-cyan-500/30 text-cyan-400'
                                        }`}
                                />
                            </div>

                            {/* Button Actions */}
                            <div className="p-4 bg-black/40 rounded-lg border border-gray-700/50">
                                <label className="block text-xs font-bold text-gray-400 mb-2">LEFT BUTTON ACTION</label>
                                <select
                                    value={modes[currentModeIndex].leftButtonAction}
                                    onChange={(e) => updateCurrentMode({ leftButtonAction: e.target.value as Action })}
                                    className="w-full px-4 py-2 bg-black/60 border border-gray-700 rounded text-sm text-white"
                                >
                                    {AVAILABLE_ACTIONS.map(action => (
                                        <option key={action.value} value={action.value}>{action.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="p-4 bg-black/40 rounded-lg border border-gray-700/50">
                                <label className="block text-xs font-bold text-gray-400 mb-2">RIGHT BUTTON ACTION</label>
                                <select
                                    value={modes[currentModeIndex].rightButtonAction}
                                    onChange={(e) => updateCurrentMode({ rightButtonAction: e.target.value as Action })}
                                    className="w-full px-4 py-2 bg-black/60 border border-gray-700 rounded text-sm text-white"
                                >
                                    {AVAILABLE_ACTIONS.map(action => (
                                        <option key={action.value} value={action.value}>{action.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="p-4 bg-black/40 rounded-lg border border-gray-700/50">
                                <label className="block text-xs font-bold text-gray-400 mb-2">CENTER BUTTON ACTION</label>
                                <select
                                    value={modes[currentModeIndex].centerButtonAction}
                                    onChange={(e) => updateCurrentMode({ centerButtonAction: e.target.value as Action })}
                                    className="w-full px-4 py-2 bg-black/60 border border-gray-700 rounded text-sm text-white"
                                >
                                    {AVAILABLE_ACTIONS.map(action => (
                                        <option key={action.value} value={action.value}>{action.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Matrix Designer */}
                            <div className="lg:col-span-2 p-4 bg-black/40 rounded-lg border border-gray-700/50">
                                <MatrixDesigner
                                    value={modes[currentModeIndex].matrixDesign}
                                    onChange={(design) => updateCurrentMode({ matrixDesign: design })}
                                    savedDesigns={savedDesigns}
                                    onSaveDesign={onSaveDesign}
                                    onDeleteDesign={onDeleteDesign}
                                    compact
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step: Review */}
                {currentStep === 'review' && (
                    <div className="max-w-2xl mx-auto">
                        <h3 className="text-xl font-bold text-white mb-6 text-center">Review Your Bot</h3>

                        <div className={`p-6 rounded-xl border-2 mb-6 ${isYellow ? 'border-orange-500/30 bg-orange-500/5' : 'border-cyan-500/30 bg-cyan-500/5'
                            }`}>
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`text-4xl`}>
                                    {isYellow ? '🔨' : '🏗️'}
                                </div>
                                <div>
                                    <h4 className={`text-2xl font-bold ${isYellow ? 'text-orange-400' : 'text-cyan-400'}`}>
                                        {botName || 'UNNAMED_BOT'}
                                    </h4>
                                    <p className="text-sm text-gray-400">{robotModel} Model • {modeCount} Modes</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {modes.slice(0, modeCount).map((mode, idx) => (
                                    <div key={idx} className="p-3 bg-black/40 rounded-lg border border-gray-700/50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isYellow ? 'bg-orange-500/20 text-orange-400' : 'bg-cyan-500/20 text-cyan-400'
                                                }`}>
                                                {idx + 1}
                                            </span>
                                            <span className="font-bold text-white">{mode.displayName}</span>
                                        </div>
                                        <div className="text-xs text-gray-400 space-y-1">
                                            <div>◀ {mode.leftButtonAction}</div>
                                            <div>▶ {mode.rightButtonAction}</div>
                                            <div>● {mode.centerButtonAction}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800 bg-black/40">
                <button
                    onClick={goBack}
                    disabled={currentStepIndex === 0 && currentModeIndex === 0}
                    className="px-4 py-2 text-sm font-bold text-gray-400 border border-gray-600 rounded hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                >
                    <ChevronLeft className="w-4 h-4" />
                    BACK
                </button>

                {currentStep === 'review' ? (
                    <button
                        onClick={handleSave}
                        className={`px-6 py-2 text-sm font-bold text-white rounded transition-all flex items-center gap-2 ${isYellow
                            ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500'
                            : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500'
                            }`}
                    >
                        <Save className="w-4 h-4" />
                        SAVE BOT
                    </button>
                ) : (
                    <button
                        onClick={goNext}
                        disabled={!canGoNext()}
                        className={`px-6 py-2 text-sm font-bold text-white rounded disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1 ${isYellow
                            ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500'
                            : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500'
                            }`}
                    >
                        {currentStep === 'configure' && currentModeIndex < modeCount - 1 ? 'NEXT MODE' : 'NEXT'}
                        <ChevronRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
