
import React, { Suspense, useEffect } from 'react';
import { Route, Routes, BrowserRouter, useLocation, Link, Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import AppLayout from '@/components/AppLayout.jsx';
import SkipLink from '@/components/SkipLink.jsx';
import PerformanceMonitor from '@/components/PerformanceMonitor.jsx';
import { initGA } from '@/utils/analyticsSetup.js';
import { useAnalytics } from '@/hooks/useAnalytics.js';

// Layout Components
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

// Pages
import HomePage from '@/pages/HomePage.jsx';
import OnboardingFlow from '@/pages/OnboardingFlow.jsx';
import DashboardPage from '@/pages/DashboardPage.jsx';
const PricingPage = React.lazy(() => import('@/pages/PricingPage.jsx'));

// Lazy load other pages for performance
const LoginPage = React.lazy(() => import('@/pages/LoginPage.jsx'));
const SignupPage = React.lazy(() => import('@/pages/SignupPage.jsx'));
const ForgotPasswordPage = React.lazy(() => import('@/pages/ForgotPasswordPage.jsx'));
const ResetPasswordPage = React.lazy(() => import('@/pages/ResetPasswordPage.jsx'));

const SEOAuditPage = React.lazy(() => import('@/pages/SEOAuditPage.jsx'));
const AdminEmailTemplatesPage = React.lazy(() => import('@/pages/AdminEmailTemplatesPage.jsx'));
const UnsubscribeSuccessPage = React.lazy(() => import('@/pages/UnsubscribeSuccessPage.jsx'));

// Dashboard Core
const ScaffoldRequestsList = React.lazy(() => import('@/pages/ScaffoldRequestsList.jsx'));
const ScaffoldRequestForm = React.lazy(() => import('@/pages/ScaffoldRequestForm.jsx'));
const ScaffoldRequestDetail = React.lazy(() => import('@/pages/ScaffoldRequestDetail.jsx'));
const SiteDiaryPage = React.lazy(() => import('@/pages/SiteDiaryPage.jsx'));
const SiteDiaryEntryForm = React.lazy(() => import('@/pages/SiteDiaryEntryForm.jsx'));
const SiteDiaryEntryDetail = React.lazy(() => import('@/pages/SiteDiaryEntryDetail.jsx'));
const MaterialDeliveriesPage = React.lazy(() => import('@/pages/MaterialDeliveriesPage.jsx'));
const MaterialDeliveryForm = React.lazy(() => import('@/pages/MaterialDeliveryForm.jsx'));
const MaterialDeliveryDetail = React.lazy(() => import('@/pages/MaterialDeliveryDetail.jsx'));
const AIAssistantPage = React.lazy(() => import('@/pages/AIAssistantPage.jsx'));
const ReportGenerator = React.lazy(() => import('@/pages/ReportGenerator.jsx'));
const SubcontractorListPage = React.lazy(() => import('@/pages/SubcontractorListPage.jsx'));
const SubcontractorDetailPage = React.lazy(() => import('@/pages/SubcontractorDetailPage.jsx'));
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage.jsx'));

// New Feature Pages
const ScaffoldLogsPage = React.lazy(() => import('@/pages/ScaffoldLogsPage.jsx'));
const ScaffoldTagsPage = React.lazy(() => import('@/pages/ScaffoldTagsPage.jsx'));
const MaterialMasterDataPage = React.lazy(() => import('@/pages/MaterialMasterDataPage.jsx'));
const SafetyInspectionsPage = React.lazy(() => import('@/features/inspections/src/SafetyInspectionsPage.jsx'));
const WorkerHoursPage = React.lazy(() => import('@/pages/WorkerHoursPage.jsx'));
const JoinProjectPage = React.lazy(() => import('@/pages/JoinProjectPage.jsx'));


const LoadingFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Analytics Wrapper Component
const AnalyticsWrapper = ({ children }) => {
  useAnalytics();
  return children;
};

// Public Layout Wrapper
const PublicLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

// App Content Component
function AppContent() {
  useEffect(() => {
    initGA(import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX');
  }, []);

  return (
    <AnalyticsWrapper>
      <SkipLink />
      <PerformanceMonitor />
      <ScrollToTop />
      <Toaster position="top-right" />
      
      <Helmet>
        <title>AI-Powered Scaffold Management Software | TrackMyScaffolding</title>
        <meta name="description" content="Replace Excel with an AI scaffold tracking platform built for industrial construction. Manage work orders, site diary, and material deliveries, from any device." />
        <meta name="keywords" content="scaffold management, work orders, site diary, material tracking, industrial construction, power plant, refinery, shutdown" />
      </Helmet>

      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes Wrapped in PublicLayout directly using Route element */}
          <Route element={<PublicLayout><Outlet /></PublicLayout>}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/join" element={<JoinProjectPage />} />
            <Route path="/unsubscribe-success" element={<UnsubscribeSuccessPage />} />
            <Route path="/dev/seo-audit" element={<SEOAuditPage />} />
            
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
                  <p className="text-xl text-muted-foreground mb-6">Page not found</p>
                  <Link to="/" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90">
                    Back to home
                  </Link>
                </div>
              </div>
            } />
          </Route>

          {/* Semi-Protected Routes without AppLayout sidebar */}
          <Route element={<ProtectedRoute><PublicLayout><Outlet /></PublicLayout></ProtectedRoute>}>
            <Route path="/admin/email-templates" element={<AdminEmailTemplatesPage />} />
            <Route path="/onboarding" element={<OnboardingFlow />} />
          </Route>

          {/* Main Dashboard Pages Wrapped in AppLayout */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            
            <Route path="/scaffold-logs" element={<ScaffoldLogsPage />} />
            <Route path="/scaffold-tags" element={<ScaffoldTagsPage />} />
            <Route path="/material-master-data" element={<MaterialMasterDataPage />} />
            <Route path="/dashboard/inspections" element={<SafetyInspectionsPage />} />
            <Route path="/dashboard/worker-hours" element={<WorkerHoursPage />} />

            
            <Route path="/dashboard/scaffold-requests" element={<ScaffoldRequestsList />} />
            <Route path="/dashboard/scaffold-requests/new" element={<ScaffoldRequestForm />} />
            <Route path="/dashboard/scaffold-requests/:id" element={<ScaffoldRequestDetail />} />
            <Route path="/dashboard/scaffold-requests/:id/edit" element={<ScaffoldRequestForm />} />

            <Route path="/dashboard/site-diary" element={<SiteDiaryPage />} />
            <Route path="/dashboard/site-diary/new" element={<SiteDiaryEntryForm />} />
            <Route path="/dashboard/site-diary/:id" element={<SiteDiaryEntryDetail />} />
            <Route path="/dashboard/site-diary/:id/edit" element={<SiteDiaryEntryForm />} />

            <Route path="/dashboard/material-deliveries" element={<MaterialDeliveriesPage />} />
            <Route path="/dashboard/material-deliveries/new" element={<MaterialDeliveryForm />} />
            <Route path="/dashboard/material-deliveries/:id" element={<MaterialDeliveryDetail />} />
            <Route path="/dashboard/material-deliveries/:id/edit" element={<MaterialDeliveryForm />} />

            <Route path="/dashboard/ai-assistant" element={<AIAssistantPage />} />
            <Route path="/dashboard/reports" element={<ReportGenerator />} />

            <Route path="/dashboard/team" element={<SubcontractorListPage />} />
            <Route path="/dashboard/team/:id" element={<SubcontractorDetailPage />} />

            <Route path="/dashboard/settings/*" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </AnalyticsWrapper>
  );
}

// Main App Component with Providers
function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
