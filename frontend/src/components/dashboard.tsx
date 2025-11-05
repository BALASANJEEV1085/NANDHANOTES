import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Search, FileText, Image, FileDown, Bookmark, BookmarkCheck } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

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
  isBookmarked: boolean;
  fileUrl?: string;
}

interface DashboardProps {
  onViewNote: (note: Note) => void;
  onToggleBookmark: (noteId: string) => void;
  refreshTrigger?: number;
}

export function Dashboard({ onViewNote, onToggleBookmark, refreshTrigger }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [regulationFilter, setRegulationFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch notes from backend
  useEffect(() => {
    fetchNotes();
  }, [refreshTrigger]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/get-notes');
      if (res.ok) {
        const notesData = await res.json();
        
        // Get existing bookmarks from localStorage
        const savedBookmarks = JSON.parse(localStorage.getItem('bookmarkedNotes') || '[]');
        
        // Transform backend data to frontend format and merge with bookmarks
        const transformedNotes = notesData.map((note: any) => {
          const isBookmarked = savedBookmarks.includes(note._id);
          return {
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
            isBookmarked: isBookmarked,
            fileUrl: note.fileUrl
          };
        });
        setNotes(transformedNotes);
      } else {
        console.error('Failed to fetch notes');
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine file type from URL
  const getFileTypeFromUrl = (url: string): 'pdf' | 'image' | 'ppt' | 'doc' => {
    if (!url) return 'pdf';
    const urlLower = url.toLowerCase();
    
    // Check in correct order - most specific first
    if (urlLower.includes('.pdf')) return 'pdf';
    if (urlLower.includes('.ppt') || urlLower.includes('.pptx')) return 'ppt';
    if (urlLower.includes('.doc') || urlLower.includes('.docx')) return 'doc';
    if (urlLower.includes('.jpg') || urlLower.includes('.jpeg') || urlLower.includes('.png')) return 'image';
    
    return 'pdf'; // default
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
    const updatedNotes = notes.map(note => {
      if (note.id === noteId) {
        const newBookmarkState = !note.isBookmarked;
        const noteTitle = note.title;
        
        // Update localStorage
        const savedBookmarks = JSON.parse(localStorage.getItem('bookmarkedNotes') || '[]');
        let updatedBookmarks;
        
        if (newBookmarkState) {
          // Add to bookmarks
          updatedBookmarks = [...savedBookmarks, noteId];
          toast.success(`Bookmark added!`);
        } else {
          // Remove from bookmarks
          updatedBookmarks = savedBookmarks.filter((id: string) => id !== noteId);
          toast.success(`Bookmark removed!`);
        }
        
        localStorage.setItem('bookmarkedNotes', JSON.stringify(updatedBookmarks));
        
        return { ...note, isBookmarked: newBookmarkState };
      }
      return note;
    });
    
    setNotes(updatedNotes);
    onToggleBookmark(noteId);
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRegulation = regulationFilter === 'all' || note.regulation === regulationFilter;
    const matchesYear = yearFilter === 'all' || note.year === yearFilter;
    const matchesSubject = subjectFilter === 'all' || note.subject === subjectFilter;

    return matchesSearch && matchesRegulation && matchesYear && matchesSubject;
  });

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'image':
        return <Image className="w-5 h-5 text-blue-500" />;
      case 'ppt':
        return <FileDown className="w-5 h-5 text-orange-500" />;
      case 'doc':
        return <FileText className="w-5 h-5 text-blue-600" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const subjects = Array.from(new Set(notes.map(note => note.subject)));

  if (loading) {
    return (
      <div className="space-y-6 px-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl sm:text-3xl mb-2">Global Notes Library</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Browse and discover notes shared by students</p>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="space-y-6 px-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl sm:text-3xl mb-2">Global Notes Library</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Browse and discover notes shared by students</p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search notes by title, subject, code, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input-background w-full"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Select value={regulationFilter} onValueChange={setRegulationFilter}>
              <SelectTrigger className="bg-input-background w-full">
                <SelectValue placeholder="Regulation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regulations</SelectItem>
                <SelectItem value="R22">R22</SelectItem>
                <SelectItem value="R21">R21</SelectItem>
                <SelectItem value="R20">R20</SelectItem>
                <SelectItem value="R19">R19</SelectItem>
              </SelectContent>
            </Select>

            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="bg-input-background w-full">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="I">Year I</SelectItem>
                <SelectItem value="II">Year II</SelectItem>
                <SelectItem value="III">Year III</SelectItem>
                <SelectItem value="IV">Year IV</SelectItem>
              </SelectContent>
            </Select>

            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="bg-input-background w-full">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notes Grid - Improved Responsive Design */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="hover:shadow-lg transition-shadow duration-200 h-full flex flex-col min-h-[280px]">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div className="mt-1 flex-shrink-0">{getFileIcon(note.fileType)}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold mb-1 line-clamp-2 leading-tight">{note.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {note.subject}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {note.subjectCode}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleBookmark(note.id)}
                    className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0 ml-1"
                  >
                    {note.isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5 fill-primary text-primary" />
                    ) : (
                      <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
              </CardHeader>
              <CardContent className="pb-3 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 mb-3 leading-relaxed">
                  {note.description}
                </p>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  <Badge variant="secondary" className="text-xs px-2 py-0">{note.regulation}</Badge>
                  <Badge variant="secondary" className="text-xs px-2 py-0">Year {note.year}</Badge>
                  <Badge variant="outline" className="text-xs px-2 py-0">{note.fileType.toUpperCase()}</Badge>
                </div>
              </CardContent>
              <CardFooter className="pt-3 border-t flex justify-between items-center flex-shrink-0">
                <p className="text-xs text-muted-foreground truncate flex-1 mr-2">
                  By {note.uploadedBy}
                </p>
                <Button
                  size="sm"
                  onClick={() => onViewNote(note)}
                  className="text-xs sm:text-sm px-2 sm:px-3 flex-shrink-0"
                >
                  View
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredNotes.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-base sm:text-lg">No notes found matching your criteria</p>
            <p className="text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </>
  );
}