import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOffline();

    const setIsOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-3 left-3 z-50 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-600/90 text-white text-xs font-medium backdrop-blur shadow-lg border border-amber-400/30 select-none">
      <WifiOff className="w-3.5 h-3.5 animate-pulse" />
      <span>Mode hors-ligne actif (PWA en cache)</span>
    </div>
  );
};
