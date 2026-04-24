import React, { useState, useRef } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Copy, Download, QrCode, Clock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

const QRGeneratorModal = ({ open, onOpenChange, project }) => {
  const [joinUrl, setJoinUrl] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);

  const generateQR = async () => {
    if (!project?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/projects/${project.id}/qr-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('pb_auth_token')}` }
      });
      if (!res.ok) throw new Error('Failed to generate QR token');
      const { token, expires_at } = await res.json();
      setJoinUrl(`${window.location.origin}/join/${token}`);
      setExpiresAt(expires_at);
    } catch {
      toast.error('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!joinUrl) return;
    navigator.clipboard.writeText(joinUrl);
    toast.success('Link copied to clipboard');
  };

  const downloadPNG = () => {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `${project?.name || 'project'}-qr.png`;
    a.click();
  };

  const downloadSVG = () => {
    const svg = document.getElementById('qr-svg');
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${project?.name || 'project'}-qr.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleClose = () => {
    setJoinUrl(null);
    setExpiresAt(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" /> QR Site Onboarding
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Generate a QR code for <strong>{project?.name}</strong>. Subcontractors scan it to join instantly.
        </p>

        {!joinUrl ? (
          <Button onClick={generateQR} disabled={loading} className="w-full">
            {loading ? 'Generating...' : 'Generate QR Code'}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <QRCodeCanvas id="qr-canvas" value={joinUrl} size={200} includeMargin />
              <div className="hidden">
                <QRCodeSVG id="qr-svg" value={joinUrl} size={200} includeMargin />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Expires: {new Date(expiresAt).toLocaleString()}</span>
              <Badge variant="secondary">24h</Badge>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={copyLink}>
                <Copy className="w-4 h-4 mr-2" /> Copy Link
              </Button>
              <Button variant="outline" className="flex-1" onClick={downloadPNG}>
                <Download className="w-4 h-4 mr-2" /> PNG
              </Button>
              <Button variant="outline" className="flex-1" onClick={downloadSVG}>
                <Download className="w-4 h-4 mr-2" /> SVG
              </Button>
            </div>

            <Button variant="ghost" className="w-full text-sm" onClick={generateQR}>
              Generate New Code
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QRGeneratorModal;
