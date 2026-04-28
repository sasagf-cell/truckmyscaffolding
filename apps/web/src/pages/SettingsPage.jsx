
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import SettingsLayout from '@/components/SettingsLayout.jsx';
import ProfileSettingsTab from '@/pages/settings/ProfileSettingsTab.jsx';
import ProjectSettingsTab from '@/pages/settings/ProjectSettingsTab.jsx';
import NotificationsSettingsTab from '@/pages/settings/NotificationsSettingsTab.jsx';
import EmailPreferencesTab from '@/pages/settings/EmailPreferencesTab.jsx';
import BillingSettingsTab from '@/pages/settings/BillingSettingsTab.jsx';
import SecuritySettingsTab from '@/pages/settings/SecuritySettingsTab.jsx';
import ProjectConfigTab from '@/pages/settings/ProjectConfigTab.jsx';

const SettingsPage = () => {
  return (
    <Routes>
      <Route element={<SettingsLayout />}>
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<ProfileSettingsTab />} />
        <Route path="project" element={<ProjectSettingsTab />} />
        <Route path="project-config" element={<ProjectConfigTab />} />
        <Route path="notifications" element={<NotificationsSettingsTab />} />
        <Route path="email-preferences" element={<EmailPreferencesTab />} />
        <Route path="billing" element={<BillingSettingsTab />} />
        <Route path="security" element={<SecuritySettingsTab />} />
      </Route>
    </Routes>
  );
};

export default SettingsPage;
