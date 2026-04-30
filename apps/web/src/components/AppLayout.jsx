
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Calendar, Package, MessageSquare, BarChart3, Users, Settings, Menu, X, ChevronDown, LogOut, Download, BookOpen, Database, ShieldCheck, Clock, Tag, Plus } from 'lucide-react';
import NotificationBell from '@/features/notifications/components/NotificationBell';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import {
  canViewScaffoldRequests,
  canViewSiteDiary,
  canViewMaterialDeliveries,
  canViewReports,
  canViewTeam,
  canViewScaffoldLogs,
  canViewMaterialMasterData,
  canViewInspections,
  canViewWorkerHours
} from '@/lib/permissions.js';
import OfflineBanner from '@/components/OfflineBanner.jsx';
import Logo from '@/components/Logo.jsx';
import CreateProjectModal from '@/components/CreateProjectModal.jsx';

const AppLayout = () => {
  const { t, i18n } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [subcontractorRecord, setSubcontractorRecord] = useState(null);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  // Handle PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        let records = [];
        if (currentUser.role === 'Coordinator') {
          records = await pb.collection('projects').getFullList({
            filter: pb.filter('user_id = {:uid}', { uid: currentUser.id }),
            sort: '-created',
            $autoCancel: false
          });
        } else {
          // Site Team: fetch projects they are assigned to
          const subRecords = await pb.collection('site_team_invites').getFullList({
            filter: pb.filter('userId = {:uid} && status = "active"', { uid: currentUser.id }),
            $autoCancel: false
          });
          const projectIds = [...new Set(subRecords.map(r => r.projectId).filter(Boolean))];
          records = (await Promise.all(
            projectIds.map(id => pb.collection('projects').getOne(id, { $autoCancel: false }).catch(() => null))
          )).filter(Boolean);
        }
        
        setProjects(records);
        if (records.length > 0 && !selectedProject) {
          setSelectedProject(records[0]);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };

    if (currentUser) {
      fetchProjects();
    }
  }, [currentUser]);

  // Fetch subcontractor permissions when project changes
  useEffect(() => {
    const fetchPermissions = async () => {
      if (currentUser?.role === 'Worker' && selectedProject) {
        try {
          const record = await pb.collection('site_team_invites').getFirstListItem(
            `userId="${currentUser.id}" && projectId="${selectedProject.id}"`, 
            { $autoCancel: false }
          );
          setSubcontractorRecord(record);
        } catch (e) {
          setSubcontractorRecord(null);
        }
      } else {
        setSubcontractorRecord(null);
      }
    };
    fetchPermissions();
  }, [currentUser, selectedProject]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Filter nav items based on permissions
  const allNavItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard'), show: true },
    { path: '/scaffold-logs', icon: BookOpen, label: t('nav.logs'), show: canViewScaffoldLogs ? canViewScaffoldLogs(currentUser) : true },
    { path: '/scaffold-tags', icon: Tag, label: 'Scaffold Tags', show: canViewScaffoldLogs ? canViewScaffoldLogs(currentUser) : true },
    { path: '/dashboard/scaffold-requests', icon: FileText, label: t('nav.requests'), show: canViewScaffoldRequests(currentUser, subcontractorRecord) },
    { path: '/dashboard/site-diary', icon: Calendar, label: t('nav.diary'), show: canViewSiteDiary(currentUser, subcontractorRecord) },
    { path: '/dashboard/material-deliveries', icon: Package, label: t('nav.deliveries'), show: canViewMaterialDeliveries(currentUser, subcontractorRecord) },
    { path: '/dashboard/inspections', icon: ShieldCheck, label: t('nav.inspections'), show: canViewInspections(currentUser) },
    { path: '/dashboard/worker-hours', icon: Clock, label: 'Worker Hours', show: canViewWorkerHours(currentUser) },
    { path: '/material-master-data', icon: Database, label: t('nav.materials'), show: canViewMaterialMasterData ? canViewMaterialMasterData(currentUser) : true },
    { path: '/dashboard/ai-assistant', icon: MessageSquare, label: t('nav.ai_assistant'), show: true }, // AI assistant available to all
    { path: '/dashboard/reports', icon: BarChart3, label: t('nav.reports'), show: canViewReports(currentUser, subcontractorRecord) },
    { path: '/dashboard/team', icon: Users, label: t('nav.team'), show: canViewTeam(currentUser, subcontractorRecord) },
    { path: '/dashboard/settings', icon: Settings, label: t('nav.settings'), show: true } // Settings available to all, but content may vary
  ];

  const visibleNavItems = allNavItems.filter(item => item.show);

  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <OfflineBanner />
      
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-border mt-[env(safe-area-inset-top)]">
        <div className="flex items-center justify-between h-16 px-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Logo variant="light" />
          <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-4">
            <button
              onClick={() => i18n.changeLanguage('en')}
              className={`text-xs px-2 py-1 rounded font-medium transition-colors ${i18n.language === 'en' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-foreground'}`}
            >
              EN
            </button>
            <button
              onClick={() => i18n.changeLanguage('de')}
              className={`text-xs px-2 py-1 rounded font-medium transition-colors ${i18n.language === 'de' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-foreground'}`}
            >
              DE
            </button>
          </div>

            {isInstallable && (
              <button onClick={handleInstallClick} className="p-2 text-primary bg-primary/10 rounded-full">
                <Download className="w-5 h-5" />
              </button>
            )}
            <NotificationBell projectId={selectedProject?.id} iconSize="w-6 h-6" />
          </div>
        </div>
      </div>

      <aside className={`fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-40 transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} mt-[env(safe-area-inset-top)]`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <Link to="/dashboard">
              <Logo variant="light" />
            </Link>
          </div>

          <div className="p-4 border-b border-border">
            <button
              onClick={() => setProjectMenuOpen(!projectMenuOpen)}
              className="w-full flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
            >
              <div className="text-left">
                <p className="text-sm font-medium truncate">
                  {selectedProject?.name || 'Select project'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
            {projectMenuOpen && (
              <div className="mt-2 border border-border rounded-md bg-background">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      setSelectedProject(project);
                      setProjectMenuOpen(false);
                    }}
                    className="w-full text-left p-2 hover:bg-muted transition-colors text-sm"
                  >
                    {project.name}
                  </button>
                ))}
                {currentUser?.role === 'Coordinator' && (
                  <button
                    onClick={() => { setProjectMenuOpen(false); setCreateProjectOpen(true); }}
                    className="w-full text-left p-2 hover:bg-muted transition-colors text-sm text-primary font-medium flex items-center gap-1 border-t border-border"
                  >
                    <span className="text-base leading-none">+</span> New Project
                  </button>
                )}
              </div>
            )}
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {visibleNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-border space-y-3">
            {/* Language switcher — desktop sidebar */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => i18n.changeLanguage('en')}
                className={`text-xs px-2 py-1 rounded font-medium transition-colors ${i18n.language === 'en' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-foreground'}`}
              >
                EN
              </button>
              <button
                onClick={() => i18n.changeLanguage('de')}
                className={`text-xs px-2 py-1 rounded font-medium transition-colors ${i18n.language === 'de' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-foreground'}`}
              >
                DE
              </button>
            </div>

            {isInstallable && (
              <button
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors"
              >
                <Download className="w-4 h-4" />
                {t('common.install_app')}
              </button>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-semibold overflow-hidden">
                {currentUser?.avatar ? (
                  <img src={pb.files.getUrl(currentUser, currentUser.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  currentUser?.full_name?.charAt(0) || 'U'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{currentUser?.full_name}</p>
                <p className="text-xs text-muted-foreground capitalize">{currentUser?.role === 'Worker' || currentUser?.role === 'Subcontractor' ? 'Site Team' : currentUser?.role || 'User'}</p>
              </div>
              </div>
              <NotificationBell projectId={selectedProject?.id} iconSize="w-5 h-5" />
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t('common.logout')}
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 overflow-y-auto">
        <div className="p-4 md:p-6 h-full max-w-7xl mx-auto">
          <Outlet context={{ selectedProject, subcontractorRecord }} />
        </div>
      </main>
      
      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
        onProjectCreated={(newProject) => {
          setProjects(prev => [newProject, ...prev]);
          setSelectedProject(newProject);
          setCreateProjectOpen(false);
        }}
      />

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border z-40 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {visibleNavItems.slice(0, 4).map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
              isActive(item.path) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'fill-primary/20' : ''}`} />
            <span className="text-[10px] font-medium truncate w-full text-center">{item.label.split(' ')[0]}</span>
          </Link>
        ))}
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex flex-col items-center justify-center w-16 h-full gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </div>
    </div>
  );
};

export default AppLayout;
