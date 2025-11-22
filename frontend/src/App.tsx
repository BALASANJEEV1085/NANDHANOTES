import { useState, useEffect } from 'react';
import { LoginPage } from './components/login-page';
import { SignupPage } from './components/signup-page';
import { ResetPasswordModal } from './components/reset-password-modal';
import { AppLayout } from './components/app-layout';
import { Dashboard } from './components/dashboard';
import { ChannelsPage } from './components/channels-page';
import { ChannelDetails } from './components/channel-details';
import { BookmarksPage } from './components/bookmarks-page';
import { ProfilePage } from './components/profile-page';
import { UploadNotesModal } from './components/upload-notes-modal';
import { CreateChannelModal } from './components/create-channel-modal';
import { JoinChannelModal } from './components/join-channel-modal';
import { SettingsModal } from './components/settings-modal';
import { NoteViewer } from './components/note-viewer';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import { LandingPage } from './components/landing-page';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'landing' | 'login' | 'signup' | 'app'>(() => {
    const savedScreen = localStorage.getItem('currentScreen');
    return (savedScreen as 'landing' | 'login' | 'signup' | 'app') || 'landing';
  });
  
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem('currentPage');
    return savedPage || 'home';
  });
  
  const [selectedChannel, setSelectedChannel] = useState<string | null>(() => {
    const savedChannel = localStorage.getItem('selectedChannel');
    return savedChannel || null;
  });

  const [selectedNote, setSelectedNote] = useState<any>(null);
  
  // Modal states
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showUploadNotes, setShowUploadNotes] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showJoinChannel, setShowJoinChannel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Theme state - Load from localStorage on initial render
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme === 'dark' || (!savedTheme && prefersDark);
  });

  // Real user data from server
  const [user, setUser] = useState<any>(null);

  // Real notes data from server
  const [notes, setNotes] = useState<any[]>([]);

  // Real channels data
  const [channels, setChannels] = useState<any[]>([]);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);

  // 👇 Add loggingOut state for full-page loader
  const [loggingOut, setLoggingOut] = useState(false);

  // 👇 Add refresh trigger for dashboard
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Save navigation state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('currentScreen', currentScreen);
  }, [currentScreen]);

  useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (selectedChannel) {
      localStorage.setItem('selectedChannel', selectedChannel);
    } else {
      localStorage.removeItem('selectedChannel');
    }
  }, [selectedChannel]);

  // Apply theme and save to localStorage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Handle theme toggle
  const handleToggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Fetch data when app loads
  useEffect(() => {
    if (currentScreen === 'app' && user) {
      fetchNotes();
      fetchUserChannels();
    }
  }, [currentScreen, user, refreshTrigger]); // Added refreshTrigger dependency

  // Fetch notes from server
  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('https://nandhanotes.onrender.com/get-notes');
      if (res.ok) {
        const serverNotes = await res.json();
        const transformedNotes = serverNotes.map((note: any) => ({
          id: note._id,
          title: note.topic || note.fileName,
          subject: note.subject,
          subjectCode: note.subjectCode,
          regulation: note.regulation,
          year: note.year,
          description: note.description,
          fileType: getFileTypeFromFileName(note.fileName),
          uploadedBy: note.uploadedBy,
          uploadDate: new Date(note.uploadedAt).toLocaleDateString(),
          isBookmarked: false,
          fileUrl: note.fileUrl
        }));
        setNotes(transformedNotes);
      } else {
        console.error('Failed to fetch notes');
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to determine file type from filename
  const getFileTypeFromFileName = (filename: string): string => {
    if (!filename) return 'pdf';
    const extension = filename.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'ppt':
      case 'pptx':
        return 'ppt';
      case 'doc':
      case 'docx':
        return 'doc';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'image';
      default:
        return 'pdf';
    }
  };

  // Fetch user channels from server
  const fetchUserChannels = async () => {
    if (!user?.email) return;
    
    try {
      const res = await fetch(`https://nandhanotes.onrender.com/user-channels/${user.email}`);
      if (res.ok) {
        const serverChannels = await res.json();
        setChannels(serverChannels);
      } else {
        console.error('Failed to fetch channels');
      }
    } catch (err) {
      console.error('Error fetching channels:', err);
    }
  };

  // Fetch user data from server
  const fetchUserData = async (email: string) => {
    try {
      const res = await fetch(`https://nandhanotes.onrender.com/user/${email}`);
      if (res.ok) {
        const userData = await res.json();
        return userData;
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
    return null;
  };

  // Fetch channel details
  const fetchChannelDetails = async (channelId: string) => {
    try {
      const res = await fetch(`https://nandhanotes.onrender.com/channel/${channelId}`);
      if (res.ok) {
        const channelData = await res.json();
        return channelData;
      }
    } catch (err) {
      console.error('Error fetching channel details:', err);
    }
    return null;
  };

  const handleLogin = async (userData: any) => {
    setUser(userData);
    setCurrentScreen('app');
    const latestUserData = await fetchUserData(userData.email);
    if (latestUserData) {
      setUser(latestUserData);
    }
  };

  const handleSignup = (username: string, email: string, password: string) => {
    toast.success('Account created successfully! Please sign in');
    setCurrentScreen('login');
  };

  const handleResetPassword = (email: string) => {
    toast.success('Password reset link sent to your email!');
    setShowResetPassword(false);
  };

  const handleUploadNotes = async (noteData: any) => {
    try {
      const formData = new FormData();
      formData.append('file', noteData.file);
      formData.append('regulation', noteData.regulation);
      formData.append('year', noteData.year);
      formData.append('topic', noteData.topic);
      formData.append('subject', noteData.subject);
      formData.append('subjectCode', noteData.subjectCode);
      formData.append('description', noteData.description);
      formData.append('channel', noteData.channel);
      formData.append('uploadedBy', user.email);

      const res = await fetch('https://nandhanotes.onrender.com/upload-note', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        
        const updatedUser = await fetchUserData(user.email);
        if (updatedUser) {
          setUser(updatedUser);
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }
        
        await fetchNotes();
        await fetchUserChannels(); // Refresh channels to update note counts
        
        // REMOVED: Success toast is now handled in UploadNotesModal only
        setShowUploadNotes(false);
        
        // 👇 Trigger dashboard refresh
        setRefreshTrigger(prev => prev + 1);
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to upload notes');
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Error uploading notes');
    }
  };

  // CREATE CHANNEL - FIXED
  const handleCreateChannel = async (name: string) => {
    try {
      const res = await fetch('https://nandhanotes.onrender.com/create-channel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          createdBy: user.email
        }),
      });

      if (res.ok) {
        const data = await res.json();
        await fetchUserChannels(); // Refresh channels list
        toast.success(`Channel created! Code: ${data.channel.code}`);
        setShowCreateChannel(false);
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to create channel');
      }
    } catch (err) {
      console.error('Create channel error:', err);
      toast.error('Error creating channel');
    }
  };

  // JOIN CHANNEL - FIXED
  const handleJoinChannel = async (code: string) => {
    try {
      const res = await fetch('https://nandhanotes.onrender.com/join-channel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          userEmail: user.email
        }),
      });

      if (res.ok) {
        const data = await res.json();
        await fetchUserChannels(); // Refresh channels list
        toast.success(`Joined channel: ${data.channel.name}`);
        setShowJoinChannel(false);
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to join channel');
      }
    } catch (err) {
      console.error('Join channel error:', err);
      toast.error('Error joining channel');
    }
  };

  // KICK USER - FIXED
  const handleKickUser = async (userId: string) => {
    try {
      const res = await fetch('https://nandhanotes.onrender.com/remove-user-from-channel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelId: selectedChannel,
          userId: userId,
          currentUserEmail: user.email
        }),
      });

      if (res.ok) {
        await fetchUserChannels(); // Refresh channels list
        toast.success('User removed from channel');
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to remove user');
      }
    } catch (err) {
      console.error('Remove user error:', err);
      toast.error('Error removing user from channel');
    }
  };

  const handleToggleBookmark = (noteId: string) => {
    setNotes(notes.map(note => 
      note.id === noteId 
        ? { ...note, isBookmarked: !note.isBookmarked }
        : note
    ));
    const note = notes.find(n => n.id === noteId);
    if (note) {
      toast.success(note.isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
    }
  };

  const handleDownloadNote = async (noteId: string) => {
    try {
      const note = notes.find(n => n.id === noteId);
      if (!note || !note.fileUrl) {
        toast.error('File not available for download');
        return;
      }

      // Try to determine filename and extension
      const url = note.fileUrl;
      // Attempt to extract filename from URL path
      const urlPathName = (() => {
        try {
          const u = new URL(url);
          return u.pathname;
        } catch {
          return url;
        }
      })();

      // Extract extension from URL (if any)
      const match = urlPathName.match(/\/?([^\/?#]+)(?:\?[^#]*)?(?:#.*)?$/);
      let inferredFilename = match ? match[1] : '';
      let ext = '';

      if (inferredFilename) {
        const dotIndex = inferredFilename.lastIndexOf('.');
        if (dotIndex !== -1) {
          ext = inferredFilename.slice(dotIndex + 1);
        }
      }

      // Fallbacks if extension not present
      if (!ext) {
        if (note.fileType === 'pdf') ext = 'pdf';
        else if (note.fileType === 'ppt') ext = 'pptx';
        else if (note.fileType === 'doc') ext = 'docx';
        else if (note.fileType === 'image') ext = 'jpg';
        else ext = 'bin';
        // rebuild inferredFilename if missing
        if (!inferredFilename) inferredFilename = `${note.title || 'download'}.${ext}`;
      }

      // Ensure filename is safe: prefer original file name if present, otherwise use sanitized title
      const safeTitle = (note.title || 'file').replace(/[\\/:"*?<>|]+/g, '_'); // remove illegal chars
      const filename = inferredFilename || `${safeTitle}.${ext}`;

      // Fetch file as blob (this requires server to allow CORS)
      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) {
        // If remote resource denies direct fetch (CORS or 403), tell user / fallback
        console.error('Download fetch failed:', response.status, response.statusText);
        toast.error('Failed to fetch file for download. If this persists, the server may block direct downloads (CORS).');
        return;
      }

      const blob = await response.blob();

      // Create object URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      // for Firefox, the link needs to be in the DOM
      document.body.appendChild(a);
      a.click();
      a.remove();
      // release memory after short delay
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);

      toast.success('Download started');
    } catch (err) {
      console.error('Error downloading file:', err);
      toast.error('Error downloading file');
    }
  };

  // 👇 Updated handleLogout with full-page loader
  const handleLogout = () => {
    setLoggingOut(true);
    
    // Show loader for 1.5 seconds before completing logout
    setTimeout(() => {
      // Switch to landing page instead of login
      setCurrentScreen('landing');
      setUser(null);

      setNotes([]);
      setChannels([]);
      setSelectedChannel(null);
      setSelectedNote(null);

      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentScreen');
      localStorage.removeItem('currentPage');
      localStorage.removeItem('selectedChannel');

      setLoggingOut(false);
      toast.info('Logged out successfully');
    }, 1500);
  };

  const handleNavigate = (page: string) => {
    console.log('Navigating to:', page);
    setCurrentPage(page);
    setSelectedChannel(null);
    setSelectedNote(null);
  };

  // Handle navigation from landing page
  const handleNavigateFromLanding = () => {
    if (user) {
      setCurrentScreen('app');
    } else {
      setCurrentScreen('login');
    }
  };

  // Handle navigation back to landing page
  const handleNavigateToLanding = () => {
    setCurrentScreen('landing');
  };

  // Check if user is logged in on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      // If user is logged in, go directly to app, otherwise stay on landing
      setCurrentScreen('app');
    }
  }, []);

  const bookmarkedNotes = notes.filter(note => note.isBookmarked);

  // Get channel data for selected channel
  const getSelectedChannelData = () => {
    if (!selectedChannel) return null;
    
    const channel = channels.find(ch => ch.id === selectedChannel);
    if (!channel) return null;

    // Get channel notes (filter notes by channel)
    const channelNotes = notes.filter(note => {
      // This would need to be updated based on how notes are associated with channels
      // For now, return all notes uploaded by current user
      return note.uploadedBy === user?.email;
    });

    // Get channel members (this would come from the channel details API)
    const members = [
      { id: user.id, username: user.username, email: user.email, isAdmin: true },
      // Add other members here - in real implementation, this would come from API
    ];

    return {
      channel,
      members,
      notes: channelNotes
    };
  };

  const selectedChannelData = getSelectedChannelData();

  // 👇 Full-page logout loader (placed before auth screens)
  if (loggingOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-primary/20 rounded-full"></div>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Logging out</h2>
            <p className="text-muted-foreground">Please wait while we securely log you out...</p>
          </div>
        </div>
        <Toaster />
      </div>
    );
  }

  // Landing Page
  if (currentScreen === 'landing') {
    return (
      <>
        <LandingPage 
          onNavigateToApp={handleNavigateFromLanding}
          onNavigateToSignup={() => setCurrentScreen('signup')}
          onNavigateToLogin={() => setCurrentScreen('login')}
          currentUser={user}
        />
        <Toaster />
      </>
    );
  }

  // Auth screens
  if (currentScreen === 'login') {
    return (
      <>
        <LoginPage
          onLogin={handleLogin}
          onNavigateToSignup={() => setCurrentScreen('signup')}
          onForgotPassword={() => setShowResetPassword(true)}
          onNavigateToLanding={handleNavigateToLanding}
        />
        <ResetPasswordModal
          open={showResetPassword}
          onClose={() => setShowResetPassword(false)}
          onReset={handleResetPassword}
        />
        <Toaster />
      </>
    );
  }

  if (currentScreen === 'signup') {
    return (
      <>
        <SignupPage
          onSignup={handleSignup}
          onNavigateToLogin={() => setCurrentScreen('login')}
        />
        <Toaster />
      </>
    );
  }

  // 👇 Only show loading if we are in the 'app' screen and user is missing
  if (!user && currentScreen === 'app') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Loading...</p>
        </div>
        <Toaster />
      </div>
    );
  }
  

  // Main app
  return (
    <>
      <AppLayout
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onUploadClick={() => setShowUploadNotes(true)}
        onSettingsClick={() => setShowSettings(true)}
        user={user}
      >
        {currentPage === 'home' && (
          <Dashboard
            onViewNote={(note) => setSelectedNote(note)}
            onToggleBookmark={handleToggleBookmark}
            refreshTrigger={refreshTrigger} // 👈 Pass refreshTrigger to Dashboard
          />
        )}

        {currentPage === 'channels' && !selectedChannel && (
          <ChannelsPage
            channels={channels}
            onViewChannel={(channelId) => setSelectedChannel(channelId)}
            onCreateChannel={() => setShowCreateChannel(true)}
            onJoinChannel={() => setShowJoinChannel(true)}
          />
        )}

        
        {currentPage === 'channels' && selectedChannel && selectedChannelData && (
          <div>
            <Button
              variant="ghost"
              onClick={() => setSelectedChannel(null)}
              className="mb-4"
            >
              ← Back to Channels
            </Button>
            <ChannelDetails
              channel={selectedChannelData.channel}
              members={selectedChannelData.members}
              notes={selectedChannelData.notes}
              currentUserId={user.id}
              currentUserEmail={user.email} // Add this line
              onKickUser={handleKickUser}
              onDownloadNote={handleDownloadNote}
              onViewNote={(note) => setSelectedNote(note)}
            />
          </div>
        )}

        {currentPage === 'bookmarks' && (
          <BookmarksPage
            bookmarkedNotes={bookmarkedNotes}
            onViewNote={(note) => setSelectedNote(note)}
            onToggleBookmark={handleToggleBookmark}
            onDownloadNote={handleDownloadNote}
          />
        )}

        {currentPage === 'profile' && (
          <ProfilePage
            user={user}
            onLogout={handleLogout}
          />
        )}
      </AppLayout>

      {/* Modals */}
      <UploadNotesModal
        open={showUploadNotes}
        onClose={() => setShowUploadNotes(false)}
        onUpload={handleUploadNotes}
        channels={channels}
        currentUser={user}
        onProfileUpdate={async () => {
          const updatedUser = await fetchUserData(user.email);
          if (updatedUser) {
            setUser(updatedUser);
          }
        }}
        onUploadSuccess={() => {
          // 👇 This will trigger dashboard refresh
          setRefreshTrigger(prev => prev + 1);
        }}
      />

      <CreateChannelModal
        open={showCreateChannel}
        onClose={() => setShowCreateChannel(false)}
        onCreate={handleCreateChannel}
      />

      <JoinChannelModal
        open={showJoinChannel}
        onClose={() => setShowJoinChannel(false)}
        onJoin={handleJoinChannel}
      />

      {/* Fixed SettingsModal - using userEmail prop instead of currentUser */}
      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        userEmail={user?.email}  // ✅ already present in your code
      />

      <NoteViewer
        note={selectedNote}
        onClose={() => setSelectedNote(null)}
        onDownloadNote={handleDownloadNote}
      />
      
    </>
  );
}

// Add toast function if not already present
const toast = {
  success: (message: string) => {
    // This would typically come from your toast library
    console.log('Success:', message);
  },
  error: (message: string) => {
    console.log('Error:', message);
  },
  info: (message: string) => {
    console.log('Info:', message);
  }
};