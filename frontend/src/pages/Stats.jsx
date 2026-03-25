import React from 'react';
import { useBotStore } from '../store/botStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { name: 'BTCUSDT', wins: 12, losses: 4 },
  { name: 'ETHUSDT', wins: 8, losses: 6 },
  { name: 'SOLUSDT', wins: 15, losses: 2 },
];

export default function Statistics() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Performance Statistics</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-100 p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Total Trades</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">47</dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-100 p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Profit Factor</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">1.84</dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-100 p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Max Drawdown</dt>
          <dd className="mt-1 text-3xl font-semibold text-red-600">-4.2%</dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-100 p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Avg Win</dt>
          <dd className="mt-1 text-3xl font-semibold text-green-600">+$45.20</dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-100 p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Avg Loss</dt>
          <dd className="mt-1 text-3xl font-semibold text-red-600">-$24.50</dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-100 p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Sharpe Ratio</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">1.2</dd>
        </div>
      </div>

      <div className="bg-white shadow-sm sm:rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Wins vs Losses by Symbol</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: '#F3F4F6' }}
                contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="wins" stackId="a" fill="#34D399" radius={[0, 0, 4, 4]} />
              <Bar dataKey="losses" stackId="a" fill="#F87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
