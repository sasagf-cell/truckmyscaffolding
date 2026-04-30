
import React, { useState, useEffect } from 'react';
import { Copy, Download, QrCode, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useSubcontractors } from '@/hooks/useSubcontractors.js';
import apiServerClient from '@/lib/apiServerClient.js';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PERMISSIONS_LIST = [
  { id: 'view_scaffold_requests', label: 'View Scaffold Requests' },
  { id: 'create_scaffold_requests', label: 'Create Scaffold Requests' },
  { id: 'approve_scaffold_requests', label: 'Approve Scaffold Requests' },
  { id: 'view_site_diary', label: 'View Site Diary' },
  { id: 'create_site_diary', label: 'Create Site Diary Entries' },
  { id: 'view_material_deliveries', label: 'View Material Deliveries' },
  { id: 'view_reports', label: 'View Reports' },
  { id: 'view_team', label: 'View Team Members' },
];

const InviteSubcontractorModal = ({ isOpen, onClose, projectId, onSuccess }) => {
  const { inviteSubcontractor, loading } = useSubcontractors();
  const { toast } = useToast();
  const [qrCode, setQrCode] = useState(null);
  const [inviteUrl, setInviteUrl] = useState('');
  const [generatingQr, setGeneratingQr] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      role: 'Supervisor',
      permissions: ['view_scaffold_requests', 'view_site_diary'],
      message: ''
    }
  });

  const selectedPermissions = watch('permissions');

  useEffect(() => {
    if (isOpen) {
      reset();
      setQrCode(null);
      setInviteUrl('');
    }
  }, [isOpen, reset]);

  const handlePermissionChange = (id, checked) => {
    if (checked) {
      setValue('permissions', [...selectedPermissions, id]);
    } else {
      setValue('permissions', selectedPermissions.filter(p => p !== id));
    }
  };

  const onSubmit = async (data) => {
    const result = await inviteSubcontractor({
      projectId,
      ...data
    });

    if (result?.success) {
      setInviteUrl(result.inviteUrl);
      if (onSuccess) onSuccess();
      // Don't close immediately so they can see the link/QR if they want
    }
  };

  const generateQR = async () => {
    if (!inviteUrl) return;
    setGeneratingQr(true);
    try {
      const res = await apiServerClient.fetch(`/site-team/qr-code?url=${encodeURIComponent(inviteUrl)}`);
      const data = await res.json();
      setQrCode(data.qrCode);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to generate QR code', variant: 'destructive' });
    } finally {
      setGeneratingQr(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    toast({ title: 'Copied', description: 'Invite link copied to clipboard' });
  };

  const downloadQR = () => {
    if (!qrCode) return;
    const a = document.createElement('a');
    a.href = qrCode;
    a.download = 'invite-qr.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite Team</DialogTitle>
          <DialogDescription>
            Send an invitation to join this project. They will receive an email with a secure link.
          </DialogDescription>
        </DialogHeader>

        {!inviteUrl ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input 
                  id="email" 
                  type="email" 
                  {...register('email', { required: 'Email is required' })} 
                  placeholder="worker@example.com"
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select onValueChange={(val) => setValue('role', val)} defaultValue="Supervisor">
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Supervisor">Supervisor</SelectItem>
                    <SelectItem value="Warehouse Manager">Warehouse Manager</SelectItem>
                    <SelectItem value="Coordinator">Coordinator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Permissions</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/30 p-4 rounded-lg border">
                {PERMISSIONS_LIST.map((perm) => (
                  <div key={perm.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={perm.id} 
                      checked={selectedPermissions.includes(perm.id)}
                      onCheckedChange={(checked) => handlePermissionChange(perm.id, checked)}
                    />
                    <Label htmlFor={perm.id} className="text-sm font-normal cursor-pointer">
                      {perm.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Personal Message (Optional)</Label>
              <Textarea 
                id="message" 
                {...register('message')} 
                placeholder="Welcome to the project team..."
                className="resize-none h-20"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Send Invite
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-6 space-y-6 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
            <div className="w-12 h-12 rounded-full bg-success/20 text-success flex items-center justify-center mb-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Invitation Sent!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                An email has been sent to the user. You can also share the link directly.
              </p>
            </div>

            <div className="w-full max-w-md flex items-center gap-2 p-2 bg-muted rounded-md border">
              <Input value={inviteUrl} readOnly className="bg-transparent border-0 focus-visible:ring-0" />
              <Button size="icon" variant="secondary" onClick={copyLink} className="shrink-0">
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            {qrCode ? (
              <div className="space-y-4 flex flex-col items-center">
                <div className="p-2 bg-white rounded-xl border shadow-sm">
                  <img src={qrCode} alt="Invite QR Code" className="w-48 h-48" />
                </div>
                <Button variant="outline" onClick={downloadQR}>
                  <Download className="w-4 h-4 mr-2" />
                  Download QR Code
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={generateQR} disabled={generatingQr}>
                {generatingQr ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <QrCode className="w-4 h-4 mr-2" />}
                Generate QR Code
              </Button>
            )}

            <Button className="w-full mt-4" onClick={onClose}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InviteSubcontractorModal;
