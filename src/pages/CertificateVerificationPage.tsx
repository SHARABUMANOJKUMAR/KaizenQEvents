import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  BadgeCheck, 
  Download, 
  Share2, 
  Copy,
  ExternalLink
} from 'lucide-react';
import { Button, Card, Skeleton } from '../components/ui';
import { certificateService, type CertificateData } from '../services/certificateService';

const normalizeGoogleDrivePdfUrl = (url?: string) => {
  if (!url) return null;
  let fileId = '';
  
  const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    fileId = fileIdMatch[1];
  } else {
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      fileId = idMatch[1];
    }
  }

  if (!fileId) return null;

  return {
    fileId,
    previewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
    viewUrl: `https://drive.google.com/file/d/${fileId}/view`,
    downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`
  };
};

export const CertificateVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const certId = searchParams.get('cert');
  
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [pdfLinks, setPdfLinks] = useState<{fileId: string; previewUrl: string; viewUrl: string; downloadUrl: string} | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    async function verifyCertificate() {
      if (!certId) {
        setLoading(false);
        return;
      }

      try {
        const data = await certificateService.getCertificateById(certId.trim());
        setCertificate(data);
        if (data && data.pdfUrl) {
          const links = normalizeGoogleDrivePdfUrl(data.pdfUrl);
          setPdfLinks(links);
          console.log("PDF URL:", data.pdfUrl);
          if (links) {
            console.log("PDF file ID:", links.fileId);
            console.log("Preview URL:", links.previewUrl);
            console.log("View URL:", links.viewUrl);
            console.log("Download URL:", links.downloadUrl);
          }
        }
      } catch (err) {
        console.error('Verification error:', err);
      } finally {
        setLoading(false);
      }
    }

    verifyCertificate();
  }, [certId]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (err) {
      console.error('Failed to copy ID', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Verified ${certificate?.course} Certificate`,
          text: `My ${certificate?.course} certificate from Kaizen Q Events.`,
          url: window.location.href
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleLinkedInShare = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleInstagramShare = () => {
    alert("To share on Instagram, please download your certificate first and upload it manually.");
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  };

  // Missing Certificate ID State
  if (!certId) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 p-4">
        <SEO title="Certificate Verification | Kaizen Q Events" description="Verify official certificates issued by Kaizen Q Events." noindex={true} />
        <Card className="max-w-md w-full text-center p-8 border-gray-200 shadow-lg">
          <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
            <BadgeCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Certificate Verification</h1>
          <p className="text-gray-600 mb-8">
            Please provide a valid Certificate ID to verify a certificate.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg mb-8 text-sm text-gray-600 text-left">
            <p className="font-semibold mb-2 text-gray-700">Example URL:</p>
            <p className="break-all font-mono">https://kaizenqevents.click/verify?cert=KQE-GH-2026-0001</p>
          </div>
          <Link to="/">
            <Button fullWidth variant="primary">Go to Kaizen Q Events</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex flex-col items-center">
            <Skeleton className="h-20 w-48 mb-6" />
            <Skeleton className="h-6 w-3/4 mb-8" />
          </div>
          <Card className="p-8">
            <div className="space-y-6">
              <Skeleton className="h-8 w-1/3" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Invalid Certificate State
  if (!certificate) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <SEO title="Certificate Not Found | Kaizen Q Events" description="Certificate verification failed." noindex={true} />
        <Card className="max-w-md w-full text-center p-8 border-red-100 shadow-xl">
          <div className="mx-auto w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
            <XCircle size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn't verify this certificate. Please check the Certificate ID and try again.
          </p>
          <div className="bg-gray-100 rounded-lg p-4 mb-8">
            <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Entered ID</p>
            <p className="font-mono text-lg font-bold text-gray-900">{certId}</p>
          </div>
          <Link to="/">
            <Button variant="outline" fullWidth leftIcon={<ArrowLeft size={18} />}>
              Back to Kaizen Q Events
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Valid Certificate State
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <SEO 
        title={`Certificate Verification — ${certificate.certificateId}`} 
        description={`Verify official ${certificate.course} certificates issued by Kaizen Q Events.`} 
      />
      
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Verification Hero */}
        <div className="text-center">
          <Link to="/" className="inline-block mb-8">
            <img 
              src="https://res.cloudinary.com/dwv8kc9vb/image/upload/v1788465282/KAIZEN_Q_EVENTS_kxjtz4.png" 
              alt="Kaizen Q Events" 
              className="h-16 sm:h-20 object-contain mx-auto"
            />
          </Link>
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full font-bold shadow-sm border border-green-100">
              <CheckCircle2 size={20} className="text-green-600" />
              VERIFIED CERTIFICATE
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">
            Certificate Verified Successfully
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            This certificate has been successfully verified and is officially issued by Kaizen Q Events.
          </p>
        </div>

        {/* Certificate Information Card */}
        <Card className="shadow-lg border-gray-100 overflow-hidden" padding={false}>
          <div className="bg-white p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Recipient</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-bold text-gray-900">{certificate.fullName}</p>
                    <BadgeCheck className="text-blue-500 shrink-0" size={24} />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Program</p>
                  <p className="text-lg font-semibold text-gray-800">{certificate.course}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Certificate ID</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-lg font-mono font-bold text-gray-900">{certificate.certificateId}</p>
                    <button 
                      onClick={() => handleCopyId(certificate.certificateId)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors flex items-center gap-1"
                    >
                      {copiedId ? (
                        <><CheckCircle2 size={14} /> Copied</>
                      ) : (
                        <><Copy size={14} /> Copy</>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Completion Date</p>
                  <p className="text-lg font-semibold text-gray-800">{certificate.completionDate}</p>
                </div>
                
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Issuer</p>
                  <div className="flex items-center gap-2">
                    <img src="https://res.cloudinary.com/dwv8kc9vb/image/upload/v1788465282/KAIZEN_Q_EVENTS_kxjtz4.png" alt="Icon" className="w-6 h-6 object-contain" />
                    <p className="text-lg font-semibold text-gray-800">Kaizen Q Events</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
          
          <div className="bg-gray-50 border-t border-gray-100 p-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <CheckCircle2 size={20} className="text-green-500" />
              <span>Authenticity verified cryptographically</span>
            </div>
          </div>
        </Card>

        {/* Certificate Preview */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 text-center">Certificate Preview</h2>
          <Card className="shadow-md overflow-hidden bg-gray-200 relative min-h-[300px] flex items-center justify-center" padding={false}>
            {certificate.pdfUrl ? (
              <iframe 
                src={pdfLinks?.previewUrl || certificate.pdfUrl} 
                title="Certificate Preview"
                className="w-full aspect-[1.414/1] md:aspect-[1.414/1] bg-white"
                style={{ border: 'none' }}
              />
            ) : (
              <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                <ExternalLink size={48} className="mb-4 opacity-50" />
                <p className="font-medium mb-4">Certificate PDF is currently unavailable.</p>
                <p className="text-sm max-w-sm">The PDF preview could not be loaded, but the certificate is valid.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <Button 
            variant="primary" 
            size="lg" 
            leftIcon={<Download size={20} />} 
            fullWidth
            onClick={() => {
              const url = pdfLinks?.downloadUrl || certificate.pdfUrl;
              if (url) {
                window.open(url, '_blank', 'noopener,noreferrer');
              } else {
                alert("Download link is currently unavailable.");
              }
            }}
          >
            Download PDF
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            leftIcon={<ExternalLink size={20} />} 
            fullWidth
            onClick={() => {
              const url = pdfLinks?.viewUrl || certificate.pdfUrl;
              if (url) {
                window.open(url, '_blank', 'noopener,noreferrer');
              } else {
                alert("View link is currently unavailable.");
              }
            }}
          >
            View Full Screen
          </Button>
          <Button 
            variant="secondary" 
            size="lg" 
            leftIcon={<Share2 size={20} />} 
            fullWidth
            onClick={handleShare}
          >
            Share Certificate
          </Button>
        </div>

        {/* Social Sharing */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 pt-8 mt-8">
          <h3 className="text-center text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Share your achievement</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={handleLinkedInShare}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0077b5] hover:bg-[#006396] text-white rounded-lg font-semibold transition-colors"
            >
              <ExternalLink size={18} />
              LinkedIn
            </button>
            <button 
              onClick={handleInstagramShare}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90 text-white rounded-lg font-semibold transition-opacity"
            >
              <ExternalLink size={18} />
              Instagram
            </button>
            <button 
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors"
            >
              {copiedLink ? (
                <><CheckCircle2 size={18} className="text-green-600" /> Copied!</>
              ) : (
                <><Copy size={18} /> Copy Link</>
              )}
            </button>
          </div>
        </div>

        {/* Trust / Verification Information */}
        <div className="bg-blue-50/50 rounded-2xl p-6 sm:p-8 mt-12 border border-blue-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">How certificate verification works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative">
            <div className="text-center z-10">
              <div className="w-10 h-10 mx-auto bg-white rounded-full flex items-center justify-center text-blue-600 font-bold shadow-sm mb-3 border border-blue-100">1</div>
              <p className="text-sm font-medium text-gray-700">Scan QR Code or visit URL</p>
            </div>
            <div className="text-center z-10">
              <div className="w-10 h-10 mx-auto bg-white rounded-full flex items-center justify-center text-blue-600 font-bold shadow-sm mb-3 border border-blue-100">2</div>
              <p className="text-sm font-medium text-gray-700">System checks Certificate ID</p>
            </div>
            <div className="text-center z-10">
              <div className="w-10 h-10 mx-auto bg-white rounded-full flex items-center justify-center text-blue-600 font-bold shadow-sm mb-3 border border-blue-100">3</div>
              <p className="text-sm font-medium text-gray-700">Official details displayed</p>
            </div>
            <div className="text-center z-10">
              <div className="w-10 h-10 mx-auto bg-white rounded-full flex items-center justify-center text-blue-600 font-bold shadow-sm mb-3 border border-blue-100">4</div>
              <p className="text-sm font-medium text-gray-700">View or download Original PDF</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CertificateVerificationPage;
