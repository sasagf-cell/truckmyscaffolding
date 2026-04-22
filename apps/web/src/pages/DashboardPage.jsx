
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useOutletContext } from 'react-router-dom';
import {
  ClipboardList,
  BookOpen,
  Truck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  BellRing,
  X,
  Monitor,
  Activity,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import StripeSuccessPage from '@/pages/StripeSuccessPage.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAlerts } from '@/hooks/useAlerts.js';
import pb from '@/lib/pocketbaseClient';
import Scaffold3DPreview from '@/components/Scaffold3DPreview.jsx';
import ScaffoldQRCode from '@/components/ScaffoldQRCode.jsx';
import WorkerHoursWidget from '@/components/WorkerHoursWidget.jsx';

const DashboardPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { selectedProject } = useOutletContext();
  const { fetchAlertCount } = useAlerts(selectedProject?.id);
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [alertCount, setAlertCount] = useState(0);
  const [showAlertBanner, setShowAlertBanner] = useState(true);

  const [riskMetrics, setRiskMetrics] = useState({
    overdueInspections: 0,
    pendingRequestsOver48h: 1, // Mock
    missingDiaryEntries: 2, // Mock
  });

  const calculateRiskScore = () => {
    const score = 100 
      - (riskMetrics.overdueInspections * 15) 
      - (riskMetrics.pendingRequestsOver48h * 10) 
      - (riskMetrics.missingDiaryEntries * 5);
    return Math.max(0, Math.min(100, score));
  };
  
  const riskScore = calculateRiskScore();
  
  const getRiskStatus = (score) => {
    if (score < 40) return { label: 'High Risk', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', bar: 'bg-red-500', icon: ShieldAlert };
    if (score < 70) return { label: 'Medium Risk', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', bar: 'bg-yellow-500', icon: AlertTriangle };
    return { label: 'Low Risk', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', bar: 'bg-green-500', icon: ShieldCheck };
  };
  
  const riskStatus = getRiskStatus(riskScore);
  const RiskIcon = riskStatus.icon;

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!selectedProject) return;
      setLoading(true);
      try {
        // Fetch basic stats
        const [requests, diary, deliveries, alerts] = await Promise.all([
          pb.collection('scaffold_requests').getList(1, 1, { filter: `projectId="${selectedProject.id}"`, $autoCancel: false }),
          pb.collection('diary_entries').getList(1, 1, { filter: `project_id="${selectedProject.id}"`, $autoCancel: false }),
          pb.collection('material_deliveries').getList(1, 1, { filter: `project_id="${selectedProject.id}"`, $autoCancel: false }),
          fetchAlertCount()
        ]);

        setStats({
          totalRequests: requests.totalItems,
          totalDiaryEntries: diary.totalItems,
          totalDeliveries: deliveries.totalItems,
        });

        setAlertCount(alerts.all || 0);

        // Fetch recent activity (combining requests and diary entries for demo)
        const recentReqs = await pb.collection('scaffold_requests').getList(1, 3, { 
          filter: `projectId="${selectedProject.id}"`, 
          sort: '-created',
          $autoCancel: false 
        });
        
        const activities = recentReqs.items.map(req => ({
          id: req.id,
          type: 'request',
          title: `New Scaffold Request: ${req.location}`,
          date: req.created,
          status: req.status
        }));

        setRecentActivity(activities);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [selectedProject, fetchAlertCount]);

  // If returning from Stripe checkout
  if (searchParams.get('session_id')) {
    return <StripeSuccessPage />;
  }

  if (!selectedProject) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
          <ClipboardList className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to TrackMyScaffolding</h1>
        <p className="text-muted-foreground max-w-md">
          Please select a project from the sidebar or create a new one to get started.
        </p>
        <Button onClick={() => navigate('/dashboard/settings/project')}>Create Project</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Alert Banner */}
      {alertCount > 0 && showAlertBanner && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/20 rounded-full text-destructive shrink-0">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-destructive-foreground">Attention Required</h3>
              <p className="text-sm text-destructive-foreground/80">
                You have {alertCount} active alert{alertCount !== 1 ? 's' : ''} that need your attention.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" className="border-destructive/30 hover:bg-destructive/10" onClick={() => navigate('/dashboard/ai-assistant')}>
              View Alerts
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => setShowAlertBanner(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">Here's what's happening in {selectedProject.name} today.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/dashboard/site-diary/new')}>
            <BookOpen className="w-4 h-4 mr-2" />
            Log Diary
          </Button>
          <Button onClick={() => navigate('/dashboard/scaffold-requests/new')}>
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary shadow-[0_0_15px_rgba(249,115,22,0.2)]">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
              {loading ? <Skeleton className="h-8 w-16 mt-1" /> : <h3 className="text-2xl font-bold tabular-nums text-white text-glow">{stats?.totalRequests || 0}</h3>}
            </div>
          </div>
        </div>
        <div className="glass-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.2)]">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Diary Entries</p>
              {loading ? <Skeleton className="h-8 w-16 mt-1" /> : <h3 className="text-2xl font-bold tabular-nums text-white">{stats?.totalDiaryEntries || 0}</h3>}
            </div>
          </div>
        </div>
        <div className="glass-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary shadow-[0_0_15px_rgba(249,115,22,0.2)]">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Deliveries</p>
              {loading ? <Skeleton className="h-8 w-16 mt-1" /> : <h3 className="text-2xl font-bold tabular-nums text-white">{stats?.totalDeliveries || 0}</h3>}
            </div>
          </div>
        </div>
        <div className="glass-card border-primary/30 bg-primary/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/20 rounded-xl text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
              {loading ? <Skeleton className="h-8 w-16 mt-1" /> : <h3 className="text-2xl font-bold tabular-nums text-red-500">{alertCount}</h3>}
            </div>
          </div>
        </div>
        <WorkerHoursWidget projectId={selectedProject?.id} />
      </div>

      {/* Project Risk Score Widget */}
      <Card className={`glass-card border ${riskStatus.border} ${riskStatus.bg} overflow-hidden relative`}>
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <RiskIcon className="w-32 h-32" />
        </div>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1 w-full space-y-4">
              <div className="flex items-center gap-2">
                <RiskIcon className={`w-6 h-6 ${riskStatus.color}`} />
                <h3 className="text-xl font-bold tracking-tight text-white">Project Risk Score</h3>
                <Badge variant="outline" className={`ml-2 ${riskStatus.color} ${riskStatus.border}`}>
                  {riskStatus.label}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overall Safety & Compliance</span>
                  <span className={`font-bold ${riskStatus.color}`}>{riskScore} / 100</span>
                </div>
                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={`h-full ${riskStatus.bar} transition-all duration-1000 ease-out`} 
                    style={{ width: `${riskScore}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap md:flex-nowrap gap-3 w-full md:w-auto shrink-0 z-10">
              <div className="bg-black/40 border border-white/10 rounded-lg p-3 text-center flex-1 md:flex-none min-w-[100px]">
                <p className="text-2xl font-bold text-white">{riskMetrics.overdueInspections}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Overdue<br/>Inspections</p>
              </div>
              <div className="bg-black/40 border border-white/10 rounded-lg p-3 text-center flex-1 md:flex-none min-w-[100px]">
                <p className="text-2xl font-bold text-white">{riskMetrics.pendingRequestsOver48h}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pending Req<br/>(&gt;48h)</p>
              </div>
              <div className="bg-black/40 border border-white/10 rounded-lg p-3 text-center flex-1 md:flex-none min-w-[100px]">
                <p className="text-2xl font-bold text-white">{riskMetrics.missingDiaryEntries}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Missing<br/>Diaries</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Live Status Feed
              </CardTitle>
              <CardDescription>Real-time updates from your industrial sites</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-white/5" onClick={() => navigate('/dashboard/scaffold-requests')}>
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 border border-white/5 rounded-lg">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                    <Clock className="w-8 h-8 opacity-20" />
                  </div>
                  <p className="font-medium">No activity recorded today</p>
                  <p className="text-xs">Incoming requests will appear here in real-time.</p>
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 border border-white/5 bg-white/[0.02] rounded-lg hover:bg-white/5 transition-all cursor-pointer group" onClick={() => navigate(`/dashboard/scaffold-requests/${activity.id}`)}>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-white">{activity.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {format(new Date(activity.date), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 capitalize border-primary/20 text-primary bg-primary/5">
                      {activity.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Live Site Monitoring (Innovation Features) */}
        <div className="space-y-6">
          <div className="glass-card border-primary/20 bg-primary/5 overflow-hidden">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Digital Twin (Active)
            </h3>
            <div className="h-[200px] mb-4">
              <Scaffold3DPreview width={1.8} length={2.2} height={4.5} />
            </div>
            <div className="p-3 bg-black/40 rounded-lg border border-white/5">
              <p className="text-[11px] text-muted-foreground">Monitoring active scaffold SN-2026-042</p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-[10px] text-white font-medium">Reactor Level +12m</span>
                <span className="text-[10px] text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Checked
                </span>
              </div>
            </div>
          </div>

          <ScaffoldQRCode 
            scaffoldId="demo-scaffold-042" 
            tagNumber="SN-2026-042"
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
