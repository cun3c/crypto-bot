import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ModeToggle } from './components/ModeToggle';
import { useWebSocket } from './hooks/useWebSocket';

import Dashboard from './pages/Dashboard';
import Trades from './pages/Trades';
import Signals from './pages/Signals';
import Stats from './pages/Stats';
import Settings from './pages/Settings';

function NavLinks() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const links = [
    { path: '/', label: 'Dashboard' },
    { path: '/trades', label: 'Trades' },
    { path: '/signals', label: 'Signals' },
    { path: '/stats', label: 'Statistics' },
    { path: '/settings', label: 'Settings' }
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex space-x-6 text-sm font-medium w-full shadow-sm justify-center">
      {links.map(link => (
        <Link 
          key={link.path} 
          to={link.path} 
          className={`transition-colors px-3 py-2 rounded-md ${currentPath === link.path ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'}`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function App() {
  // Define the base API URL (Fallback to localhost if the ENV var is missing)
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
  
  useWebSocket(wsUrl);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col items-center w-full max-w-none border-none">
        <ModeToggle />
        <NavLinks />

        <main className="w-full max-w-7xl p-6 text-left">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trades" element={<Trades />} />
            <Route path="/signals" element={<Signals />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
