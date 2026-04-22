import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight } from 'lucide-react';

const WorkerHoursWidget = ({ projectId }) => {
  const [data, setData] = useState({ workers: 0, totalHours: 0, todayHours: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    const fetch = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const [workers, hours, todayHours] = await Promise.all([
          pb.collection('project_workers').getList(1, 1, { filter: `project_id = "${projectId}"`, $autoCancel: false }),
          pb.collection('worker_hours').getFullList({ filter: `project_id = "${projectId}"`, $autoCancel: false }),
          pb.collection('worker_hours').getFullList({ filter: `project_id = "${projectId}" && date = "${today}"`, $autoCancel: false })
        ]);
        const total = hours.reduce((s, h) => s + (h.regular_hours || 0) + (h.overtime_hours || 0), 0);
        const todays = todayHours.reduce((s, h) => s + (h.regular_hours || 0) + (h.overtime_hours || 0), 0);
        setData({ workers: workers.totalItems, totalHours: total, todayHours: todays });
      } catch {
        // silent fail on widget
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [projectId]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" /> Worker Hours
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 bg-muted animate-pulse rounded" />
        ) : (
          <div className="space-y-1">
            <div className="text-2xl font-bold">{data.totalHours}h</div>
            <div className="text-xs text-muted-foreground">{data.workers} workers · {data.todayHours}h today</div>
          </div>
        )}
        <Button variant="ghost" size="sm" className="mt-3 w-full justify-between px-0" asChild>
          <Link to="/dashboard/worker-hours">View Details <ArrowRight className="w-3 h-3" /></Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default WorkerHoursWidget;
