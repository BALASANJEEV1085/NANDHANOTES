import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { UserPlus } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

interface JoinChannelModalProps {
  open: boolean;
  onClose: () => void;
  onJoin: (code: string) => void;
  currentUser?: {
    email: string;
    username: string;
  };
}

export function JoinChannelModal({ open, onClose, onJoin, currentUser }: JoinChannelModalProps) {
  const [channelCode, setChannelCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (channelCode.length !== 10) {
      toast.error('Channel code must be exactly 10 characters');
      return;
    }

    // Check if user is logged in
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser && !currentUser) {
      toast.error('Please log in first to join channels');
      return;
    }

    // Get user email from props or localStorage
    let userEmail = currentUser?.email;
    if (!userEmail && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        userEmail = userData.email;
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }

    if (!userEmail) {
      toast.error('User not found. Please log in again.');
      return;
    }

    setLoading(true);
    
    try {
      const res = await fetch('http://localhost:5000/join-channel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: channelCode,
          userEmail: userEmail
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Successfully joined channel: ${data.channel.name}`);
        onJoin(channelCode); // This will trigger refresh in parent
        setChannelCode('');
        onClose();
      } else {
        toast.error(data.message || 'Failed to join channel');
      }
    } catch (err) {
      console.error('Join channel error:', err);
      toast.error('Error joining channel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setChannelCode('');
    onClose();
  };

  // Allow both uppercase and lowercase, but only letters and numbers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow both uppercase and lowercase, remove any non-alphanumeric characters
    const filteredValue = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
    setChannelCode(filteredValue);
  };

  return (
    <>
      <Toaster position="top-center" />
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle>Join Channel</DialogTitle>
            <DialogDescription>
              Enter the 10-character code provided by the channel admin to join their channel.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="channel-code">Channel Code</Label>
                <Input
                  id="channel-code"
                  type="text"
                  placeholder="Enter 10-character code"
                  value={channelCode}
                  onChange={handleInputChange}
                  required
                  maxLength={10}
                  className="bg-input-background tracking-widest text-center text-lg font-mono"
                  disabled={loading}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    {channelCode.length}/10 characters
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Letters and numbers only
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || channelCode.length !== 10}
              >
                {loading ? 'Joining...' : 'Join Channel'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}