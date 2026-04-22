
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  AlertTriangle, 
  CalendarX, 
  Clock, 
  PackageMinus, 
  ShieldAlert, 
  Users, 
  CheckCircle2, 
  Circle, 
  Trash2 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const AlertCard = ({ alert, onToggleRead, onDelete, onAction }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'border-l-destructive bg-destructive/5';
      case 'High': return 'border-l-orange-500 bg-orange-500/5';
      case 'Medium': return 'border-l-yellow-500 bg-yellow-500/5';
      case 'Low': return 'border-l-muted-foreground bg-muted/50';
      default: return 'border-l-border bg-card';
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'Critical': return <Badge variant="destructive">Critical</Badge>;
      case 'High': return <Badge className="bg-orange-500 hover:bg-orange-600">High</Badge>;
      case 'Medium': return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950">Medium</Badge>;
      case 'Low': return <Badge variant="secondary">Low</Badge>;
      default: return null;
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'inactive_scaffolds': return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'missing_diary': return <CalendarX className="w-5 h-5 text-orange-500" />;
      case 'overdue_requests': return <Clock className="w-5 h-5 text-destructive" />;
      case 'low_stock': return <PackageMinus className="w-5 h-5 text-yellow-600" />;
      case 'safety_incidents': return <ShieldAlert className="w-5 h-5 text-destructive" />;
      case 'team_alerts': return <Users className="w-5 h-5 text-blue-500" />;
      default: return <AlertTriangle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getActionText = (type) => {
    switch (type) {
      case 'inactive_scaffolds': return 'View Scaffolds';
      case 'missing_diary': return 'Add Entry';
      case 'overdue_requests': return 'Review Requests';
      case 'low_stock': return 'Check Inventory';
      case 'safety_incidents': return 'View Incident';
      case 'team_alerts': return 'Manage Team';
      default: return 'View Details';
    }
  };

  return (
    <Card className={`border-l-4 transition-all ${getSeverityColor(alert.severity)} ${alert.is_read ? 'opacity-70' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="mt-1 shrink-0">
            {getIcon(alert.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className={`font-semibold text-base truncate ${alert.is_read ? 'text-muted-foreground' : 'text-foreground'}`}>
                {alert.title}
              </h4>
              <div className="flex items-center gap-2 shrink-0">
                {getSeverityBadge(alert.severity)}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {alert.description}
            </p>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-xs text-muted-foreground font-medium">
                {formatDistanceToNow(new Date(alert.created), { addSuffix: true })}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onAction(alert)}>
                  {getActionText(alert.type)}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => onToggleRead(alert.id, !alert.is_read)}
                  title={alert.is_read ? "Mark as unread" : "Mark as read"}
                >
                  {alert.is_read ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Circle className="w-4 h-4 text-muted-foreground" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" 
                  onClick={() => onDelete(alert.id)}
                  title="Delete alert"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertCard;
