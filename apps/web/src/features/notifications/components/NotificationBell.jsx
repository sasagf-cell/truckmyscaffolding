import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationPanel from './NotificationPanel';

/**
 * Bell icon with badge count + dropdown notification panel.
 * Sprint 3D: in-app notification system.
 */
const NotificationBell = ({ projectId, iconSize = 'w-5 h-5' }) => {
  const [open, setOpen] = useState(false);
  const { notifications, loading, refresh, criticalCount } = useNotifications(projectId);
  const ref = useRef(null);

  // Close panel on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Note: refresh-on-project-change is handled inside useNotifications itself
  // (projectId is a dep of the useCallback → triggers automatically).
  // Removed redundant useEffect here to prevent double API calls on mount.

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors focus:outline-none"
        aria-label={`Notifications${criticalCount > 0 ? ` — ${criticalCount} critical` : ''}`}
      >
        <Bell className={`${iconSize} text-muted-foreground`} />
        {criticalCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
            {criticalCount > 9 ? '9+' : criticalCount}
          </span>
        )}
        {/* Pulse ring for urgent alerts */}
        {criticalCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 rounded-full animate-ping opacity-40 pointer-events-none" />
        )}
      </button>

      {open && (
        <NotificationPanel
          notifications={notifications}
          loading={loading}
          onRefresh={refresh}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;
