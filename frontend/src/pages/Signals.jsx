import React from 'react';
import { useBotStore } from '../store/botStore';
import { RadioReceiver, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Signals() {
  const { signals } = useBotStore();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Live Signal Feed</h2>
        <div className="flex items-center space-x-2">
          <RadioReceiver className="h-5 w-5 text-indigo-500 animate-pulse" />
          <span className="text-sm font-medium text-gray-500">Listening to Webhooks...</span>
        </div>
      </div>

      {signals.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center">
          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <RadioReceiver className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No signals received</h3>
          <p className="mt-1 text-sm text-gray-500">Ensure TradingView alerts are pointing to your webhook URL.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <ul role="list" className="divide-y divide-gray-200">
            {signals.map((signal) => (
              <li key={signal.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {signal.status === 'processed' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" />
                    ) : signal.status === 'error' ? (
                      <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300 mr-3" />
                    )}
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        {signal.symbol} 
                        <span className={`px-2 py-0.5 text-xs rounded-full ${signal.action === 'BUY' ? 'bg-green-100 text-green-700' : signal.action === 'SELL' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                          {signal.action}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                        <span className="font-mono bg-gray-100 px-1 rounded">{signal.strategy_name}</span>
                        <span>•</span>
                        <span>Price: ${signal.price_at_signal}</span>
                        <span>•</span>
                        <span>{new Date(signal.received_at).toLocaleTimeString()}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      signal.status === 'processed' ? 'bg-green-100 text-green-800' :
                      signal.status === 'ignored' ? 'bg-yellow-100 text-yellow-800' :
                      signal.status === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {signal.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
