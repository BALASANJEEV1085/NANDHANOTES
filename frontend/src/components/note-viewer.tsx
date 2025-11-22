import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Download, FileText, X, Image, FileDown, File, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface Note {
  id: string;
  title: string;
  subject: string;
  subjectCode: string;
  regulation: string;
  year: string;
  description: string;
  fileType: 'pdf' | 'image' | 'ppt' | 'doc';
  uploadedBy: string;
  uploadDate: string;
  fileUrl: string;
}

interface NoteViewerProps {
  note: Note | null;
  onClose: () => void;
  onDownloadNote: (noteId: string) => void;
}

export function NoteViewer({ note, onClose, onDownloadNote }: NoteViewerProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!note) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownloadNote(note.id);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePreview = () => {
    if (!note.fileUrl) return;

    let viewerUrl = '';

    if (note.fileType === 'pdf') {
      viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(note.fileUrl)}&embedded=true`;
    } else if (['ppt', 'doc'].includes(note.fileType)) {
      viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(note.fileUrl)}&embedded=true`;
    } else if (note.fileType === 'image') {
      viewerUrl = note.fileUrl;
    }

    if (viewerUrl) {
      // ⭐ OPEN IN SAME TAB ⭐
      window.open(viewerUrl, '_self'); 
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-500" />;
      case 'image':
        return <Image className="w-8 h-8 text-blue-500" />;
      case 'ppt':
        return <FileDown className="w-8 h-8 text-orange-500" />;
      case 'doc':
        return <FileText className="w-8 h-8 text-blue-600" />;
      default:
        return <FileText className="w-8 h-8" />;
    }
  };

  const getFileTypeDisplayName = (fileType: string) => {
    switch (fileType) {
      case 'pdf': return 'PDF Document';
      case 'ppt': return 'PowerPoint Presentation';
      case 'doc': return 'Word Document';
      case 'image': return 'Image';
      default: return fileType.toUpperCase();
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-3">
                {getFileIcon(note.fileType)}
                <div className="flex-1">
                  <h2 className="text-2xl mb-1">{note.title}</h2>
                  <p className="text-muted-foreground">
                    {note.subject} ({note.subjectCode})
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{note.regulation}</Badge>
                <Badge variant="secondary">Year {note.year}</Badge>
                <Badge variant="outline">{getFileTypeDisplayName(note.fileType)}</Badge>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto">
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 font-semibold">Description</h3>
              <p className="text-muted-foreground">{note.description}</p>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">File Preview</h3>
              </div>

              <div className="flex flex-col gap-3 mt-4">
                {/* ⭐ OPEN BUTTON — Opens in SAME TAB */} 
                <Button
                  onClick={handlePreview}
                  disabled={!note.fileUrl}
                  variant="outline"
                  className="gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open
                </Button>

                {/* DOWNLOAD BUTTON */}
                <Button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="gap-2 cursor-pointer"
                >
                  {isDownloading ? (
                    <>Downloading...</>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <div>
                <p className="text-sm text-muted-foreground">Uploaded by</p>
                <p className="text-sm">{note.uploadedBy}</p>
                <p className="text-xs text-muted-foreground">{note.uploadDate}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
