
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellRing, AlertTriangle, CalendarX, Clock, PackageMinus, ShieldAlert, Users } from 'lucide-react';
import { useAlerts } from '@/hooks/useAlerts.js';
import AlertCard from '@/components/AlertCard.jsx';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

const ALERT_TABS = [
  { id: 'all', label: 'All Alerts', icon: BellRing, color: 'text-foreground' },
  { id: 'inactive_scaffolds', label: 'Inactive', icon: AlertTriangle, color: 'text-destructive' },
  { id: 'missing_diary', label: 'Missing Diary', icon: CalendarX, color: 'text-orange-500' },
  { id: 'overdue_requests', label: 'Overdue', icon: Clock, color: 'text-destructive' },
  { id: 'low_stock', label: 'Low Stock', icon: PackageMinus, color: 'text-yellow-600' },
  { id: 'safety_incidents', label: 'Safety', icon: ShieldAlert, color: 'text-destructive' },
  { id: 'team_alerts', label: 'Team', icon: Users, color: 'text-blue-500' }
];

const AlertCenter = ({ projectId }) => {
  const navigate = useNavigate();
  const { fetchAlerts, fetchAlertCount, markAsRead, deleteAlert, loading } = useAlerts(projectId);
  
  const [activeTab, setActiveTab] = useState('all');
  const [alerts, setAlerts] = useState([]);
  const [counts, setCounts] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadData = async () => {
    if (!projectId) return;
    
    const [alertsData, countsData] = await Promise.all([
      fetchAlerts(activeTab, page, 5),
      fetchAlertCount()
    ]);

    if (alertsData) {
      setAlerts(alertsData.items);
      setTotalPages(alertsData.totalPages);
    }
    if (countsData) {
      setCounts(countsData);
    }
  };

  useEffect(() => {
    loadData();
    
    // Poll every 60 seconds
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [projectId, activeTab, page, fetchAlerts, fetchAlertCount]);

  const handleToggleRead = async (id, isRead) => {
    const success = await markAsRead(id, isRead);
    if (success) {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: isRead } : a));
      const newCounts = await fetchAlertCount();
      setCounts(newCounts);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this alert?')) {
      const success = await deleteAlert(id);
      if (success) {
        loadData();
      }
    }
  };

  const handleAction = (alert) => {
    switch (alert.type) {
      case 'inactive_scaffolds':
      case 'overdue_requests':
        navigate('/dashboard/scaffold-requests');
        break;
      case 'missing_diary':
        navigate('/dashboard/site-diary');
        break;
      case 'low_stock':
        navigate('/dashboard/material-deliveries');
        break;
      case 'safety_incidents':
      case 'team_alerts':
        navigate('/dashboard/team');
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-border bg-muted/30">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <BellRing className="w-5 h-5 text-primary" />
          Alert Center
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto p-2 gap-2 border-b border-border scrollbar-hide">
        {ALERT_TABS.map(tab => {
          const Icon = tab.icon;
          const count = counts[tab.id] || 0;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setPage(1); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                ${isActive 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary-foreground' : tab.color}`} />
              {tab.label}
              {count > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] leading-none
                  ${isActive ? 'bg-primary-foreground text-primary' : 'bg-background text-foreground'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Alert List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {loading && alerts.length === 0 ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-xl space-y-3">
                <div className="flex justify-between"><Skeleton className="h-5 w-1/3" /><Skeleton className="h-5 w-16" /></div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <BellRing className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No alerts found</h3>
              <p className="text-sm text-muted-foreground max-w-[250px] mt-1">
                You're all caught up! There are no active alerts in this category.
              </p>
            </div>
          ) : (
            alerts.map(alert => (
              <AlertCard 
                key={alert.id} 
                alert={alert} 
                onToggleRead={handleToggleRead}
                onDelete={handleDelete}
                onAction={handleAction}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-border bg-muted/10 flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground font-medium">
            Page {page} of {totalPages}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default AlertCenter;
