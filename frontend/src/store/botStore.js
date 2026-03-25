import { create } from 'zustand'

export const useBotStore = create((set) => ({
  mode: 'demo',
  balance: 0,
  trades: [],
  signals: [],
  settings: {},
  wsStatus: 'connecting',
  exchangeStatus: 'connecting',
  topGainers: [],
  
  setMode: (mode) => set({ mode }),
  setBalance: (balance) => set({ balance }),
  setTrades: (trades) => set({ trades }),
  addTrade: (trade) => set((state) => ({ trades: [trade, ...state.trades] })),
  updateTrade: (trade) => set((state) => ({
    trades: state.trades.map(t => t.id === trade.id ? trade : t)
  })),
  setSignals: (signals) => set({ signals }),
  addSignal: (signal) => set((state) => ({ signals: [signal, ...state.signals] })),
  setSettings: (settings) => set({ settings }),
  setWsStatus: (status) => set({ wsStatus: status }),
  setExchangeStatus: (status) => set({ exchangeStatus: status }),
  setTopGainers: (gainers) => set({ topGainers: gainers }),
}))
