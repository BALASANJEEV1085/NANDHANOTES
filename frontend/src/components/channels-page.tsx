import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Users, ChevronRight, Crown } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

interface Channel {
  id: string;
  name: string;
  code: string;
  memberCount: number;
  noteCount: number;
  isAdmin: boolean;
  createdBy: string;
}

interface ChannelsPageProps {
  channels: Channel[];
  onViewChannel: (channelId: string) => void;
  onCreateChannel: () => void;
  onJoinChannel: () => void;
  refreshTrigger?: number;
}

export function ChannelsPage({ 
  channels, 
  onViewChannel, 
  onCreateChannel, 
  onJoinChannel,
  refreshTrigger
}: ChannelsPageProps) {

  // This will automatically refresh when refreshTrigger changes
  return (
    <>
      <Toaster position="top-center" />
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl mb-2">Channels</h1>
            <p className="text-muted-foreground">Private groups for sharing notes</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onJoinChannel} className="gap-2 cursor-pointer">
              Join Channel
            </Button>
            <Button onClick={onCreateChannel} className="gap-2 cursor-pointer">
              Create Channel
            </Button>
          </div>
        </div>

        {channels.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="mb-2">No channels yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create a channel or join an existing one to collaborate with others
                </p>
                <div className="flex justify-center gap-3">
                  
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels.map((channel) => (
              <Card key={channel.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="truncate">{channel.name}</h3>
                        {channel.isAdmin && (
                          <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {channel.isAdmin && (
                          <Badge variant="secondary" className="text-xs">Admin</Badge>
                        )}
                        <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {channel.code}
                        </code>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <div>
                      <p className="text-xs">Members</p>
                      <p className="text-lg text-foreground">{channel.memberCount}</p>
                    </div>
                    <div>
                      <p className="text-xs">Documents</p>
                      <p className="text-lg text-foreground">{channel.noteCount}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Created by {channel.createdBy}
                  </p>
                </CardContent>
                <CardFooter className="pt-3 border-t">
                  <Button
                    variant="ghost"
                    className="w-full justify-between"
                    onClick={() => onViewChannel(channel.id)}
                    
                  >
                    View Channel
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}