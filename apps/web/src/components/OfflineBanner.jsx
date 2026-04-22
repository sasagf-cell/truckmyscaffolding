
import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { processQueue, getQueue } from '@/lib/offlineSync.js';
import apiServerClient from '@/lib/apiServerClient.js';

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [queueLength, setQueueLength] = useState(0);

  useEffect(() => {
    // Initial check
    setQueueLength(getQueue().length);

    const handleOnline = async () => {
      setIsOffline(false);
      const queue = getQueue();
      if (queue.length > 0) {
        setSyncStatus('syncing');
        const success = await processQueue(apiServerClient);
        setSyncStatus(success ? 'success' : 'error');
        setQueueLength(getQueue().length);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSyncStatus('idle');
        }, 3000);
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      setQueueLength(getQueue().length);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodically check queue length if offline
    const interval = setInterval(() => {
      if (!navigator.onLine) {
        setQueueLength(getQueue().length);
      }
    }, 2000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (!isOffline && syncStatus === 'idle') return null;

  return (
    <div className={`px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 z-50 shrink-0 transition-colors shadow-sm ${
      isOffline ? 'bg-destructive text-destructive-foreground' : 
      syncStatus === 'syncing' ? 'bg-warning text-warning-foreground' :
      syncStatus === 'success' ? 'bg-success text-success-foreground' :
      'bg-destructive text-destructive-foreground'
    }`}>
      {isOffline && (
        <>
          <WifiOff className="w-4 h-4" />
          <span>You are currently offline. {queueLength > 0 ? `${queueLength} actions queued for sync.` : 'Changes will be saved locally.'}</span>
        </>
      )}
      {!isOffline && syncStatus === 'syncing' && (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Syncing offline changes...</span>
        </>
      )}
      {!isOffline && syncStatus === 'success' && (
        <>
          <CheckCircle2 className="w-4 h-4" />
          <span>All offline changes synced successfully.</span>
        </>
      )}
      {!isOffline && syncStatus === 'error' && (
        <>
          <AlertCircle className="w-4 h-4" />
          <span>Some offline changes failed to sync. We'll try again later.</span>
        </>
      )}
    </div>
  );
};

export default OfflineBanner;
