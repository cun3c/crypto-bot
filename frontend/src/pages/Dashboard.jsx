import React, { useEffect, useState } from 'react';
import { useBotStore } from '../store/botStore';
import { Wallet, TrendingUp, Activity, Percent, ArrowUpCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const mockData = [
  { name: 'Mon', equity: 10000 },
  { name: 'Tue', equity: 10200 },
  { name: 'Wed', equity: 10150 },
  { name: 'Thu', equity: 10400 },
  { name: 'Fri', equity: 10350 },
  { name: 'Sat', equity: 10600 },
  { name: 'Sun', equity: 10800 },
];

export default function Dashboard() {
  const { mode, balance, trades, wsStatus } = useBotStore();
  const [topGainers, setTopGainers] = useState([]);
  const [loadingGainers, setLoadingGainers] = useState(true);

  useEffect(() => {
    const fetchTopGainers = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const res = await axios.get(`${apiUrl}/stats/top-gainers?mode=${mode}&limit=5`);
        setTopGainers(res.data);
      } catch (err) {
        console.error("Failed to fetch top gainers:", err);
      } finally {
        setLoadingGainers(false);
      }
    };
    
    fetchTopGainers();
    const interval = setInterval(fetchTopGainers, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [mode]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard Overview</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span className="relative flex h-3 w-3">
            {wsStatus === 'connected' ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </>
            ) : (
               <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            )}
          </span>
          <span>{wsStatus === 'connected' ? 'Systems Online' : 'Connecting...'}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-100 transition hover:shadow-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-50 rounded-md p-3">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Balance</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-bold text-gray-900">${balance.toFixed(2)}</div>
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-100 transition hover:shadow-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-50 rounded-md p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Today's PnL</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-bold text-green-600">+$234.50</div>
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-100 transition hover:shadow-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-50 rounded-md p-3">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Open Trades</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-bold text-gray-900">{trades.filter(t => t.status === 'open').length}</div>
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-100 transition hover:shadow-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-orange-50 rounded-md p-3">
                <Percent className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Win Rate</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-bold text-gray-900">67.4%</div>
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart & Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Equity Curve */}
        <div className="bg-white shadow-sm sm:rounded-xl border border-gray-100 p-6 lg:col-span-2">
          <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-4">Equity Curve (7 Days)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} domain={['dataMin - 100', 'dataMax + 100']} />
                <Tooltip 
                  contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#111827', fontWeight: 600 }}
                />
                <Line type="monotone" dataKey="equity" stroke="#6366F1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, stroke: '#4F46E5', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Gainers Scanner */}
        <div className="bg-white shadow-sm sm:rounded-xl border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-semibold text-gray-900 flex items-center">
              <ArrowUpCircle className="h-5 w-5 text-green-500 mr-2" /> 
              Top Gainers (24h)
            </h3>
            <span className="text-xs text-gray-400">Live</span>
          </div>
          
          <div className="flex-1 overflow-hidden">
            {loadingGainers ? (
              <div className="flex justify-center items-center h-full text-gray-400">Scanning markets...</div>
            ) : topGainers.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">No data available</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {topGainers.map((gainer, idx) => (
                  <li key={gainer.symbol} className="py-3 flex justify-between items-center hover:bg-gray-50 px-2 rounded-md transition-colors">
                    <div className="flex items-center">
                      <span className="text-sm font-bold text-gray-900 mr-2">{idx + 1}.</span>
                      <span className="text-sm font-medium text-gray-700">{gainer.symbol.replace('/USDT', '')}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">+{gainer.change.toFixed(2)}%</p>
                      <p className="text-xs text-gray-500 font-mono">${gainer.last}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <a href="/settings" className="text-xs text-indigo-600 hover:text-indigo-500 font-medium">Configure Scanner Limits →</a>
          </div>
        </div>
      </div>
    </div>
  );
}
