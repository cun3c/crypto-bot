import { useEffect, useRef } from 'react';
import { useBotStore } from '../store/botStore';

export function useWebSocket(url) {
  const ws = useRef(null);
  const { addSignal, addTrade, updateTrade, setBalance, setMode, setWsStatus } = useBotStore();

  useEffect(() => {
    let reconnectTimer;
    
    const connect = () => {
      setWsStatus('connecting');
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('WS Connected');
        setWsStatus('connected');
      };

      ws.current.onmessage = (event) => {
        try {
          const { event: eventName, data } = JSON.parse(event.data);
          
          switch (eventName) {
            case 'new_signal':
              addSignal(data);
              break;
            case 'trade_opened':
              addTrade(data);
              break;
            case 'trade_closed':
              updateTrade(data);
              break;
            case 'balance_update':
              setBalance(data.balance);
              break;
            case 'mode_changed':
              setMode(data.mode);
              break;
            default:
              console.log('Unknown WS event:', eventName);
          }
        } catch (err) {
          console.error('WS parsing error:', err);
        }
      };

      ws.current.onclose = () => {
        console.log('WS Disconnected, attempting reconnect in 5s...');
        setWsStatus('disconnected');
        reconnectTimer = setTimeout(() => {
          connect();
        }, 5000);
      };
      
      ws.current.onerror = () => {
        setWsStatus('error');
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (ws.current) {
        ws.current.onclose = null; // Prevent reconnect on intentional unmount
        ws.current.close();
      }
    };
  }, [url]);

  return ws.current;
}
