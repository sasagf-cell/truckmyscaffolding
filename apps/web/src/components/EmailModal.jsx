
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useReports } from '@/hooks/useReports.js';

const EmailModal = ({ isOpen, onClose, projectId, reportType, date, projectName }) => {
  const { currentUser } = useAuth();
  const { sendReportEmail, loading } = useReports();
  
  const [formData, setFormData] = useState({
    recipientEmail: currentUser?.email || '',
    cc: '',
    subject: `[${projectName}] ${reportType === 'daily' ? 'Daily' : 'Monthly'} Report - ${date}`,
    message: `Please find attached the ${reportType} report for ${projectName} (${date}).\n\nBest regards,\n${currentUser?.full_name || 'TrackMyScaffolding User'}`
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await sendReportEmail({
      projectId,
      reportType,
      date,
      ...formData
    });
    
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Send Report by Email</DialogTitle>
            <DialogDescription>
              The report will be generated as a PDF and attached to this email.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="recipientEmail">To *</Label>
              <Input
                id="recipientEmail"
                name="recipientEmail"
                type="email"
                value={formData.recipientEmail}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="cc">CC</Label>
              <Input
                id="cc"
                name="cc"
                type="text"
                placeholder="email1@example.com, email2@example.com"
                value={formData.cc}
                onChange={handleChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.recipientEmail || !formData.subject}>
              {loading ? 'Sending...' : 'Send Email'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmailModal;
