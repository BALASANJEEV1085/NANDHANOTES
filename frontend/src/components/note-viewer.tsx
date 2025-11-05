import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Download, FileText, X, Image, FileDown, File } from 'lucide-react';
import { useState } from 'react';
import { OrbitProgress } from './ui/orbit-progress';

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

  const renderFilePreview = () => {
    if (!note.fileUrl) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>File not available for preview</p>
        </div>
      );
    }

    // ✅ PDF Preview
    if (note.fileType === 'pdf') {
      const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(note.fileUrl)}&embedded=true`;
      return (
        <iframe
          src={viewerUrl}
          className="w-full h-[calc(100vh-300px)] border-0 rounded-lg"
          title={note.title}
        />
      );
    }

    // ✅ PPT / PPTX Preview (Google Viewer fallback to Office)
    if (note.fileType === 'ppt') {
      const googleViewer = `https://docs.google.com/gview?url=${encodeURIComponent(note.fileUrl)}&embedded=true`;
      const officeViewer = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(note.fileUrl)}`;
      return (
        <iframe
          src={googleViewer}
          className="w-full h-[calc(100vh-300px)] border-0 rounded-lg"
          title={note.title}
          onError={(e: any) => {
            e.target.src = officeViewer;
          }}
        />
      );
    }

    // ✅ DOC / DOCX Preview (Google Viewer fallback to Office)
    if (note.fileType === 'doc') {
      const googleViewer = `https://docs.google.com/gview?url=${encodeURIComponent(note.fileUrl)}&embedded=true`;
      const officeViewer = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(note.fileUrl)}`;
      return (
        <iframe
          src={googleViewer}
          className="w-full h-[calc(100vh-300px)] border-0 rounded-lg"
          title={note.title}
          onError={(e: any) => {
            e.target.src = officeViewer;
          }}
        />
      );
    }

    // ✅ Image Preview
    if (note.fileType === 'image') {
      return (
        <div className="flex justify-center">
          <img
            src={note.fileUrl}
            alt={note.title}
            className="max-w-full max-h-[calc(100vh-300px)] object-contain rounded-lg"
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      );
    }

    // ❌ Unsupported File
    return (
      <div className="text-center py-8 text-muted-foreground">
        <File className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Preview not available for this file type</p>
      </div>
    );
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

  const getPreviewMessage = () => {
    if (!note.fileUrl) return "File not available for preview";
    switch (note.fileType) {
      case 'pdf': return "PDF document preview (Google Docs Viewer)";
      case 'ppt': return "PowerPoint preview (Google Docs Viewer)";
      case 'doc': return "Word preview (Google Docs Viewer)";
      case 'image': return "Image preview";
      default: return "File preview";
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
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
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto">
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold">Description</h3>
              <p className="text-muted-foreground">{note.description}</p>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">File Preview</h3>
                <p className="text-xs text-muted-foreground">{getPreviewMessage()}</p>
              </div>
              <div className="bg-muted rounded-lg p-4 flex items-center justify-center min-h-[400px]">
                {renderFilePreview()}
              </div>
            </div>

            <div className="border-t pt-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Uploaded by</p>
                <p>{note.uploadedBy}</p>
                <p className="text-xs text-muted-foreground">{note.uploadDate}</p>
              </div>
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                className="gap-2 cursor-pointer"
              >
                {isDownloading ? (
                  <>
                    <OrbitProgress
                      variant="disc"
                      dense
                      color="#32cd32"
                      size="medium"
                      text=""
                      textColor=""
                    />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
