import React, { useEffect } from 'react';
import { useBotStore } from '../store/botStore';
import axios from 'axios';
import { Wifi, Server, Cpu } from 'lucide-react';

export function ModeToggle() {
  const { mode, setMode, wsStatus, exchangeStatus, setExchangeStatus } = useBotStore();
  const [loading, setLoading] = React.useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const checkExchange = async () => {
      try {
        setExchangeStatus('connecting');
        const res = await axios.get(`${apiUrl}/account/status?mode=${mode}`);
        if (res.data.status === 'connected') {
          setExchangeStatus('connected');
        } else {
          setExchangeStatus('error');
        }
      } catch (err) {
        setExchangeStatus('error');
      }
    };
    checkExchange();
    const interval = setInterval(checkExchange, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [mode, apiUrl]);

  const toggleMode = async () => {
    const nextMode = mode === 'demo' ? 'live' : 'demo';
    
    if (nextMode === 'live') {
      const confirmed = window.confirm("WARNING: Switching to LIVE mode will use real money. Proceed?");
      if (!confirmed) return;
    }

    setLoading(true);
    try {
      await axios.post(`${apiUrl}/mode/switch`, { mode: nextMode });
      setMode(nextMode);
    } catch (err) {
      console.error("Failed to switch mode", err);
      alert("Failed to switch mode. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-900 text-white shadow-md w-full sticky top-0 z-50">
      <div className="flex items-center">
        <h1 className="text-xl font-bold tracking-tight mr-4">🤖 Crypto Algo Bot</h1>
        
        {/* Status Indicators */}
        <div className="flex items-center space-x-4 ml-2 mr-6 text-sm font-medium">
          <div className="flex items-center space-x-1.5" title="WebSocket Connection">
            <Wifi className={`h-4 w-4 ${wsStatus === 'connected' ? 'text-green-400' : wsStatus === 'connecting' ? 'text-yellow-400' : 'text-red-400'}`} />
            <span className={wsStatus === 'connected' ? 'text-gray-300' : 'text-gray-400'}>Server</span>
          </div>
          <div className="flex items-center space-x-1.5" title="Binance API Connection">
            <Server className={`h-4 w-4 ${exchangeStatus === 'connected' ? 'text-green-400' : exchangeStatus === 'connecting' ? 'text-yellow-400' : 'text-red-400'}`} />
            <span className={exchangeStatus === 'connected' ? 'text-gray-300' : 'text-gray-400'}>Exchange</span>
          </div>
        </div>

        <div className={`px-3 py-1 text-xs font-bold rounded-full border tracking-wide uppercase ${mode === 'live' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-blue-500/20 text-blue-400 border-blue-500/50'}`}>
          {mode === 'live' ? '⚠️ Live Trading' : '🧪 Paper Trading'}
        </div>
      </div>
      
      <button 
        onClick={toggleMode} 
        disabled={loading}
        className={`px-4 py-2 font-medium text-sm rounded-md transition-colors ${mode === 'live' ? 'bg-gray-800 hover:bg-blue-700 text-white border border-gray-700' : 'bg-red-600 hover:bg-red-700 text-white shadow-sm'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Switching...' : (mode === 'live' ? 'Switch to DEMO' : 'DANGER: Switch to LIVE')}
      </button>
    </div>
  );
}
