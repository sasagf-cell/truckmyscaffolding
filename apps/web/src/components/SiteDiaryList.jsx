
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Search, Filter } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useSiteDiary } from '@/hooks/useSiteDiary.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SiteDiaryList = ({ projectId }) => {
  const navigate = useNavigate();
  const { fetchEntries, loading } = useSiteDiary();
  
  const [entries, setEntries] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [weatherFilter, setWeatherFilter] = useState('all');

  const loadData = async () => {
    if (!projectId) return;

    // pb.filter() safely escapes all values — prevents PocketBase filter injection
    const filterParts = [pb.filter('project_id = {:pid}', { pid: projectId })];
    if (weatherFilter !== 'all') {
      filterParts.push(pb.filter('weather = {:w}', { w: weatherFilter }));
    }
    if (searchTerm) {
      filterParts.push(pb.filter('(work_summary ~ {:q} || notes ~ {:q})', { q: searchTerm }));
    }
    const filterStr = filterParts.join(' && ');

    const result = await fetchEntries(currentPage, 10, filterStr);
    if (result) {
      setEntries(result.items);
      setTotalPages(result.totalPages);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId, currentPage, weatherFilter, searchTerm]);

  const getStatusBadge = (entry) => {
    // Check if all required fields are filled
    const isComplete = entry.weather && entry.temperature !== null && entry.personnel_count !== null && entry.work_summary;
    
    if (isComplete) {
      return <Badge variant="outline" className="bg-success/20 text-success border-0">Complete</Badge>;
    }
    return <Badge variant="outline" className="bg-warning/20 text-warning border-0">Incomplete</Badge>;
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities or notes..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Select value={weatherFilter} onValueChange={setWeatherFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Weather" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Weather</SelectItem>
                <SelectItem value="sunny">Sunny</SelectItem>
                <SelectItem value="cloudy">Cloudy</SelectItem>
                <SelectItem value="rain">Rain</SelectItem>
                <SelectItem value="snow">Snow</SelectItem>
                <SelectItem value="wind">Wind</SelectItem>
                <SelectItem value="frost">Frost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Weather</TableHead>
                <TableHead>Temp (°C)</TableHead>
                <TableHead>Workers</TableHead>
                <TableHead className="max-w-[300px]">Activities</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-6 w-20 ml-auto rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No diary entries found.
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow 
                    key={entry.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate(`/dashboard/site-diary/${entry.id}`)}
                  >
                    <TableCell className="font-medium">
                      {format(new Date(entry.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="capitalize">{entry.weather}</TableCell>
                    <TableCell>{entry.temperature}°C</TableCell>
                    <TableCell>{entry.personnel_count}</TableCell>
                    <TableCell className="max-w-[300px] truncate text-muted-foreground">
                      {entry.work_summary}
                    </TableCell>
                    <TableCell className="text-right">
                      {getStatusBadge(entry)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
            >
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || loading}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SiteDiaryList;
