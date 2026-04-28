import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';
import pb from '@/lib/pocketbaseClient.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, ArrowRight } from 'lucide-react';

const WorkerHoursWidget = ({ projectId }) => {
  const [data, setData] = useState({ workers: 0, totalHours: 0, todayHours: 0 });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all');

  useEffect(() => {
    if (!projectId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        // Build date-range filter parts using pb.filter() for safe escaping
        const hoursFilterParts = [pb.filter('project_id = {:pid}', { pid: projectId })];
        if (timeframe === 'week') {
          const start = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
          const end = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
          hoursFilterParts.push(pb.filter('date >= {:s} && date <= {:e}', { s: start, e: end }));
        } else if (timeframe === 'month') {
          const start = format(startOfMonth(new Date()), 'yyyy-MM-dd');
          const end = format(endOfMonth(new Date()), 'yyyy-MM-dd');
          hoursFilterParts.push(pb.filter('date >= {:s} && date <= {:e}', { s: start, e: end }));
        }
        const [workers, hours, todayHours] = await Promise.all([
          pb.collection('project_workers').getList(1, 1, { filter: pb.filter('project_id = {:pid}', { pid: projectId }), $autoCancel: false }),
          pb.collection('worker_hours').getFullList({ filter: hoursFilterParts.join(' && '), $autoCancel: false }),
          pb.collection('worker_hours').getFullList({ filter: pb.filter('project_id = {:pid} && date = {:d}', { pid: projectId, d: today }), $autoCancel: false })
        ]);
        const total = hours.reduce((s, h) => s + (h.regular_hours || 0) + (h.overtime_hours || 0), 0);
        const todays = todayHours.reduce((s, h) => s + (h.regular_hours || 0) + (h.overtime_hours || 0), 0);
        setData({ workers: workers.totalItems, totalHours: total, todayHours: todays });
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId, timeframe]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Worker Hours
          </CardTitle>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[100px] h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
