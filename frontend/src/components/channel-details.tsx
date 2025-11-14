import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { Copy, Crown, UserMinus, FileText, Image, FileDown, Users, File } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface ChannelMember {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
}

interface ChannelNote {
  id: string;
  title: string;
  fileType: 'pdf' | 'image' | 'ppt';
  uploadedBy: string;
  uploadDate: string;
  fileUrl: string;
}

interface ChannelDetailsProps {
  channel: {
    id: string;
    name: string;
    code: string;
    createdBy: string;
  };
  members: ChannelMember[];
  notes: ChannelNote[];
  currentUserId: string;
  onKickUser: (userId: string) => void;
  onDownloadNote: (noteId: string) => void;
  onViewNote: (note: ChannelNote) => void;
  refreshTrigger?: number;
  currentUserEmail?: string;
}

export function ChannelDetails({ 
  channel, 
  members, 
  notes, 
  currentUserId,
  onKickUser,
  onDownloadNote,
  onViewNote,
  refreshTrigger,
  currentUserEmail
}: ChannelDetailsProps) {
  const [channelData, setChannelData] = useState<any>(null);
  const [channelMembers, setChannelMembers] = useState<ChannelMember[]>(members);
  const [channelNotes, setChannelNotes] = useState<ChannelNote[]>(notes);
  const [userToRemove, setUserToRemove] = useState<{id: string, username: string} | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Admin detection
  const isAdmin = channelMembers.some(member => 
    (member.id === currentUserId || member.email === currentUserEmail) && member.isAdmin
  ) || channel.createdBy === currentUserEmail;

  // Fetch real channel data from API
  useEffect(() => {
    const fetchChannelDetails = async () => {
      try {
        const res = await fetch(`https://nandhanotes.onrender.com/channel/${channel.id}`);
        if (res.ok) {
          const data = await res.json();
          setChannelData(data.channel);
          setChannelMembers(data.members);
          setChannelNotes(data.notes);
        }
      } catch (err) {
        console.error('Error fetching channel details:', err);
      }
    };

    if (channel.id) {
      fetchChannelDetails();
    }
  }, [channel.id, refreshTrigger]);

  const copyChannelCode = () => {
    navigator.clipboard.writeText(channel.code);
    toast.success('Channel code copied to clipboard!');
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const showRemoveConfirmation = (userId: string, username: string) => {
    setUserToRemove({ id: userId, username });
  };

  const cancelRemove = () => {
    setUserToRemove(null);
  };

  const confirmRemove = async () => {
    if (!userToRemove) return;

    try {
      setIsRemoving(true);
      const res = await fetch('https://nandhanotes.onrender.com/remove-user-from-channel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelId: channel.id,
          userId: userToRemove.id,
          currentUserEmail: currentUserEmail || channelMembers.find(m => m.id === currentUserId)?.email
        }),
      });

      if (res.ok) {
        setChannelMembers(prev => prev.filter(member => member.id !== userToRemove.id));
        onKickUser(userToRemove.id);
        toast.success('User removed from channel');
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to remove user');
      }
    } catch (err) {
      console.error('Remove user error:', err);
      toast.error('Error removing user from channel');
    } finally {
      setIsRemoving(false);
      setUserToRemove(null);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      
      {/* Remove User Confirmation Dialog */}
      <Dialog open={!!userToRemove} onOpenChange={(isOpen) => !isOpen && cancelRemove()}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto bg-destructive/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
              <UserMinus className="w-6 h-6 text-destructive" />
            </div>
            <DialogTitle>Remove User</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <span className="font-medium text-foreground">{userToRemove?.username}</span> from this channel? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={cancelRemove}
              disabled={isRemoving}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={confirmRemove}
              disabled={isRemoving}
              className="cursor-pointer"
            >
              {isRemoving ? 'Removing...' : 'Remove User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        {/* Channel Header */}
        <div>
          <h1 className="text-3xl mb-2">{channel.name}</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
              <span className="text-sm text-muted-foreground">Channel Code:</span>
              <code className="text-sm tracking-wider" >{channel.code}</code>
              <button
                onClick={copyChannelCode}
                className="text-primary hover:text-primary/80 transition-colors cursor-pointer"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Created by {channel.createdBy}
            </p>
            {isAdmin && (
              <Badge variant="secondary" className="ml-2">
                You are an Admin
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Members List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <h3>Channel Members ({channelMembers.length})</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {channelMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(member.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate">{member.username}</p>
                        {member.isAdmin && (
                          <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                    </div>
                  </div>
                  {isAdmin && 
                   !member.isAdmin && 
                   member.id !== currentUserId && 
                   member.email !== currentUserEmail && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => showRemoveConfirmation(member.id, member.username)}
                      className="text-destructive hover:text-destructive flex-shrink-0 cursor-pointer"
                      title={`Remove ${member.username} from channel`}
                      disabled={isRemoving}
                    >
                      <UserMinus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Shared Documents */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <File className="w-5 h-5" />
                <h3>Shared Documents ({channelNotes.length})</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {channelNotes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No documents shared yet</p>
                  <p className="text-sm mt-2">Upload notes to this channel to share with members</p>
                </div>
              ) : (
                channelNotes.map((note) => (
                  <div key={note.id}>
                    <div className="flex items-center justify-between gap-4 py-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getFileIcon(note.fileType)}
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">{note.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded by {note.uploadedBy} • {note.uploadDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline">{note.fileType.toUpperCase()}</Badge>
                        <Button
                          size="sm"
                          onClick={() => onViewNote(note)}
                          className="gap-2 cursor-pointer"
                        >
                          View
                        </Button>
                      </div>
                    </div>
                    <Separator />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}