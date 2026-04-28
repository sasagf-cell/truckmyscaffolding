import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Loader2, ShieldCheck, ShieldAlert, ClipboardX } from 'lucide-react';

const InspectionHistory = ({ list, isLoading }) => {
  if (isLoading && list.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <Card className="py-14 text-center">
        <ClipboardX className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
        <p className="text-muted-foreground font-medium">No inspection records yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Complete an inspection using the form to start building a history.
        </p>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Scaffold</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Result</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notes</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Next Due</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {list.map((item) => {
            const isPast = item.next_inspection_date
              ? new Date(item.next_inspection_date) < new Date()
              : false;
            const scaffoldNum =
              item.expand?.scaffold_log_id?.scaffold_number ||
              (item.scaffold_log_id ? `LOG-${item.scaffold_log_id.slice(-4).toUpperCase()}` : '—');

            return (
              <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {new Date(item.created).toLocaleDateString('de-DE')}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  {scaffoldNum}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {item.status === 'pass' ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 gap-1">
                      <ShieldCheck className="w-3 h-3" /> PASS
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 gap-1">
                      <ShieldAlert className="w-3 h-3" /> FAIL
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">
                  {item.notes || '—'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {item.next_inspection_date ? (
                    <span className={isPast ? 'text-red-600 dark:text-red-400 font-medium' : 'text-muted-foreground'}>
                      {new Date(item.next_inspection_date).toLocaleDateString('de-DE')}
                      {isPast && ' ⚠'}
                    </span>
                  ) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InspectionHistory;
