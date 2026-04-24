
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { useSiteDiary } from '@/hooks/useSiteDiary.js';
import apiServerClient from '@/lib/apiServerClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

const SiteDiaryEntryForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date');
  const isEditMode = !!id;
  
  const navigate = useNavigate();
  const { selectedProject } = useOutletContext() ?? {};
  const { createEntry, updateEntry, fetchEntryById, checkEntryExists, loading } = useSiteDiary();
  const { toast } = useToast();

  const [aiLoading, setAiLoading] = useState(false);
  const [rawNotes, setRawNotes] = useState('');
  const [enhanceLoading, setEnhanceLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: dateParam || format(new Date(), 'yyyy-MM-dd'),
    weather: '',
    temperature: '',
    personnel_count: '',
    work_summary: '',
    safety_issues: '',
    notes: ''
  });

  useEffect(() => {
    const loadData = async () => {
      if (isEditMode) {
        const data = await fetchEntryById(id);
        if (data) {
          setFormData({
            date: data.date.split('T')[0],
            weather: data.weather,
            temperature: data.temperature,
            personnel_count: data.personnel_count,
            work_summary: data.work_summary,
            safety_issues: data.safety_issues || '',
            notes: data.notes || ''
          });
        }
      } else if (dateParam && selectedProject) {
        // Check if entry already exists for this date to prevent duplicates
        const existing = await checkEntryExists(selectedProject.id, dateParam);
        if (existing) {
          toast({
            title: 'Entry exists',
            description: 'Redirecting to edit existing entry for this date.',
          });
          navigate(`/dashboard/site-diary/${existing.id}/edit`, { replace: true });
        }
      }
    };
    loadData();
  }, [id, isEditMode, dateParam, selectedProject, fetchEntryById, checkEntryExists, navigate, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAiDraft = async () => {
    if (!selectedProject || !formData.date) {
      toast({
        title: 'Missing Information',
        description: 'Project and Date are required to generate an AI draft.',
        variant: 'destructive'
      });
      return;
    }

    setAiLoading(true);
    try {
      const response = await apiServerClient.fetch('/ai/draft-diary-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          date: formData.date
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate draft');
      }

      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        work_summary: data.draftText
      }));
      
      toast({
        title: 'Draft Generated',
        description: 'AI has populated the activities field based on project data.'
      });
    } catch (error) {
      console.error('AI Draft error:', error);
      toast({
        title: 'Generation Failed',
        description: 'Could not generate AI draft. Please enter activities manually.',
        variant: 'destructive'
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleEnhanceNotes = async () => {
    if (!rawNotes.trim()) {
      toast({ title: 'No notes to enhance', description: 'Enter some rough notes first.', variant: 'destructive' });
      return;
    }
    setEnhanceLoading(true);
    try {
      const response = await apiServerClient.fetch('/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject?.id,
          message: `You are a professional construction site diary assistant. Format these rough field notes into a clear, professional site diary entry. Use formal construction management language. Be concise but complete. Output only the formatted diary text, no headings or explanations.\n\nRough notes: ${rawNotes}`
        })
      });
      if (!response.ok) throw new Error('Failed to enhance notes');
      const data = await response.json();
      const enhanced = data.response || data.message || data.reply || '';
      if (enhanced) {
        setFormData(prev => ({ ...prev, work_summary: enhanced }));
        setRawNotes('');
        toast({ title: 'Notes Enhanced', description: 'AI has formatted your notes into a professional diary entry.' });
      }
    } catch (error) {
      console.error('Enhance error:', error);
      toast({ title: 'Enhancement Failed', description: 'Could not enhance notes. Try again.', variant: 'destructive' });
    } finally {
      setEnhanceLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProject) {
      toast({ title: 'Error', description: 'No project selected.', variant: 'destructive' });
      return;
    }

    const payload = {
      project_id: selectedProject.id,
      date: new Date(formData.date).toISOString(),
      weather: formData.weather,
      temperature: Number(formData.temperature),
      personnel_count: Number(formData.personnel_count),
      work_summary: formData.work_summary,
      safety_issues: formData.safety_issues,
      notes: formData.notes
    };

    let result;
    if (isEditMode) {
      result = await updateEntry(id, payload);
    } else {
      // Double check existence before create
      const existing = await checkEntryExists(selectedProject.id, formData.date);
      if (existing) {
        toast({ title: 'Error', description: 'An entry already exists for this date.', variant: 'destructive' });
        return;
      }
      result = await createEntry(payload);
    }

    if (result) {
      navigate('/dashboard/site-diary');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/site-diary')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? 'Edit Diary Entry' : 'New Diary Entry'}
          </h1>
          <p className="text-muted-foreground">
            {selectedProject?.name}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Daily Conditions</CardTitle>
            <CardDescription>Record the basic site conditions for the day.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input 
                  id="date" 
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  disabled={isEditMode} // Usually don't change date of existing entry
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="weather">Weather *</Label>
                <Select 
                  value={formData.weather} 
                  onValueChange={(val) => handleSelectChange('weather', val)}
                  required
                >
                  <SelectTrigger id="weather">
                    <SelectValue placeholder="Select weather" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunny">Sunny</SelectItem>
                    <SelectItem value="cloudy">Cloudy</SelectItem>
                    <SelectItem value="rain">Rain</SelectItem>
                    <SelectItem value="snow">Snow</SelectItem>
                    <SelectItem value="wind">Wind</SelectItem>
                    <SelectItem value="frost">Frost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature (°C) *</Label>
                <Input 
                  id="temperature" 
                  name="temperature"
                  type="number"
                  value={formData.temperature}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="personnel_count">Workers Present *</Label>
                <Input 
                  id="personnel_count" 
                  name="personnel_count"
                  type="number"
                  min="0"
                  value={formData.personnel_count}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Notes → Enhance with AI */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="w-4 h-4 text-primary" />
              Quick Notes — Enhance with AI
            </CardTitle>
            <CardDescription>Type rough field notes and AI will format them into a professional diary entry.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={rawNotes}
              onChange={(e) => setRawNotes(e.target.value)}
              placeholder="e.g. mounted scaffold at reactor A level 2, 5 workers, missing 3 planks, delivery delayed 2h..."
              className="min-h-[80px] bg-background"
            />
            <Button
              type="button"
              onClick={handleEnhanceNotes}
              disabled={enhanceLoading || !rawNotes.trim()}
              className="bg-primary text-black hover:bg-primary/90"
              size="sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {enhanceLoading ? 'Enhancing...' : 'Enhance with AI'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Site Activities</CardTitle>
              <CardDescription>Detail the work completed and any issues.</CardDescription>
            </div>
            <Button 
              type="button" 
              variant="secondary" 
              size="sm" 
              onClick={handleAiDraft}
              disabled={aiLoading || !formData.date}
              className="bg-primary/10 text-primary hover:bg-primary/20 border-0"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {aiLoading ? 'Generating...' : 'AI Draft'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="work_summary">Activities & Progress *</Label>
              <Textarea 
                id="work_summary" 
                name="work_summary"
                value={formData.work_summary}
                onChange={handleInputChange}
                placeholder="Describe the work completed today..."
                className="min-h-[150px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="safety_issues">Safety Incidents / Issues</Label>
              <Textarea 
                id="safety_issues" 
                name="safety_issues"
                value={formData.safety_issues}
                onChange={handleInputChange}
                placeholder="Record any safety concerns, near misses, or incidents..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea 
                id="notes" 
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any other observations or notes..."
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/dashboard/site-diary')}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? 'Update Entry' : 'Save Entry'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SiteDiaryEntryForm;
