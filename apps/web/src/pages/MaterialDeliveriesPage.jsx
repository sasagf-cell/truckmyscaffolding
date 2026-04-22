
import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MaterialDeliveriesList from '@/components/MaterialDeliveriesList.jsx';
import InventoryView from '@/components/InventoryView.jsx';

const MaterialDeliveriesPage = () => {
  const navigate = useNavigate();
  const { selectedProject } = useOutletContext();
  const [activeTab, setActiveTab] = useState('deliveries');

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a project to view material deliveries.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Material Deliveries</h1>
          <p className="text-muted-foreground">Manage incoming materials and inventory for {selectedProject.name}</p>
        </div>
        {activeTab === 'deliveries' && (
          <Button onClick={() => navigate('/dashboard/material-deliveries/new')} className="shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            New Delivery
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="deliveries">Deliveries Log</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Summary</TabsTrigger>
        </TabsList>
        
        <TabsContent value="deliveries" className="mt-0">
          <MaterialDeliveriesList projectId={selectedProject.id} />
        </TabsContent>
        
        <TabsContent value="inventory" className="mt-0">
          <InventoryView projectId={selectedProject.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MaterialDeliveriesPage;
