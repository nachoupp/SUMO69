import { useState } from 'react';
import { HubVisualizer } from './components/HubVisualizer';
import { EngineerModeVisualizer } from './components/EngineerModeVisualizer';
import { ParameterEditor } from './components/ParameterEditor';
import { ButtonMapper } from './components/ButtonMapper';
import { BotWorkshop } from './components/BotWorkshop';
import type { SumoConfig, RobotModel } from './types';
import { DEFAULT_CONFIG } from './types';
import { usePybricksBle } from './hooks/usePybricksBle';
import { Terminal, Cpu, Zap, Shield, Settings, Bluetooth, BluetoothOff, AlertTriangle, Command, Eye, Wrench } from 'lucide-react';


import { ScriptUploader } from './components/ScriptUploader';

function App() {
  const [config, setConfig] = useState<SumoConfig>(DEFAULT_CONFIG);
  const [activeMode, setActiveMode] = useState(0);
  const [highlightedPort] = useState<string | null>(null);
  const [workshopOpen, setWorkshopOpen] = useState(false);
  const { isConnected, isConnecting, connect, disconnect, deviceName, error } = usePybricksBle();

  const handleModeChange = () => {
    setActiveMode((prev) => (prev + 1) % 4);
  };

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

      {/* 🛠️ Main Content Grid */}
      <main className="flex-1 min-h-0 flex">

        {/* 🎛️ Left Column: Parameters & Mapping */}
        <aside className="w-80 border-r border-white/10 bg-black/20 overflow-y-auto custom-scrollbar flex flex-col gap-4">
          <div className="p-4 flex flex-col gap-6">
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-1">
                <Settings className="w-4 h-4 text-neon-green" />
                <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase">TACTICAL_PARAMS</h2>
              </div>
              <ParameterEditor config={config} onChange={setConfig} />
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-1">
                <Command className="w-4 h-4 text-neon-magenta" />
                <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase">BUTTON_MAPS</h2>
              </div>

              {/* Mode Tabs */}
              <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
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

              <ButtonMapper config={config} activeMode={activeMode} onChange={setConfig} />
            </section>
          </div>
        </aside>

        {/* 🤖 Center Column: Visualization */}
        <section
          className="flex-1 flex flex-col transition-colors duration-1000 relative overflow-y-auto custom-scrollbar"
          style={{
            background: config.ROBOT_MODEL === 'YELLOW'
              ? 'radial-gradient(circle at center, #1e1b0b 0%, #030712 100%)'
              : 'radial-gradient(circle at center, #0b172a 0%, #030712 100%)'
          }}
        >
          {/* Decorative Grid Overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(${config.ROBOT_MODEL === 'YELLOW' ? '#f59e0b' : '#0ea5e9'} 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />

          <div className="flex flex-col items-center justify-start gap-4 py-6 px-8 z-10">
            <div className="flex flex-col xl:flex-row gap-6 items-center">
              <div className="flex flex-col items-center gap-2 scale-75">
                <span className={`text-[10px] font-bold tracking-[0.3em] uppercase opacity-50 ${config.ROBOT_MODEL === 'YELLOW' ? 'text-neon-orange' : 'text-neon-blue'}`}>
                  Hub Core v2.5 :: {config.ROBOT_MODEL}
                </span>
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

              <div className="flex flex-col items-center gap-2 scale-75">
                <span className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase opacity-50">Engineer_Mode_Access</span>
                <EngineerModeVisualizer />
              </div>
            </div>

            {/* Tactical Hud Info */}
            <div className={`grid grid-cols-4 gap-4 w-full max-w-2xl px-4 py-3 cyber-box transition-colors duration-500 bg-black/60 ${config.ROBOT_MODEL === 'YELLOW' ? 'border-neon-orange/20' : 'border-neon-blue/20'
              }`}>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Detection_Range</span>
                <div className="flex items-center gap-2">
                  <Eye className={`w-3 h-3 ${config.ROBOT_MODEL === 'YELLOW' ? 'text-neon-orange' : 'text-neon-blue'}`} />
                  <span className="text-sm font-bold text-slate-200">{config.DISTANCIA_ATAQUE}mm</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">System_State</span>
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3 text-neon-magenta" />
                  <span className="text-sm font-bold text-slate-200 uppercase tracking-tighter">
                    {activeMode === 0 ? 'Drive' : activeMode === 1 ? 'Action' : activeMode === 2 ? 'Auto' : 'Mental'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Hacker_Channel</span>
                <div className="flex items-center gap-2">
                  <Bluetooth className="w-3 h-3 text-neon-blue" />
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={config.CANAL_HACKER}
                    onChange={(e) => setConfig({ ...config, CANAL_HACKER: Math.max(0, Math.min(255, parseInt(e.target.value) || 0)) })}
                    className="w-12 bg-transparent text-sm font-bold text-slate-200 border-b border-neon-blue/50 focus:border-neon-blue outline-none"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Hardware_ID</span>
                <div className="flex items-center gap-2">
                  <Terminal className={`w-3 h-3 ${config.ROBOT_MODEL === 'YELLOW' ? 'text-neon-orange' : 'text-neon-blue'}`} />
                  <span className="text-sm font-bold text-slate-200 uppercase">
                    {config.ROBOT_MODEL === 'YELLOW' ? 'S69_MARTILLO' : 'ML_PALA_ACT'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="absolute bottom-4 left-4 right-4 bg-red-950/80 border border-red-500/50 p-3 rounded flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Protocol Error</span>
                <span className="text-[10px] text-red-200/70 font-mono">{error}</span>
              </div>
            </div>
          )}
        </section>

        {/* ⚙️ Right Column: AI Assistant & Code Export */}
        <aside className="w-[450px] border-l border-neon-green/10 bg-slate-950/50 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4">

          <ScriptUploader config={config} />
        </aside>

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
