
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MessageSquare, BellRing } from 'lucide-react';
import AlertCenter from '@/components/AlertCenter.jsx';
import AIChat from '@/components/AIChat.jsx';
import { Button } from '@/components/ui/button';

const AIAssistantPage = () => {
  const { selectedProject } = useOutletContext() ?? {};
  const [mobileView, setMobileView] = useState('chat'); // 'chat' or 'alerts'

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a project to use the AI Assistant.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] lg:h-[calc(100vh-4rem)] space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Assistant & Alerts</h1>
          <p className="text-muted-foreground">Smart insights and notifications for {selectedProject.name}</p>
        </div>
        
        {/* Mobile View Toggle */}
        <div className="flex lg:hidden bg-muted p-1 rounded-lg w-full sm:w-auto">
          <Button
            variant={mobileView === 'alerts' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMobileView('alerts')}
            className={`flex-1 rounded-md px-4 transition-all ${mobileView === 'alerts' ? 'shadow-sm' : ''}`}
          >
            <BellRing className="w-4 h-4 mr-2" />
            Alerts
          </Button>
          <Button
            variant={mobileView === 'chat' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMobileView('chat')}
            className={`flex-1 rounded-md px-4 transition-all ${mobileView === 'chat' ? 'shadow-sm' : ''}`}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Alert Center */}
        <div className={`h-full ${mobileView === 'alerts' ? 'block' : 'hidden lg:block'} lg:col-span-1`}>
          <AlertCenter projectId={selectedProject.id} />
        </div>

        {/* Right Panel: AI Chat */}
        <div className={`h-full ${mobileView === 'chat' ? 'block' : 'hidden lg:block'} lg:col-span-2`}>
          <AIChat projectId={selectedProject.id} />
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;
