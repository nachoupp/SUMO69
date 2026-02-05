import { useState, useEffect, useCallback } from 'react';
import type { BotProfile, MatrixDesign } from '../types/botTypes';
import { generateId, DEFAULT_MATRIX_DESIGNS } from '../types/botTypes';
import { DEFAULT_CONFIG } from '../types';

const STORAGE_KEY = 'sumo-bot-profiles';
const DESIGNS_STORAGE_KEY = 'sumo-matrix-designs';

interface UseBotLibraryReturn {
    // Bot Profiles
    bots: BotProfile[];
    saveBot: (profile: BotProfile) => void;
    loadBot: (id: string) => BotProfile | undefined;
    deleteBot: (id: string) => void;
    createNewBot: (name: string, robotModel: 'YELLOW' | 'BLUE') => BotProfile;
    exportBot: (id: string) => string | null;
    importBot: (json: string) => BotProfile | null;

    // Matrix Designs (shared across bots)
    savedDesigns: MatrixDesign[];
    saveDesign: (design: MatrixDesign) => void;
    deleteDesign: (id: string) => void;
}

export function useBotLibrary(): UseBotLibraryReturn {
    const [bots, setBots] = useState<BotProfile[]>([]);
    const [savedDesigns, setSavedDesigns] = useState<MatrixDesign[]>([]);

    // ═══════════════════════════════════════════════════════════════
    // LOAD FROM STORAGE ON MOUNT
    // ═══════════════════════════════════════════════════════════════

    useEffect(() => {
        try {
            const storedBots = localStorage.getItem(STORAGE_KEY);
            if (storedBots) {
                setBots(JSON.parse(storedBots));
            }

            const storedDesigns = localStorage.getItem(DESIGNS_STORAGE_KEY);
            if (storedDesigns) {
                setSavedDesigns(JSON.parse(storedDesigns));
            } else {
                // Initialize with default designs
                setSavedDesigns(DEFAULT_MATRIX_DESIGNS);
                localStorage.setItem(DESIGNS_STORAGE_KEY, JSON.stringify(DEFAULT_MATRIX_DESIGNS));
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
        }
    }, []);

    // ═══════════════════════════════════════════════════════════════
    // BOT PROFILE OPERATIONS
    // ═══════════════════════════════════════════════════════════════

    const saveBot = useCallback((profile: BotProfile) => {
        setBots(prevBots => {
            const existingIndex = prevBots.findIndex(b => b.id === profile.id);
            const updatedProfile = {
                ...profile,
                updatedAt: new Date().toISOString()
            };

            let newBots: BotProfile[];
            if (existingIndex >= 0) {
                newBots = [...prevBots];
                newBots[existingIndex] = updatedProfile;
            } else {
                newBots = [...prevBots, updatedProfile];
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(newBots));
            return newBots;
        });
    }, []);

    const loadBot = useCallback((id: string): BotProfile | undefined => {
        return bots.find(b => b.id === id);
    }, [bots]);

    const deleteBot = useCallback((id: string) => {
        setBots(prevBots => {
            const newBots = prevBots.filter(b => b.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newBots));
            return newBots;
        });
    }, []);

    const createNewBot = useCallback((name: string, robotModel: 'YELLOW' | 'BLUE'): BotProfile => {
        const now = new Date().toISOString();
        return {
            id: generateId(),
            name: name.toUpperCase().replace(/\s+/g, '_'),
            createdAt: now,
            updatedAt: now,
            robotModel,
            config: { ...DEFAULT_CONFIG, ROBOT_MODEL: robotModel },
            modes: [],
            customMatrixDesigns: []
        };
    }, []);

    const exportBot = useCallback((id: string): string | null => {
        const bot = bots.find(b => b.id === id);
        if (!bot) return null;
        return JSON.stringify(bot, null, 2);
    }, [bots]);

    const importBot = useCallback((json: string): BotProfile | null => {
        try {
            const parsed = JSON.parse(json) as BotProfile;
            // Generate new ID to avoid conflicts
            const imported: BotProfile = {
                ...parsed,
                id: generateId(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                name: `${parsed.name}_imported`
            };
            saveBot(imported);
            return imported;
        } catch {
            console.error('Failed to import bot profile');
            return null;
        }
    }, [saveBot]);

    // ═══════════════════════════════════════════════════════════════
    // MATRIX DESIGN OPERATIONS
    // ═══════════════════════════════════════════════════════════════

    const saveDesign = useCallback((design: MatrixDesign) => {
        setSavedDesigns(prevDesigns => {
            const existingIndex = prevDesigns.findIndex(d => d.id === design.id);

            let newDesigns: MatrixDesign[];
            if (existingIndex >= 0) {
                newDesigns = [...prevDesigns];
                newDesigns[existingIndex] = design;
            } else {
                newDesigns = [...prevDesigns, design];
            }

            localStorage.setItem(DESIGNS_STORAGE_KEY, JSON.stringify(newDesigns));
            return newDesigns;
        });
    }, []);

    const deleteDesign = useCallback((id: string) => {
        // Don't allow deleting default designs
        if (DEFAULT_MATRIX_DESIGNS.some(d => d.id === id)) {
            console.warn('Cannot delete default matrix design');
            return;
        }

        setSavedDesigns(prevDesigns => {
            const newDesigns = prevDesigns.filter(d => d.id !== id);
            localStorage.setItem(DESIGNS_STORAGE_KEY, JSON.stringify(newDesigns));
            return newDesigns;
        });
    }, []);

    return {
        bots,
        saveBot,
        loadBot,
        deleteBot,
        createNewBot,
        exportBot,
        importBot,
        savedDesigns,
        saveDesign,
        deleteDesign
    };
}
