import React from 'react';
import { AlertTriangle, Clock, ShieldAlert, RefreshCw, BellOff, X, Loader2, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const TYPE_CONFIG = {
  overdue: {
    icon: AlertTriangle,
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-100 dark:border-red-800/30',
    hoverBg: 'hover:bg-red-100 dark:hover:bg-red-900/30',
  },
  red_tag: {
    icon: ShieldAlert,
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-100 dark:border-red-800/30',
    hoverBg: 'hover:bg-red-100 dark:hover:bg-red-900/30',
  },
  upcoming: {
    icon: Clock,
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-100 dark:border-amber-800/30',
    hoverBg: 'hover:bg-amber-100 dark:hover:bg-amber-900/30',
  },
};

const NotificationPanel = ({ notifications, loading, onRefresh, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const critical = notifications.filter((n) => n.severity === 'high');
  const rest = notifications.filter((n) => n.severity !== 'high');

  const handleItemClick = (n) => {
    if (n.link) {
      onClose();
      navigate(n.link);
    }
  };

  const renderItem = (n) => {
    const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.upcoming;
    const Icon = cfg.icon;
    const isClickable = !!n.link;

    return (
      <div
        key={n.id}
        onClick={() => handleItemClick(n)}
        className={`flex gap-3 px-4 py-3 ${cfg.bg} ${isClickable ? `cursor-pointer ${cfg.hoverBg} transition-colors` : ''}`}
      >
        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cfg.color}`} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground leading-tight">{n.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
        </div>
        {isClickable && (
          <ExternalLink className="w-3 h-3 mt-0.5 text-muted-foreground flex-shrink-0 opacity-50" />
        )}
      </div>
    );
  };

  // Count by destination for the footer hint
  const tagAlerts = notifications.filter((n) => n.link === '/scaffold-tags').length;
  const inspAlerts = notifications.filter((n) => n.link === '/dashboard/inspections').length;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{t('notifications.title')}</h3>
          {notifications.length > 0 && (
            <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
              {notifications.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="max-h-[400px] overflow-y-auto">
        {loading && notifications.length === 0 ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center py-12 px-4 text-muted-foreground">
            <BellOff className="w-9 h-9 mb-3 opacity-20" />
            <p className="text-sm font-medium">{t('notifications.all_clear')}</p>
            <p className="text-xs mt-1 text-center opacity-70">
              {t('notifications.all_clear_desc')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {critical.map(renderItem)}
            {rest.map(renderItem)}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2.5 border-t border-border bg-muted/20 space-y-1.5">
          <p className="text-[11px] text-muted-foreground text-center">
            {critical.length > 0 && (
              <span className="text-red-500 font-medium">{critical.length} {t('notifications.critical')}</span>
            )}
            {critical.length > 0 && rest.length > 0 && ' · '}
            {rest.length > 0 && `${rest.length} ${t('notifications.upcoming')}`}
          </p>
          {/* Quick navigation shortcuts */}
          <div className="flex gap-2 justify-center">
            {tagAlerts > 0 && (
              <button
                onClick={() => { onClose(); navigate('/scaffold-tags'); }}
                className="text-[10px] text-primary hover:underline font-medium"
              >
                → Scaffold Tags ({tagAlerts})
              </button>
            )}
            {inspAlerts > 0 && (
              <button
                onClick={() => { onClose(); navigate('/dashboard/inspections'); }}
                className="text-[10px] text-primary hover:underline font-medium"
              >
                → Inspections ({inspAlerts})
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
