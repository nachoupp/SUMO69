import React, { useState, useRef, useEffect } from 'react';
import type { SumoConfig } from '../types';
import { Send, Bot, Sparkles, ShieldAlert, Check, X, Info } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface ProposedChange {
    key: keyof SumoConfig | 'MAPEO_ACCIONES';
    value: any;
    description: string;
    port?: string;
}

interface AITacticalAssistantProps {
    config: SumoConfig;
    onChange: (config: SumoConfig) => void;
    onHighlightPort: (port: string | null) => void;
}

export const AITacticalAssistant: React.FC<AITacticalAssistantProps> = ({ config, onChange, onHighlightPort }) => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Honor a tu robot, Operador. Soy tu Ingeniero Samurái. ¿Qué táctica deseas perfeccionar hoy?" }
    ]);
    const [input, setInput] = useState('');
    const [proposal, setProposal] = useState<ProposedChange | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const findSemanticAction = (text: string): ProposedChange | string => {
        const t = text.toLowerCase();
        const isYellow = config.ROBOT_MODEL === 'YELLOW';
        const isBlue = config.ROBOT_MODEL === 'BLUE';

        // 1. SEGURIDAD ABSOLUTA (Prototipo Samurái)
        if (t.includes('puerto e') || t.includes('puerto f') || t.includes('traccion') || t.includes('traction') || t.includes('motores ruedas')) {
            return "🚫 PROTOCOLO DE SEGURIDAD: Los puertos de tracción E y F son el alma del movimiento. Ninguna IA tiene permiso para alterar el chasis físico.";
        }
        if (t.includes('color') || t.includes('suelo') || t.includes('dojo') || t.includes('puerto b')) {
            return "🛡️ CAPA 0 PROTEGIDA: El Sensor de Color (Puerto B) es la línea entre la victoria y el suicidio. Su prioridad es inmutable.";
        }

        // 2. MODELO AMARILLO (S69 Martillo)
        if (isYellow) {
            if (t.includes('martillazo') || t.includes('ataque') || t.includes('golpe')) {
                if (t.includes('fuerte') || t.includes('duro') || t.includes('maximo')) {
                    return { key: 'VELOCIDAD_GOLPE', value: 1000, description: "Ajustar Martillo (Puerto D) a máxima potencia sacrificando precisión.", port: 'D' };
                }
                if (t.includes('suave') || t.includes('lento') || t.includes('presicion')) {
                    return { key: 'VELOCIDAD_GOLPE', value: 400, description: "Reducir velocidad de martillo para ataques calculados.", port: 'D' };
                }
            }
            if (t.includes('subir') || t.includes('pala') || t.includes('levantar')) {
                return "❌ INCOMPATIBILIDAD FÍSICA: Este robot es de clase MARTILLO. No posee mecanismos de elevación o palas.";
            }
        }

        // 3. MODELO AZUL (Loader)
        if (isBlue) {
            if (t.includes('pala') || t.includes('subir') || t.includes('elevacion') || t.includes('levantar')) {
                if (t.includes('embrague') || t.includes('scoop')) {
                    return { key: 'EMBRAGUE_PALA_ACTIVO', value: true, description: "Activar modo EMBRAGUE. Movimiento coordinado de Puertos C y D.", port: 'C' };
                }
                return { key: 'LIFT_HIGH_POS', value: 450, description: "Aumentar ángulo máximo de elevación de la pala (Puerto D).", port: 'D' };
            }
            if (t.includes('martillo') || t.includes('golpe')) {
                return "❌ ERROR DE HARDWARE: El modelo Azul utiliza sistema de elevación, no posee martillo de impacto.";
            }
        }

        // 4. ESTRATEGIAS COMUNES
        if (t.includes('sigilo') || t.includes('fantasma') || t.includes('esconder')) {
            return { key: 'MODO_FANTASMA', value: true, description: "Activar MODO_FANTASMA. Matriz LED apagada en combate para sigilo táctico." };
        }
        if (t.includes('escapar') || t.includes('retrocede') || t.includes('huir')) {
            return { key: 'DIST_RETROCESO', value: 250, description: "Aumentar distancia de retroceso a 250mm tras contacto." };
        }
        if (t.includes('ariete') || t.includes('embiste') || t.includes('arremete')) {
            return { key: 'ESTRATEGIA_ARIETE', value: true, description: "Activar agresividad de ARIETE. Empuje continuo tras detección." };
        }
        if (t.includes('cara') || t.includes('enfadado') || t.includes('Berserker')) {
            return { key: 'INDICE_CARA', value: 2, description: "Cambiar personalidad a 'Berserker' (Cara 2) tras detección de rival." };
        }

        return "No reconozco esa instrucción táctica. Puedo ayudarte con el martillo, la pala, el sigilo o la personalidad de tu robot.";
    };

    const handleSend = () => {
        if (!input.trim() || proposal) return;

        const userMsg = { role: 'user' as const, content: input };
        setMessages(prev => [...prev, userMsg]);
        const result = findSemanticAction(userMsg.content);

        setTimeout(() => {
            if (typeof result === 'string') {
                setMessages(prev => [...prev, { role: 'assistant', content: result }]);
            } else {
                setProposal(result);
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `He interpretado tu intención. Propongo aplicar el siguiente cambio de ingeniería:\n"${result.description}"`
                }]);
                if (result.port) {
                    onHighlightPort(result.port);
                }
            }
        }, 500);
        setInput('');
    };

    const confirmProposal = () => {
        if (!proposal) return;

        let newConfig = { ...config };
        if (proposal.key === 'MAPEO_ACCIONES') {
            // Logic for complex mapping if needed
        } else {
            (newConfig as any)[proposal.key] = proposal.value;
        }

        onChange(newConfig);
        setMessages(prev => [...prev, { role: 'assistant', content: "✅ Cambio aplicado con honor. El Master Code ha sido actualizado." }]);
        setProposal(null);
        onHighlightPort(null);
    };

    const cancelProposal = () => {
        setMessages(prev => [...prev, { role: 'assistant', content: "Entendido. Mantendré la configuración actual intacta." }]);
        setProposal(null);
        onHighlightPort(null);
    };

    return (
        <div className="cyber-box flex flex-col h-[340px] border-neon-magenta/10 bg-black/60 overflow-hidden mb-4 shadow-[0_0_20px_rgba(217,70,239,0.1)]">
            <div className="bg-slate-950 px-4 py-2 border-b border-neon-magenta/30 flex justify-between items-center shrink-0">
                <span className="text-neon-magenta text-[10px] font-black tracking-[0.2em] uppercase flex items-center gap-2">
                    <Bot className="w-3 h-3" />
                    Ingeniero_Samurái_V25
                </span>
                <div className="flex items-center gap-2 text-[8px] text-slate-500 font-bold uppercase">
                    <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                    Semantic_Link_OK
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4 font-mono scroll-smooth bg-gradient-to-b from-transparent to-neon-magenta/5"
            >
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}
                    >
                        <div className={`px-3 py-2 rounded-lg text-[10px] leading-relaxed relative ${msg.role === 'user'
                                ? 'bg-slate-800 text-slate-200 border-l-2 border-slate-500 shadow-lg'
                                : 'bg-neon-magenta/10 text-slate-300 border-l-2 border-neon-magenta shadow-[0_0_15px_rgba(217,70,239,0.05)] italic font-light'
                            }`}>
                            {msg.content}
                            {msg.role === 'assistant' && <div className="absolute -left-1 top-2 w-2 h-2 bg-neon-magenta rotate-45 -z-10" />}
                        </div>
                    </div>
                ))}

                {proposal && (
                    <div className="self-center w-full bg-slate-900/80 border border-neon-magenta/40 p-3 rounded-md flex flex-col gap-3 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-2">
                            <Info className="w-3.5 h-3.5 text-neon-magenta" />
                            <span className="text-[9px] font-black text-neon-magenta uppercase tracking-widest">Validación de Ingeniería</span>
                        </div>
                        <p className="text-[9px] text-slate-400 italic">"{proposal.description}"</p>
                        <div className="flex gap-2">
                            <button
                                onClick={confirmProposal}
                                className="flex-1 bg-neon-green/10 hover:bg-neon-green/20 border border-neon-green/40 text-neon-green text-[9px] font-bold py-1.5 rounded transition-all flex items-center justify-center gap-1.5"
                            >
                                <Check className="w-3 h-3" /> CONFIRMAR
                            </button>
                            <button
                                onClick={cancelProposal}
                                className="flex-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 text-red-500 text-[9px] font-bold py-1.5 rounded transition-all flex items-center justify-center gap-1.5"
                            >
                                <X className="w-3 h-3" /> CANCELAR
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-3 bg-slate-950/80 border-t border-white/5 flex gap-2 shrink-0">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    disabled={!!proposal}
                    placeholder={proposal ? "Valida el cambio anterior..." : "Orden táctica (ej: 'Embiste con fuerza')..."}
                    className="flex-1 bg-black border border-white/10 rounded px-3 py-1.5 text-[10px] text-slate-300 focus:border-neon-magenta outline-none transition-all placeholder:text-slate-700 disabled:opacity-50"
                />
                <button
                    onClick={handleSend}
                    disabled={!!proposal}
                    className="p-2 bg-neon-magenta/10 border border-neon-magenta/30 text-neon-magenta rounded-md hover:bg-neon-magenta/20 transition-all shadow-[0_0_10px_rgba(217,70,239,0.2)] disabled:opacity-50"
                >
                    <Send className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="bg-black py-1 px-3 flex items-center justify-between border-t border-white/5">
                <div className="flex items-center gap-1.5">
                    <ShieldAlert className="w-2.5 h-2.5 text-slate-600" />
                    <span className="text-[7px] text-slate-600 font-bold uppercase tracking-widest">
                        Safety_Prot: V2.5.Active
                    </span>
                </div>
                <div className="text-[7px] text-slate-700 font-mono">
                    MODEL_CLASS: {config.ROBOT_MODEL}
                </div>
            </div>
        </div>
    );
};
