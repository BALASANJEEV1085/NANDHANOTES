import { useState } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Home, Users, BookmarkCheck, User, Settings, Upload, Menu, BookOpen, TextCursor } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onUploadClick: () => void;
  onSettingsClick: () => void;
  user: {
    username: string;
    email: string;
    credits: number;
    uploadCount: number;
  };
}

export function AppLayout({ 
  children, 
  currentPage, 
  onNavigate, 
  onUploadClick,
  onSettingsClick,
  user 
}: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home  },
    { id: 'channels', label: 'Channels', icon: Users },
    { id: 'bookmarks', label: 'Bookmarks', icon: BookmarkCheck },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="bg-primary w-10 h-10 rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg">Nandha Notes</h2>
            <p className="text-xs text-muted-foreground">Share & Learn</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 cursor-pointer"
          onClick={() => {
            onSettingsClick();
            setIsMobileMenuOpen(false);
          }}
        >
          <Settings className="w-5 h-5" />
          Settings
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 bottom-0 w-64 border-r bg-card">
        <NavContent />
      </aside>

      {/* Main Content */}
      <div className="md:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="flex items-center justify-between px-4 py-4 md:px-8">
            <div className="flex items-center gap-4">
              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden cursor-pointer">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <NavContent />
                </SheetContent>
              </Sheet>

              <div className="flex items-center gap-3 md:hidden">
                <div className="bg-primary w-8 h-8 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold">Nandha Notes</h2>
                  <p className="text-xs text-muted-foreground">Welcome, {user.username}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* User info in top bar */}
              
              
              <Button onClick={onUploadClick} className="gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload Notes</span>
                <span className="sm:hidden">Upload</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}