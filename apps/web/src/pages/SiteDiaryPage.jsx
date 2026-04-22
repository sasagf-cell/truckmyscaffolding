
import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import SiteDiaryViewToggle from '@/components/SiteDiaryViewToggle.jsx';
import SiteDiaryCalendar from '@/components/SiteDiaryCalendar.jsx';
import SiteDiaryList from '@/components/SiteDiaryList.jsx';

const SiteDiaryPage = () => {
  const navigate = useNavigate();
  const { selectedProject } = useOutletContext();
  
  // Initialize view from localStorage or default to 'calendar'
  const [view, setView] = useState(() => {
    return localStorage.getItem('siteDiaryView') || 'calendar';
  });

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a project to view the site diary.</p>
      </div>
    );
  }

  const handleNewEntry = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    navigate(`/dashboard/site-diary/new?date=${today}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Site Diary</h1>
          <p className="text-muted-foreground">Daily logs and conditions for {selectedProject.name}</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <SiteDiaryViewToggle view={view} setView={setView} />
          <Button onClick={handleNewEntry} className="shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            New Entry
          </Button>
        </div>
      </div>

      <div className="mt-6">
        {view === 'calendar' ? (
          <SiteDiaryCalendar projectId={selectedProject.id} />
        ) : (
          <SiteDiaryList projectId={selectedProject.id} />
        )}
      </div>
    </div>
  );
};

export default SiteDiaryPage;
