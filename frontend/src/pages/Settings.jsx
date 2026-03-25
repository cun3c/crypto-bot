import React, { useState, useEffect } from 'react';
import { Save, Key, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    use_risk_management: true,
    risk_per_trade_pct: 1.0,
    max_open_trades: 5,
    default_stop_loss_pct: 2.0,
    default_take_profit_pct: 4.0,
    allowed_symbols: "BTCUSDT, ETHUSDT, SOLUSDT"
  });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${apiUrl}/settings`);
        setFormData({
          ...res.data,
          allowed_symbols: Array.isArray(res.data.allowed_symbols) 
            ? res.data.allowed_symbols.join(", ") 
            : res.data.allowed_symbols
        });
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    fetchSettings();
  }, [apiUrl]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${apiUrl}/settings`, {
        ...formData,
        risk_per_trade_pct: parseFloat(formData.risk_per_trade_pct),
        max_open_trades: parseInt(formData.max_open_trades, 10),
        default_stop_loss_pct: parseFloat(formData.default_stop_loss_pct),
        default_take_profit_pct: parseFloat(formData.default_take_profit_pct),
      });
      alert('Settings saved successfully!');
    } catch (err) {
      console.error("Failed to save settings", err);
      alert("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Bot Configuration</h2>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Risk Management Toggle */}
        <div className={`rounded-xl shadow-sm border overflow-hidden transition-colors ${formData.use_risk_management ? 'bg-white border-gray-100' : 'bg-red-50/30 border-red-200'}`}>
          <div className={`border-b px-6 py-4 flex items-center justify-between ${formData.use_risk_management ? 'border-gray-200 bg-gray-50' : 'border-red-200 bg-red-100/50'}`}>
            <div className="flex items-center gap-3">
              <ShieldAlert className={`h-5 w-5 ${formData.use_risk_management ? 'text-gray-500' : 'text-red-600'}`} />
              <h3 className={`text-lg leading-6 font-medium ${formData.use_risk_management ? 'text-gray-900' : 'text-red-900'}`}>
                Risk Management Engine
              </h3>
            </div>
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="use_risk_management"
                  checked={formData.use_risk_management}
                  onChange={handleChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                <span className={`ml-3 text-sm font-medium ${formData.use_risk_management ? 'text-gray-900' : 'text-red-600'}`}>
                  {formData.use_risk_management ? 'Enabled' : 'DISABLED (DANGER)'}
                </span>
              </label>
            </div>
          </div>
          
          <div className={`px-6 py-5 space-y-6 sm:p-6 transition-opacity ${formData.use_risk_management ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Risk Per Trade (%)</label>
                <div className="mt-1">
                  <input type="number" step="0.1" name="risk_per_trade_pct" value={formData.risk_per_trade_pct} onChange={handleChange} disabled={!formData.use_risk_management} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Max Open Trades</label>
                <div className="mt-1">
                  <input type="number" name="max_open_trades" value={formData.max_open_trades} onChange={handleChange} disabled={!formData.use_risk_management} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Default Stop Loss (%)</label>
                <div className="mt-1">
                  <input type="number" step="0.1" name="default_stop_loss_pct" value={formData.default_stop_loss_pct} onChange={handleChange} disabled={!formData.use_risk_management} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Default Take Profit (%)</label>
                <div className="mt-1">
                  <input type="number" step="0.1" name="default_take_profit_pct" value={formData.default_take_profit_pct} onChange={handleChange} disabled={!formData.use_risk_management} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700">Allowed Symbols (comma separated whitelist)</label>
                <div className="mt-1">
                  <input type="text" name="allowed_symbols" value={formData.allowed_symbols} onChange={handleChange} disabled={!formData.use_risk_management} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center gap-3">
            <Key className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">Exchange Integration (Binance)</h3>
          </div>
          <div className="px-6 py-5 space-y-6 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700">API Key</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input type="password" placeholder="Configured securely in backend .env" disabled className="flex-1 block w-full min-w-0 rounded-md sm:text-sm border-gray-300 p-2 border bg-gray-50 cursor-not-allowed text-gray-500" />
                </div>
              </div>
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700">API Secret</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input type="password" placeholder="Configured securely in backend .env" disabled className="flex-1 block w-full min-w-0 rounded-md sm:text-sm border-gray-300 p-2 border bg-gray-50 cursor-not-allowed text-gray-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50">
            <Save className="h-5 w-5 mr-2" />
            {loading ? 'Saving to Database...' : 'Save Configuration'}
          </button>
        </div>

      </form>
    </div>
  );
}