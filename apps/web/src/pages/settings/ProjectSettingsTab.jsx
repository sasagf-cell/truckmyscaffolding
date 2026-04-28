
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useSettings } from '@/hooks/useSettings.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, QrCode } from 'lucide-react';
import QRGeneratorModal from '@/components/QRGeneratorModal.jsx';

const ProjectSettingsTab = () => {
  const { selectedProject } = useOutletContext() ?? {};
  const { getProjectSettings, updateProjectDetails, loading } = useSettings();
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const [project, setProject] = useState({
    name: '',
    location: '',
    type: 'Commercial',
    description: '',
    status: 'Active'
  });

  useEffect(() => {
    const loadProject = async () => {
      if (selectedProject?.id) {
        const data = await getProjectSettings(selectedProject.id);
        if (data) {
          setProject({
            name: data.name || '',
            location: data.location || '',
            type: data.type || 'Commercial',
            description: data.description || '',
            status: data.status || 'Active'
          });
        }
      }
    };
    loadProject();
  }, [selectedProject, getProjectSettings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setProject(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedProject?.id) return;
    await updateProjectDetails(selectedProject.id, project);
  };

  if (!selectedProject) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Please select a project from the sidebar to view its settings.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Project Settings</CardTitle>
              <CardDescription>Manage details and status for the currently selected project.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setQrModalOpen(true)}>
              <QrCode className="w-4 h-4 mr-1" /> QR Code
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <Label htmlFor="name">Project Name *</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={project.name} 
                  onChange={handleChange} 
                  required
                />
              </div>
              <div className="form-group">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  name="location" 
                  value={project.location} 
                  onChange={handleChange} 
                />
              </div>
              <div className="form-group">
                <Label htmlFor="type">Project Type</Label>
                <Select value={project.type} onValueChange={(val) => handleSelectChange('type', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Residential">Residential</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Industrial">Industrial</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="form-group">
                <Label htmlFor="status">Status</Label>
                <Select value={project.status} onValueChange={(val) => handleSelectChange('status', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="form-group">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={project.description} 
                onChange={handleChange} 
                className="min-h-[100px]"
              />
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <QRGeneratorModal open={qrModalOpen} onOpenChange={setQrModalOpen} project={selectedProject} />
    </div>
  );
};

export default ProjectSettingsTab;
