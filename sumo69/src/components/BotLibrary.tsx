import { useState } from 'react';
import type { BotProfile } from '../types/botTypes';
import {
    Library, Plus, Trash2, Download, Upload, Play, Edit3,
    Clock, Bot, AlertTriangle, X
} from 'lucide-react';

interface BotLibraryProps {
    bots: BotProfile[];
    onLoadBot: (bot: BotProfile) => void;
    onEditBot: (bot: BotProfile) => void;
    onDeleteBot: (id: string) => void;
    onNewBot: () => void;
    onExportBot: (id: string) => void;
    onImportBot: () => void;
}

export function BotLibrary({
    bots,
    onLoadBot,
    onEditBot,
    onDeleteBot,
    onNewBot,
    onExportBot,
    onImportBot
}: BotLibraryProps) {
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleDeleteClick = (id: string) => {
        setDeleteConfirm(id);
    };

    const confirmDelete = () => {
        if (deleteConfirm) {
            onDeleteBot(deleteConfirm);
            setDeleteConfirm(null);
        }
    };

    return (
        <div className="flex flex-col gap-4 p-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4">
                <div className="flex items-center gap-3">
                    <Library className="w-6 h-6 text-cyan-400" />
                    <h2 className="text-lg font-bold text-cyan-400 tracking-wider">
                        BOT LIBRARY
                    </h2>
                    <span className="px-2 py-0.5 text-xs bg-cyan-500/20 rounded-full text-cyan-300">
                        {bots.length} BOTS
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onImportBot}
                        className="px-3 py-1.5 text-xs font-bold tracking-wider text-gray-300 border border-gray-600/50 rounded hover:border-cyan-500/50 hover:text-cyan-400 transition-all flex items-center gap-1"
                    >
                        <Upload className="w-3 h-3" />
                        IMPORT
                    </button>
                    <button
                        onClick={onNewBot}
                        className="px-4 py-1.5 text-xs font-bold tracking-wider bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center gap-1"
                    >
                        <Plus className="w-4 h-4" />
                        NEW BOT
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-gray-900 border border-red-500/50 rounded-lg p-6 max-w-sm mx-4 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-6 h-6 text-red-400" />
                            <h3 className="text-lg font-bold text-red-400">DELETE BOT?</h3>
                        </div>
                        <p className="text-gray-300 mb-6">
                            This action cannot be undone. The bot profile will be permanently deleted.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 text-sm font-bold text-gray-400 border border-gray-600 rounded hover:border-gray-400 transition-colors flex items-center gap-1"
                            >
                                <X className="w-4 h-4" />
                                CANCEL
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 text-sm font-bold bg-red-600 text-white rounded hover:bg-red-500 transition-colors flex items-center gap-1"
                            >
                                <Trash2 className="w-4 h-4" />
                                DELETE
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {bots.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Bot className="w-16 h-16 text-gray-600 mb-4" />
                    <h3 className="text-lg font-bold text-gray-400 mb-2">No Bots Yet</h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-md">
                        Create your first bot profile to save configurations, custom LED designs, and mode mappings.
                    </p>
                    <button
                        onClick={onNewBot}
                        className="px-6 py-3 text-sm font-bold tracking-wider bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                    >
                        <Plus className="w-5 h-5" />
                        CREATE YOUR FIRST BOT
                    </button>
                </div>
            )}

            {/* Bot Grid */}
            {bots.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bots.map((bot) => (
                        <div
                            key={bot.id}
                            className={`
                relative p-4 rounded-lg border transition-all
                ${bot.robotModel === 'YELLOW'
                                    ? 'bg-gradient-to-br from-orange-900/20 to-black/40 border-orange-500/30 hover:border-orange-400'
                                    : 'bg-gradient-to-br from-cyan-900/20 to-black/40 border-cyan-500/30 hover:border-cyan-400'
                                }
              `}
                        >
                            {/* Bot Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className={`text-sm font-bold tracking-wider ${bot.robotModel === 'YELLOW' ? 'text-orange-400' : 'text-cyan-400'
                                        }`}>
                                        {bot.name}
                                    </h3>
                                    <span className="text-[10px] text-gray-500 uppercase">
                                        {bot.robotModel} MODEL
                                    </span>
                                </div>
                                <span className={`px-2 py-0.5 text-[10px] rounded-full ${bot.robotModel === 'YELLOW'
                                        ? 'bg-orange-500/20 text-orange-300'
                                        : 'bg-cyan-500/20 text-cyan-300'
                                    }`}>
                                    {bot.modes.length} MODES
                                </span>
                            </div>

                            {/* Bot Meta */}
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-4">
                                <Clock className="w-3 h-3" />
                                <span>Created {formatDate(bot.createdAt)}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onLoadBot(bot)}
                                    className={`flex-1 px-3 py-2 text-xs font-bold rounded transition-all flex items-center justify-center gap-1 ${bot.robotModel === 'YELLOW'
                                            ? 'bg-orange-600/80 text-white hover:bg-orange-500'
                                            : 'bg-cyan-600/80 text-white hover:bg-cyan-500'
                                        }`}
                                >
                                    <Play className="w-3 h-3" />
                                    LOAD
                                </button>
                                <button
                                    onClick={() => onEditBot(bot)}
                                    className="p-2 text-gray-400 border border-gray-600/50 rounded hover:text-cyan-400 hover:border-cyan-500/50 transition-all"
                                    title="Edit Bot"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onExportBot(bot.id)}
                                    className="p-2 text-gray-400 border border-gray-600/50 rounded hover:text-green-400 hover:border-green-500/50 transition-all"
                                    title="Export Bot"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(bot.id)}
                                    className="p-2 text-gray-400 border border-gray-600/50 rounded hover:text-red-400 hover:border-red-500/50 transition-all"
                                    title="Delete Bot"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
