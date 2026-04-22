import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, ScanBarcode } from 'lucide-react';

const ScaffoldQRCode = ({ scaffoldId, tagNumber, className }) => {
  // Use the public domain or relative path for handovers
  const handoverUrl = `${window.location.origin}/handover/${scaffoldId || 'DEMO'}`;

  const downloadQR = () => {
    const svg = document.getElementById(`qr-${scaffoldId}`);
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `Scaffold-QR-${tagNumber || scaffoldId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className={`glass-card flex flex-col items-center gap-4 ${className || ''}`}>
      <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-[10px]">
        <ScanBarcode className="w-4 h-4" />
        Site Handover Code
      </div>
      
      <div className="p-3 bg-white rounded-xl shadow-inner">
        <QRCodeSVG 
          id={`qr-${scaffoldId}`}
          value={handoverUrl} 
          size={160} 
          level="H"
          fgColor="#0a0a0a"
          includeMargin={false}
        />
      </div>
      
      <div className="text-center">
        <p className="text-sm font-bold text-white">{tagNumber || 'SN-XXXX-000'}</p>
        <p className="text-[10px] text-muted-foreground">Scan on-site to verify certification</p>
      </div>
      
      <button 
        onClick={downloadQR}
        className="btn-primary w-full py-2 flex items-center justify-center gap-2 group"
      >
        <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
        Download Tag
      </button>
    </div>
  );
};

export default ScaffoldQRCode;
