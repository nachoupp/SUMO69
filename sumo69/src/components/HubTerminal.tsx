import { useState, useRef, useEffect } from 'react';
import { Send, Terminal, ArrowUp, ArrowDown, Power } from 'lucide-react';

interface HubTerminalProps {
    isConnected: boolean;
    output: string;
    sendCommand: (command: string) => Promise<void>;
    clearOutput: () => void;
}

export const HubTerminal: React.FC<HubTerminalProps> = ({
    isConnected,
    output,
    sendCommand,
    clearOutput
}) => {
    const [input, setInput] = useState('');
    const outputRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of output
    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [output]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || !isConnected) return;

        await sendCommand(input);
        setInput('');
    };

    const handleQuickCommand = (cmd: string) => {
        if (isConnected) {
            sendCommand(cmd);
        }
    };

    return (
        <div className="flex flex-col gap-3 bg-black/40 border border-white/10 rounded-xl p-4 h-[300px] w-full">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-neon-green" />
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">NUS_Terminal</h3>
                </div>
                <button
                    onClick={clearOutput}
                    className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors uppercase font-bold"
                >
                    Clear
                </button>
            </div>

            {/* Output Display */}
            <div
                ref={outputRef}
                className="flex-1 bg-slate-950/50 rounded p-2 overflow-y-auto font-mono text-[10px] space-y-1 custom-scrollbar"
            >
                {output ? (
                    <pre className="whitespace-pre-wrap text-slate-300 break-all">{output}</pre>
                ) : (
                    <div className="text-slate-700 italic flex flex-col items-center justify-center h-full gap-2">
                        <span>waiting for stream...</span>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-2">
                {/* Quick Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={() => handleQuickCommand('fwd')}
                        disabled={!isConnected}
                        className="flex-1 bg-neon-blue/10 border border-neon-blue/30 text-neon-blue hover:bg-neon-blue/20 disabled:opacity-50 disabled:cursor-not-allowed py-1 rounded text-[10px] font-bold uppercase flex items-center justify-center gap-1"
                    >
                        <ArrowUp className="w-3 h-3" /> FWD
                    </button>
                    <button
                        onClick={() => handleQuickCommand('rev')}
                        disabled={!isConnected}
                        className="flex-1 bg-neon-blue/10 border border-neon-blue/30 text-neon-blue hover:bg-neon-blue/20 disabled:opacity-50 disabled:cursor-not-allowed py-1 rounded text-[10px] font-bold uppercase flex items-center justify-center gap-1"
                    >
                        <ArrowDown className="w-3 h-3" /> REV
                    </button>
                    <button
                        onClick={() => handleQuickCommand('bye')}
                        disabled={!isConnected}
                        className="flex-1 bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed py-1 rounded text-[10px] font-bold uppercase flex items-center justify-center gap-1"
                    >
                        <Power className="w-3 h-3" /> BYE
                    </button>
                </div>

                {/* Input Bar */}
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={!isConnected}
                        placeholder={isConnected ? "Enter command..." : "Connect to send commands"}
                        className="flex-1 bg-slate-900/50 border border-white/10 rounded px-2 py-1 text-xs text-slate-200 outline-none focus:border-neon-green/50 placeholder:text-slate-600 disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!isConnected || !input.trim()}
                        className="bg-neon-green/10 border border-neon-green/30 text-neon-green hover:bg-neon-green/20 disabled:opacity-50 disabled:cursor-not-allowed px-3 rounded flex items-center justify-center"
                    >
                        <Send className="w-3 h-3" />
                    </button>
                </form>
            </div>
        </div>
    );
};
