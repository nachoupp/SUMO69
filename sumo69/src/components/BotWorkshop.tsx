import { useState, useCallback } from 'react';
import type { BotProfile } from '../types/botTypes';
import { useBotLibrary } from '../hooks/useBotLibrary';
import { BotLibrary } from './BotLibrary';
import { CreationWizard } from './CreationWizard';
import { Wrench, X } from 'lucide-react';

interface BotWorkshopProps {
    isOpen: boolean;
    onClose: () => void;
    onLoadBot: (config: BotProfile['config']) => void;
}

type ViewMode = 'library' | 'wizard';

export function BotWorkshop({ isOpen, onClose, onLoadBot }: BotWorkshopProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('library');
    const [editingBot, setEditingBot] = useState<BotProfile | undefined>(undefined);

    const {
        bots,
        saveBot,
        deleteBot,
        exportBot,
        importBot,
        savedDesigns,
        saveDesign,
        deleteDesign
    } = useBotLibrary();

    const handleNewBot = useCallback(() => {
        setEditingBot(undefined);
        setViewMode('wizard');
    }, []);

    const handleEditBot = useCallback((bot: BotProfile) => {
        setEditingBot(bot);
        setViewMode('wizard');
    }, []);

    const handleLoadBot = useCallback((bot: BotProfile) => {
        onLoadBot(bot.config);
        onClose();
    }, [onLoadBot, onClose]);

    const handleSaveBot = useCallback((bot: BotProfile) => {
        saveBot(bot);
        setViewMode('library');
        setEditingBot(undefined);
    }, [saveBot]);

    // Sanitize name for Pybricks compatibility
    // - No symbols (only letters, numbers, underscores)
    // - No spaces (replace with underscore)
    // - No numbers at the start (prefix with 'bot_')
    // - Lowercase
    const sanitizePybricksName = (name: string): string => {
        let sanitized = name
            .toLowerCase()
            .replace(/\s+/g, '_')           // spaces -> underscores
            .replace(/[^a-z0-9_]/g, '')     // remove non-alphanumeric except underscore
            .replace(/^[0-9]+/, '');         // remove leading numbers

        // If empty or starts with number after cleanup, prefix with 'bot_'
        if (!sanitized || /^[0-9]/.test(sanitized)) {
            sanitized = 'bot_' + sanitized;
        }

        return sanitized || 'bot_config';
    };

    const handleExportBot = useCallback((id: string) => {
        const json = exportBot(id);
        if (json) {
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const bot = bots.find(b => b.id === id);
            const safeName = sanitizePybricksName(bot?.name || 'bot');
            a.download = `${safeName}_config.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
    }, [exportBot, bots]);

    const handleImportBot = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const json = event.target?.result as string;
                    importBot(json);
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }, [importBot]);

    const handleCancelWizard = useCallback(() => {
        setViewMode('library');
        setEditingBot(undefined);
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 flex flex-col">
                {viewMode === 'library' ? (
                    <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-cyan-500/30 overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/30 bg-black/40">
                            <div className="flex items-center gap-3">
                                <Wrench className="w-6 h-6 text-cyan-400" />
                                <h1 className="text-xl font-bold text-cyan-400 tracking-wider">
                                    BOT WORKSHOP
                                </h1>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Library Content */}
                        <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
                            <BotLibrary
                                bots={bots}
                                onLoadBot={handleLoadBot}
                                onEditBot={handleEditBot}
                                onDeleteBot={deleteBot}
                                onNewBot={handleNewBot}
                                onExportBot={handleExportBot}
                                onImportBot={handleImportBot}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="h-[90vh] flex flex-col overflow-hidden">
                        <CreationWizard
                            existingBot={editingBot}
                            savedDesigns={savedDesigns}
                            onSaveBot={handleSaveBot}
                            onSaveDesign={saveDesign}
                            onDeleteDesign={deleteDesign}
                            onCancel={handleCancelWizard}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
