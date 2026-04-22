
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Edit, Trash2, Calendar, Thermometer, Users, Cloud, ShieldAlert, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useSiteDiary } from '@/hooks/useSiteDiary.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

const SiteDiaryEntryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchEntryById, deleteEntry } = useSiteDiary();
  
  const [entry, setEntry] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsFetching(true);
      const data = await fetchEntryById(id);
      if (data) {
        setEntry(data);
      }
      setIsFetching(false);
    };
    loadData();
  }, [id, fetchEntryById]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this diary entry? This action cannot be undone.')) {
      const success = await deleteEntry(id);
      if (success) {
        navigate('/dashboard/site-diary');
      }
    }
  };

  if (isFetching) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-muted-foreground">Entry not found</h2>
        <Button variant="link" onClick={() => navigate('/dashboard/site-diary')} className="mt-4">
          Return to diary
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/site-diary')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Diary Entry: {format(new Date(entry.date), 'MMMM dd, yyyy')}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={() => navigate(`/dashboard/site-diary/${entry.id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conditions Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daily Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{format(new Date(entry.date), 'MMM dd, yyyy')}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Weather</p>
                  <p className="font-medium capitalize">{entry.weather}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Temperature</p>
                  <p className="font-medium">{entry.temperature}°C</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Workers Present</p>
                  <p className="font-medium">{entry.personnel_count}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="print:hidden">
            <CardContent className="p-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Created:</span>
                <span>{format(new Date(entry.created), 'MMM dd, HH:mm')}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span>{format(new Date(entry.updated), 'MMM dd, HH:mm')}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Activities & Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap leading-relaxed">
                {entry.work_summary}
              </p>
            </CardContent>
          </Card>

          {(entry.safety_issues || entry.notes) && (
            <Card>
              <CardContent className="p-6 space-y-6">
                {entry.safety_issues && (
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 text-destructive">
                      <ShieldAlert className="w-5 h-5" />
                      Safety Incidents / Issues
                    </h3>
                    <p className="whitespace-pre-wrap leading-relaxed bg-destructive/5 p-4 rounded-lg border border-destructive/20">
                      {entry.safety_issues}
                    </p>
                  </div>
                )}

                {entry.safety_issues && entry.notes && <Separator />}

                {entry.notes && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Additional Notes</h3>
                    <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                      {entry.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SiteDiaryEntryDetail;
