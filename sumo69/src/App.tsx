import { useState } from 'react';
import { HubVisualizer } from './components/HubVisualizer';
import { EngineerModeVisualizer } from './components/EngineerModeVisualizer';
import { ParameterEditor } from './components/ParameterEditor';
import { ButtonMapper } from './components/ButtonMapper';
import { BotWorkshop } from './components/BotWorkshop';
import type { SumoConfig, RobotModel } from './types';
import { DEFAULT_CONFIG } from './types';
import { usePybricksBle } from './hooks/usePybricksBle';
import { Terminal, Cpu, Zap, Settings, Bluetooth, BluetoothOff, AlertTriangle, Command, Eye, Wrench } from 'lucide-react';

import ReactGridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const Grid = ReactGridLayout as any;

const initialLayout = [
  { i: 'params', x: 0, y: 0, w: 3, h: 8 },
  { i: 'buttons', x: 3, y: 0, w: 3, h: 6 },
  { i: 'hub', x: 6, y: 0, w: 6, h: 6 },
  { i: 'tactical', x: 3, y: 6, w: 9, h: 2 },
  { i: 'ai', x: 0, y: 8, w: 6, h: 6 },
  { i: 'terminal', x: 6, y: 8, w: 3, h: 6 },
  { i: 'script', x: 9, y: 8, w: 3, h: 6 },
];

import { ScriptUploader } from './components/ScriptUploader';
import { HubTerminal } from './components/HubTerminal';
import { AITacticalAssistant } from './components/AITacticalAssistant';

function App() {
  const [config, setConfig] = useState<SumoConfig>(DEFAULT_CONFIG);
  const [activeMode, setActiveMode] = useState(0);
  const [highlightedPort, setHighlightedPort] = useState<string | null>(null);
  const [workshopOpen, setWorkshopOpen] = useState(false);
  const { isConnected, isConnecting, connect, disconnect, deviceName, error, output, sendCommand, clearOutput } = usePybricksBle();

  const status = isConnecting
    ? { label: 'SYNCHRONIZING...', color: 'text-neon-orange animate-pulse' }
    : isConnected
      ? { label: 'LINK_ESTABLISHED', color: 'text-neon-green' }
      : { label: 'SYSTEM_OFFLINE', color: 'text-slate-500' };

  const handleModelToggle = (model: RobotModel) => {
    setConfig(prev => ({
      ...prev,
      ROBOT_MODEL: model,
      // Reset specific mappings if needed or just keep them
    }));
  };

  return (
    <div className="min-h-screen bg-dark text-slate-100 font-mono selection:bg-neon-green selection:text-dark flex flex-col relative">
      <div className="scanline" />

      {/* 📡 Header / Top Bar */}
      <header className="h-16 border-b border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-between px-6 z-20 shrink-0">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-neon-green/10 rounded flex items-center justify-center border border-neon-green/30">
              <Cpu className="w-5 h-5 text-neon-green" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter leading-none italic">
                SUMO_MASTER <span className="text-neon-green">V25</span>
              </h1>
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Advanced Robot Control Interface</p>
            </div>
          </div>

          <div className="h-8 w-[1px] bg-white/10" />

          {/* Model Selector */}
          <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
            <button
              onClick={() => handleModelToggle('YELLOW')}
              className={`px-4 py-1 text-[10px] font-bold rounded flex items-center gap-2 transition-all ${config.ROBOT_MODEL === 'YELLOW'
                ? 'bg-neon-orange/20 text-neon-orange shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'text-slate-500 hover:text-slate-400'
                }`}
            >
              <Zap className="w-3 h-3" />
              MODELO_AMARILLO
            </button>
            <button
              onClick={() => handleModelToggle('BLUE')}
              className={`px-4 py-1 text-[10px] font-bold rounded flex items-center gap-2 transition-all ${config.ROBOT_MODEL === 'BLUE'
                ? 'bg-neon-blue/20 text-neon-blue shadow-[0_0_10px_rgba(14,165,233,0.2)]'
                : 'text-slate-500 hover:text-slate-400'
                }`}
            >
              <Command className="w-3 h-3" />
              MODELO_AZUL
            </button>
            <button
              onClick={() => handleModelToggle('TEST')}
              className={`px-4 py-1 text-[10px] font-bold rounded flex items-center gap-2 transition-all ${config.ROBOT_MODEL === 'TEST'
                ? 'bg-slate-700/50 text-slate-200 shadow-[0_0_10px_rgba(255,255,255,0.1)]'
                : 'text-slate-500 hover:text-slate-400'
                }`}
            >
              <Terminal className="w-3 h-3" />
              TEST_CONN
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 text-[10px] font-bold tracking-widest ${status.color}`}>
            <div className={`w-2 h-2 rounded-full bg-current ${isConnected ? 'animate-pulse' : ''}`} />
            {status.label} {deviceName && `:: ${deviceName.toUpperCase()}`}
          </div>

          <button
            onClick={() => setWorkshopOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold border transition-all bg-purple-500/10 border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
          >
            <Wrench className="w-3 h-3" />
            WORKSHOP
          </button>

          <button
            onClick={isConnected ? disconnect : connect}
            disabled={isConnecting}
            className={`flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold border transition-all ${isConnected
              ? 'bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/20'
              : 'bg-neon-green/10 border-neon-green/50 text-neon-green hover:bg-neon-green/20'
              }`}
          >
            {isConnected ? <BluetoothOff className="w-3 h-3" /> : <Bluetooth className="w-3 h-3" />}
            {isConnected ? 'DISCONNECT' : 'INITIALIZE_LINK'}
          </button>
        </div>
      </header>

      {/* 🛠️ Main Content Grid - Draggable Layout */}
      <main className="flex-1 min-h-0 overflow-auto custom-scrollbar bg-dark" style={{
        background: config.ROBOT_MODEL === 'YELLOW'
          ? 'radial-gradient(circle at center, #1e1b0b 0%, #030712 100%)'
          : 'radial-gradient(circle at center, #0b172a 0%, #030712 100%)'
      }}>
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(${config.ROBOT_MODEL === 'YELLOW' ? '#f59e0b' : '#0ea5e9'} 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />

        <div className="p-2">
          <div className="mb-2 text-center">
            <span className="text-[10px] text-neon-green font-bold uppercase tracking-widest bg-neon-green/10 px-3 py-1 rounded border border-neon-green/30">
              🖱️ MODO EDICIÓN: Arrastra y redimensiona los paneles
            </span>
          </div>

          <Grid
            className="layout"
            layout={initialLayout}
            cols={12}
            rowHeight={60}
            width={1600}
            draggableHandle=".drag-handle"
            onLayoutChange={(newLayout: any) => {
              console.log('📐 Layout changed:', newLayout);
            }}
          >
            {/* 🎛️ Parameters Panel */}
            <div key="params" className="bg-black/60 border border-white/10 rounded-lg overflow-hidden flex flex-col">
              <div className="drag-handle flex items-center gap-2 border-b border-white/10 p-2 cursor-move bg-black/40 hover:bg-neon-green/10 transition-colors">
                <Settings className="w-4 h-4 text-neon-green" />
                <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase flex-1">TACTICAL_PARAMS</h2>
                <span className="text-[8px] text-slate-600">⋮⋮</span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                <ParameterEditor config={config} onChange={setConfig} />
              </div>
            </div>

            {/* 🎮 Button Maps Panel */}
            <div key="buttons" className="bg-black/60 border border-white/10 rounded-lg overflow-hidden flex flex-col">
              <div className="drag-handle flex items-center gap-2 border-b border-white/10 p-2 cursor-move bg-black/40 hover:bg-neon-magenta/10 transition-colors">
                <Command className="w-4 h-4 text-neon-magenta" />
                <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase flex-1">BUTTON_MAPS</h2>
                <span className="text-[8px] text-slate-600">⋮⋮</span>
              </div>
              <div className="p-2">
                <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/5 mb-2">
                  {[0, 1, 2, 3].map((m) => (
                    <button
                      key={m}
                      onClick={() => setActiveMode(m)}
                      className={`flex-1 py-1 text-[9px] font-bold rounded transition-all ${activeMode === m
                        ? `shadow-inner ${m === 0 ? 'bg-neon-green/20 text-neon-green' :
                          m === 1 ? 'bg-neon-orange/20 text-neon-orange' :
                            m === 2 ? 'bg-neon-magenta/20 text-neon-magenta' :
                              'bg-neon-blue/20 text-neon-blue'
                        }`
                        : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                      M{m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-3">
                <ButtonMapper config={config} activeMode={activeMode} onChange={setConfig} />
              </div>
            </div>

            {/* 🤖 Hub Visualizer Panel */}
            <div key="hub" className="bg-black/40 border border-white/10 rounded-lg overflow-hidden flex flex-col">
              <div className="drag-handle flex items-center gap-2 border-b border-white/10 p-2 cursor-move bg-black/40 hover:bg-neon-blue/10 transition-colors">
                <Cpu className={`w-4 h-4 ${config.ROBOT_MODEL === 'YELLOW' ? 'text-neon-orange' : 'text-neon-blue'}`} />
                <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase flex-1">HUB_CORE v2.5 :: {config.ROBOT_MODEL}</h2>
                <span className="text-[8px] text-slate-600">⋮⋮</span>
              </div>
              <div className="flex-1 flex items-center justify-center gap-4 p-2 overflow-auto">
                <div className="flex flex-col items-center gap-2 scale-[0.6]">
                  <HubVisualizer
                    number={config.MARCHAS_CAJA[0]}
                    mode={activeMode}
                    doubleVision={true}
                    ghostMode={config.MODO_FANTASMA}
                    showIcon={true}
                    robotModel={config.ROBOT_MODEL}
                    highlightedPort={highlightedPort}
                  />
                </div>
                <div className="flex flex-col items-center gap-2 scale-[0.6]">
                  <EngineerModeVisualizer />
                </div>
              </div>
            </div>

            {/* 📊 Tactical HUD Panel */}
            <div key="tactical" className="bg-black/60 border border-white/10 rounded-lg overflow-hidden flex flex-col">
              <div className="drag-handle flex items-center gap-2 border-b border-white/10 p-2 cursor-move bg-black/40 hover:bg-neon-orange/10 transition-colors">
                <Eye className={`w-4 h-4 ${config.ROBOT_MODEL === 'YELLOW' ? 'text-neon-orange' : 'text-neon-blue'}`} />
                <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase flex-1">TACTICAL_HUD</h2>
                <span className="text-[8px] text-slate-600">⋮⋮</span>
              </div>
              <div className="flex-1 grid grid-cols-4 gap-2 p-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Detection</span>
                  <span className="text-sm font-bold text-slate-200">{config.DISTANCIA_ATAQUE}mm</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">State</span>
                  <span className="text-sm font-bold text-slate-200">{activeMode === 0 ? 'Drive' : activeMode === 1 ? 'Action' : activeMode === 2 ? 'Auto' : 'Mental'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Channel</span>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={config.CANAL_HACKER}
                    onChange={(e) => setConfig({ ...config, CANAL_HACKER: Math.max(0, Math.min(255, parseInt(e.target.value) || 0)) })}
                    className="w-12 bg-transparent text-sm font-bold text-slate-200 border-b border-neon-blue/50 focus:border-neon-blue outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">HW_ID</span>
                  <span className="text-sm font-bold text-slate-200">{config.ROBOT_MODEL === 'YELLOW' ? 'MARTILLO' : 'PALA'}</span>
                </div>
              </div>
            </div>

            {/* 🤖 AI Assistant Panel */}
            <div key="ai" className="bg-black/60 border border-neon-green/20 rounded-lg overflow-hidden flex flex-col">
              <div className="drag-handle flex items-center gap-2 border-b border-neon-green/20 p-2 cursor-move bg-black/40 hover:bg-neon-green/10 transition-colors">
                <Zap className="w-4 h-4 text-neon-green" />
                <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase flex-1">AI_ASSISTANT</h2>
                <span className="text-[8px] text-slate-600">⋮⋮</span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                <AITacticalAssistant
                  config={config}
                  onChange={setConfig}
                  onHighlightPort={setHighlightedPort}
                />
              </div>
            </div>

            {/* 📟 Terminal Panel */}
            <div key="terminal" className="bg-black/60 border border-white/10 rounded-lg overflow-hidden flex flex-col">
              <div className="drag-handle flex items-center gap-2 border-b border-white/10 p-2 cursor-move bg-black/40 hover:bg-slate-700/20 transition-colors">
                <Terminal className="w-4 h-4 text-slate-400" />
                <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase flex-1">HUB_TERMINAL</h2>
                <span className="text-[8px] text-slate-600">⋮⋮</span>
              </div>
              <div className="flex-1 overflow-hidden p-2">
                <HubTerminal
                  isConnected={isConnected}
                  output={output}
                  sendCommand={sendCommand}
                  clearOutput={clearOutput}
                />
              </div>
            </div>

            {/* 📤 Script Uploader Panel */}
            <div key="script" className="bg-black/60 border border-white/10 rounded-lg overflow-hidden flex flex-col">
              <div className="drag-handle flex items-center gap-2 border-b border-white/10 p-2 cursor-move bg-black/40 hover:bg-neon-blue/10 transition-colors">
                <Bluetooth className="w-4 h-4 text-neon-blue" />
                <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase flex-1">SCRIPT_UPLOAD</h2>
                <span className="text-[8px] text-slate-600">⋮⋮</span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                <ScriptUploader config={config} />
              </div>
            </div>
          </Grid>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="fixed bottom-20 left-4 right-4 bg-red-950/80 border border-red-500/50 p-3 rounded flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 z-50">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Protocol Error</span>
              <span className="text-[10px] text-red-200/70 font-mono">{error}</span>
            </div>
          </div>
        )}
      </main>

      {/* 📟 Footer Status Bar */}
      {/* Bot Workshop Modal */}
      <BotWorkshop
        isOpen={workshopOpen}
        onClose={() => setWorkshopOpen(false)}
        onLoadBot={(loadedConfig) => setConfig(loadedConfig)}
      />

      <footer className="h-8 border-t border-neon-green/10 bg-slate-900 px-4 flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest shrink-0">
        <div className="flex gap-4">
          <span>Cpu_Load: 14%</span>
          <span>Temp: 44°C</span>
          <span>Buffer: SYNC_OK</span>
        </div>
        <div className="flex gap-4 items-center">
          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-neon-green" /> Encryption Active</span>
          <span>© 2026 DeepMind Antigravity Systems</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
