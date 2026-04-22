
import React from 'react';
import { CalendarDays, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SiteDiaryViewToggle = ({ view, setView }) => {
  const handleViewChange = (newView) => {
    setView(newView);
    localStorage.setItem('siteDiaryView', newView);
  };

  return (
    <div className="flex items-center bg-muted p-1 rounded-lg w-fit">
      <Button
        variant={view === 'calendar' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleViewChange('calendar')}
        className={`rounded-md px-4 transition-all ${view === 'calendar' ? 'shadow-sm' : ''}`}
      >
        <CalendarDays className="w-4 h-4 mr-2" />
        Calendar View
      </Button>
      <Button
        variant={view === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleViewChange('list')}
        className={`rounded-md px-4 transition-all ${view === 'list' ? 'shadow-sm' : ''}`}
      >
        <List className="w-4 h-4 mr-2" />
        List View
      </Button>
    </div>
  );
};

export default SiteDiaryViewToggle;
