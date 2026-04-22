
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval,
  isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSiteDiary } from '@/hooks/useSiteDiary.js';

const SiteDiaryCalendar = ({ projectId }) => {
  const navigate = useNavigate();
  const { fetchEntries, loading } = useSiteDiary();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [entries, setEntries] = useState({});

  const loadMonthData = async () => {
    if (!projectId) return;

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    // Add buffer for timezone issues
    const startStr = format(monthStart, 'yyyy-MM-dd');
    const endNextDay = new Date(monthEnd);
    endNextDay.setDate(endNextDay.getDate() + 1);
    const endStr = format(endNextDay, 'yyyy-MM-dd');

    const result = await fetchEntries(1, 500, `project_id="${projectId}" && date >= "${startStr}" && date < "${endStr}"`);
    
    if (result) {
      const entriesMap = {};
      result.items.forEach(entry => {
        const dateKey = entry.date.split('T')[0];
        entriesMap[dateKey] = entry;
      });
      setEntries(entriesMap);
    }
  };

  useEffect(() => {
    loadMonthData();
  }, [currentMonth, projectId]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleDayClick = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const existingEntry = entries[dateStr];
    
    if (existingEntry) {
      navigate(`/dashboard/site-diary/${existingEntry.id}`);
    } else {
      navigate(`/dashboard/site-diary/new?date=${dateStr}`);
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentMonth);
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-medium text-sm text-muted-foreground py-2">
          {format(addMonths(startDate, i), 'EEEEEE')}
        </div>
      );
    }
    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    allDays.forEach((currentDay, i) => {
      formattedDate = format(currentDay, dateFormat);
      const dateKey = format(currentDay, 'yyyy-MM-dd');
      const entry = entries[dateKey];
      const isCurrentMonth = isSameMonth(currentDay, monthStart);
      const isDayToday = isToday(currentDay);

      days.push(
        <div
          key={currentDay.toString()}
          onClick={() => handleDayClick(currentDay)}
          className={`
            min-h-[100px] p-2 border border-border/50 transition-all cursor-pointer relative group
            ${!isCurrentMonth ? 'bg-muted/30 text-muted-foreground' : 'bg-card hover:bg-accent'}
            ${isDayToday ? 'ring-2 ring-primary ring-inset z-10' : ''}
            ${!entry && isCurrentMonth && currentDay < new Date() ? 'bg-amber-50/30 dark:bg-amber-950/20' : ''}
          `}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-medium ${isDayToday ? 'text-primary' : ''}`}>
              {formattedDate}
            </span>
            {entry ? (
              <CheckCircle2 className="w-4 h-4 text-success" />
            ) : (
              isCurrentMonth && currentDay < new Date() && (
                <AlertCircle className="w-4 h-4 text-warning opacity-50" />
              )
            )}
          </div>
          
          {entry && (
            <div className="mt-2 text-xs space-y-1">
              <div className="truncate text-muted-foreground capitalize">{entry.weather}, {entry.temperature}°C</div>
              <div className="truncate text-muted-foreground">{entry.personnel_count} workers</div>
            </div>
          )}

          {/* Hover Preview */}
          <div className="absolute inset-0 bg-background/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center z-20 pointer-events-none border border-border rounded-sm shadow-lg">
            <span className="text-sm font-medium">
              {entry ? 'View Entry' : 'Add Entry'}
            </span>
          </div>
        </div>
      );

      if ((i + 1) % 7 === 0) {
        rows.push(
          <div className="grid grid-cols-7" key={currentDay.toString()}>
            {days}
          </div>
        );
        days = [];
      }
    });

    return <div className="border border-border rounded-lg overflow-hidden bg-card">{rows}</div>;
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        {renderHeader()}
        {renderDays()}
        {loading && Object.keys(entries).length === 0 ? (
          <div className="h-[600px] flex items-center justify-center text-muted-foreground">
            Loading calendar data...
          </div>
        ) : (
          renderCells()
        )}
      </CardContent>
    </Card>
  );
};

export default SiteDiaryCalendar;
