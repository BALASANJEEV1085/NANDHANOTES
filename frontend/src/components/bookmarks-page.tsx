import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { BookmarkCheck, FileText, Image, FileDown, Bookmark as BookmarkIcon } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

interface Note {
  id: string;
  title: string;
  subject: string;
  subjectCode: string;
  regulation: string;
  year: string;
  description: string;
  fileType: 'pdf' | 'image' | 'ppt';
  uploadedBy: string;
  uploadDate: string;
  isBookmarked: boolean;
  fileUrl?: string; // Add this line
}

interface BookmarksPageProps {
  onViewNote: (note: Note) => void;
  onToggleBookmark: (noteId: string) => void;
  onDownloadNote: (noteId: string) => void; // Add this prop
}

export function BookmarksPage({ onViewNote, onToggleBookmark, onDownloadNote }: BookmarksPageProps) {
  const [bookmarkedNotes, setBookmarkedNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch bookmarked notes
  useEffect(() => {
    fetchBookmarkedNotes();
  }, []);

  const fetchBookmarkedNotes = async () => {
    try {
      setLoading(true);
      // First fetch all notes from backend
      const res = await fetch('http://localhost:5000/get-notes');
      if (res.ok) {
        const notesData = await res.json();
        
        // Get bookmarked note IDs from localStorage
        const savedBookmarks = JSON.parse(localStorage.getItem('bookmarkedNotes') || '[]');
        
        // Filter only bookmarked notes and transform data - INCLUDING fileUrl
        const bookmarked = notesData
          .filter((note: any) => savedBookmarks.includes(note._id))
          .map((note: any) => ({
            id: note._id,
            title: note.topic || 'Untitled',
            subject: note.subject || 'Unknown Subject',
            subjectCode: note.subjectCode || 'N/A',
            regulation: note.regulation || 'Unknown',
            year: note.year || 'Unknown',
            description: note.description || 'No description available',
            fileType: getFileTypeFromUrl(note.fileUrl),
            uploadedBy: note.uploadedBy || 'Unknown User',
            uploadDate: getTimeAgo(new Date(note.uploadedAt)),
            isBookmarked: true,
            fileUrl: note.fileUrl // Add this line - crucial for preview/download
          }));
        
        setBookmarkedNotes(bookmarked);
      }
    } catch (error) {
      console.error('Error fetching bookmarked notes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine file type from URL
  const getFileTypeFromUrl = (url: string): 'pdf' | 'image' | 'ppt' => {
    if (!url) return 'pdf';
    const urlLower = url.toLowerCase();
    if (urlLower.includes('.pdf')) return 'pdf';
    if (urlLower.includes('.ppt') || urlLower.includes('.pptx')) return 'ppt';
    if (urlLower.includes('.jpg') || urlLower.includes('.jpeg') || urlLower.includes('.png') || urlLower.includes('.gif')) return 'image';
    return 'pdf';
  };

  // Helper function to get time ago string
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  };

  const handleToggleBookmark = (noteId: string) => {
    const noteTitle = bookmarkedNotes.find(note => note.id === noteId)?.title || 'Note';
    
    // Remove from bookmarks in localStorage
    const savedBookmarks = JSON.parse(localStorage.getItem('bookmarkedNotes') || '[]');
    const updatedBookmarks = savedBookmarks.filter((id: string) => id !== noteId);
    localStorage.setItem('bookmarkedNotes', JSON.stringify(updatedBookmarks));
    
    // Remove from local state
    setBookmarkedNotes(bookmarkedNotes.filter(note => note.id !== noteId));
    
    // Show toast notification
    toast.success('Bookmark removed!');
    
    // Notify parent component
    onToggleBookmark(noteId);
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'image':
        return <Image className="w-5 h-5 text-blue-500" />;
      case 'ppt':
        return <FileDown className="w-5 h-5 text-orange-500" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  // Add download handler for bookmarks page
  const handleDownload = (noteId: string) => {
    onDownloadNote(noteId);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl mb-2">Bookmarked Notes</h1>
          <p className="text-muted-foreground">Quick access to your saved notes</p>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl mb-2">Bookmarked Notes</h1>
          <p className="text-muted-foreground">Quick access to your saved notes</p>
        </div>

        {bookmarkedNotes.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <BookmarkIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="mb-2">No bookmarks yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start bookmarking notes to save them for quick access
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarkedNotes.map((note) => (
              <Card key={note.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="mt-1">{getFileIcon(note.fileType)}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="mb-1 truncate">{note.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {note.subject} ({note.subjectCode})
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleBookmark(note.id)}
                      className="text-primary transition-colors"
                    >
                      <BookmarkCheck className="w-5 h-5 fill-primary" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {note.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{note.regulation}</Badge>
                    <Badge variant="secondary">Year {note.year}</Badge>
                    <Badge variant="outline">{note.fileType.toUpperCase()}</Badge>
                  </div>
                </CardContent>
                <CardFooter className="pt-3 border-t flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    By {note.uploadedBy}
                  </p>
                  <div className="flex gap-2">
                    
                    <Button
                      size="sm"
                      onClick={() => onViewNote(note)}
                    >
                      View
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}