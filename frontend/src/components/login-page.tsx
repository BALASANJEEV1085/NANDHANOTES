import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { PasswordInput } from './ui/password-input';
import logo from '../assests/logonandhanotes.png';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { ArrowLeft } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

interface LoginPageProps {
  onLogin: (userData: any) => void;
  onNavigateToSignup: () => void;
  onForgotPassword: () => void;
  onNavigateToLanding: () => void;
}

export function LoginPage({
  onLogin,
  onNavigateToSignup,
  onForgotPassword,
  onNavigateToLanding,
}: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.endsWith('@nandhaengg.org')) {
      toast.error('Please use your domain mail');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(' Login successful!');
        setTimeout(() => {
          // Store user data in localStorage
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          onLogin(data.user);
        }, 1000);
      } else {
        toast.error(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Toaster position="top-center" />

      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={onNavigateToLanding}
        className="absolute top-4 left-4 gap-2 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Button>

      <Card className="w-full max-w-md shadow-xl bg-card border border-border">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
            <img 
              src={logo}
              alt="Nandha Notes Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <CardTitle className="text-3xl text-card-foreground">Welcome to Nandha Notes</CardTitle>
          <CardDescription>
            Sign in with your college email to access shared notes
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">College Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="regno@nandhaengg.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background text-foreground border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <PasswordInput
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background text-foreground border-border"
              />
            </div>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-primary hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onNavigateToSignup}
                className="text-primary hover:underline cursor-pointer"
              >
                Sign up
              </button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}