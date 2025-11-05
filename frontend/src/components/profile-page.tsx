import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { User, Mail, Award, Upload, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProfilePageProps {
  user: {
    username: string;
    email: string;
    credits: number;
    uploadCount: number;
  };
  onLogout: () => void;
}

export function ProfilePage({ user, onLogout }: ProfilePageProps) {
  const [userData, setUserData] = useState(user);
  const [loading, setLoading] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Fetch latest user data from server when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/user/${user.email}`);
        if (res.ok) {
          const latestUserData = await res.json();
          setUserData(latestUserData);
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user.email]);

  // Refresh user data when props change
  useEffect(() => {
    setUserData(user);
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-8">
          <p>Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader className="pb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                {getInitials(userData.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl mb-2">{userData.username}</h2>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{userData.email}</span>
                </div>
              </div>
            </div>
            {/* 👇 Simple logout button - loader is now handled in App.tsx */}
            <Button variant="destructive" onClick={onLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Credits</p>
                <p className="text-3xl">{userData.credits}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Earn credits by uploading quality notes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-accent/10 w-12 h-12 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Notes Uploaded</p>
                <p className="text-3xl">{userData.uploadCount}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Help fellow students by sharing more notes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Achievement Badges */}
      <Card>
        <CardHeader>
          <h3>Achievements</h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {userData.uploadCount >= 1 && (
              <Badge variant="secondary" className="px-3 py-1.5 gap-2">
                <Award className="w-4 h-4" />
                First Upload
              </Badge>
            )}
            {userData.uploadCount >= 5 && (
              <Badge variant="secondary" className="px-3 py-1.5 gap-2">
                <Award className="w-4 h-4" />
                Contributor
              </Badge>
            )}
            {userData.uploadCount >= 10 && (
              <Badge variant="secondary" className="px-3 py-1.5 gap-2">
                <Award className="w-4 h-4" />
                Active Sharer
              </Badge>
            )}
            {userData.credits >= 50 && (
              <Badge variant="secondary" className="px-3 py-1.5 gap-2">
                <Award className="w-4 h-4" />
                50 Credits
              </Badge>
            )}
            {userData.uploadCount === 0 && (
              <p className="text-sm text-muted-foreground">
                Upload notes to earn achievement badges!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}