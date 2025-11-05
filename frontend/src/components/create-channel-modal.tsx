import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Users } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

interface CreateChannelModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<any>;
}

export function CreateChannelModal({ open, onClose, onCreate }: CreateChannelModalProps) {
  const [channelName, setChannelName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!channelName.trim()) {
      toast.error('Please enter a channel name');
      return;
    }

    setLoading(true);
    
    try {
      // Call the parent's onCreate function which now handles API call and refresh
      await onCreate(channelName.trim());
      setChannelName('');
      onClose();
    } catch (err) {
      console.error('Create channel error:', err);
      // Error is already handled in parent component
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setChannelName('');
    onClose();
  };

  return (
    <>
      <Toaster position="top-center" />
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle>Create Channel</DialogTitle>
            <DialogDescription>
              Create a private channel to share notes with specific students. You'll receive a unique code to share with others.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="channel-name">Channel Name</Label>
                <Input
                  id="channel-name"
                  type="text"
                  placeholder="e.g., CS Department - Year 3"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  required
                  className="bg-input-background"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Choose a descriptive name for your channel. You'll be the admin of this channel.
                </p>
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
                disabled={loading || !channelName.trim()}
              >
                {loading ? 'Creating...' : 'Create Channel'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}