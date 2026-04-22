
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { User, Briefcase, Bell, CreditCard, Shield, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    title: 'Profile',
    href: '/dashboard/settings/profile',
    icon: User
  },
  {
    title: 'Project Defaults',
    href: '/dashboard/settings/project',
    icon: Briefcase
  },
  {
    title: 'In-App Notifications',
    href: '/dashboard/settings/notifications',
    icon: Bell
  },
  {
    title: 'Email Preferences',
    href: '/dashboard/settings/email-preferences',
    icon: Mail
  },
  {
    title: 'Billing & Plans',
    href: '/dashboard/settings/billing',
    icon: CreditCard
  },
  {
    title: 'Security',
    href: '/dashboard/settings/security',
    icon: Shield
  }
];

const SettingsLayout = () => {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-64 shrink-0">
        <nav className="flex flex-col space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <item.icon className="w-4 h-4" />
              {item.title}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
};

export default SettingsLayout;
