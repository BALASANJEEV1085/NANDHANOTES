import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { PasswordInput } from './ui/password-input';
import logo from '../assests/logonandhanotes.png';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { BookOpen, Check, X, Shield, ArrowLeft, AlertCircle, ChevronDown, Download } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface SignupPageProps {
  onSignup: () => void;
  onNavigateToLogin: () => void;
}

export function SignupPage({ onSignup, onNavigateToLogin }: SignupPageProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSecurityPassModal, setShowSecurityPassModal] = useState(false);
  const [securityPass, setSecurityPass] = useState('');
  const [hasDownloaded, setHasDownloaded] = useState(false);

  // Password requirements
  const passwordRequirements = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordValid = 
    passwordRequirements.minLength &&
    passwordRequirements.hasUpperCase &&
    passwordRequirements.hasLowerCase &&
    passwordRequirements.hasNumber &&
    passwordRequirements.hasSpecialChar;

  // Validate email format and restrictions
  const isValidEmail = (email: string): boolean => {
    if (!email.endsWith('@nandhaengg.org')) {
      return false;
    }
    
    const usernamePart = email.split('@')[0];
    return usernamePart.length === 7 && /^[a-zA-Z0-9]+$/.test(usernamePart);
  };

  // Handle email input with restrictions
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    setEmail(value);
  };

  // Generate security password
  const generateSecurityPass = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Handle Initial Signup Form
  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!username || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!isPasswordValid) {
      toast.error('Password does not meet requirements!');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (!isValidEmail(email)) {
      toast.error('Invalid email format. Must be: 7-character registration number + @nandhaengg.org');
      return;
    }

    // Check if user already exists
    try {
      setLoading(true);
      const checkRes = await fetch('https://nandhanotes.onrender.com/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (!checkRes.ok) {
        throw new Error('Failed to check email');
      }
      
      const checkData = await checkRes.json();
      
      if (checkData.exists) {
        toast.error('Email already registered. Please use a different email or login.');
        setLoading(false);
        return;
      }

      // Generate and show security password
      const generatedPass = generateSecurityPass();
      setSecurityPass(generatedPass);
      setShowSecurityPassModal(true);
    } catch (err) {
      console.error('Error checking email:', err);
      // If check fails, generate security password anyway
      const generatedPass = generateSecurityPass();
      setSecurityPass(generatedPass);
      setShowSecurityPassModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle Final Signup with Security Password
  const handleFinalSignup = async () => {
    if (!hasDownloaded) {
      toast.error('Please download your security password first');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('https://nandhanotes.onrender.com/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          email, 
          password, 
          securityPass
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success('Account created successfully!');
        // Wait briefly so toast shows before redirecting to login
        setTimeout(() => {
          setShowSecurityPassModal(false);
          onNavigateToLogin();
        }, 2000);
      } else {
        toast.error(data.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Download security password as text file
  const downloadSecurityPass = () => {
    const content = `Nandha Notes - Security Credentials

IMPORTANT: Keep this information secure and confidential!

Email: ${email}
Security Password: ${securityPass}

This security password is required for password recovery. 
Store this file in a secure location and do not share it with anyone.

Generated on: ${new Date().toLocaleString()}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nandha-notes-security-${email}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setHasDownloaded(true);
    toast.success('Security password downloaded successfully');
  };

  // Password requirement component with animations
  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <motion.div
      className={`flex items-center gap-2 transition-colors duration-300 ${
        met ? 'text-green-600' : 'text-red-600'
      }`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 15,
          delay: 0.1 
        }}
      >
        {met ? (
          <Check className="w-4 h-4" />
        ) : (
          <X className="w-4 h-4" />
        )}
      </motion.div>
      <span className="text-sm">{text}</span>
    </motion.div>
  );

  // Progress bar component
  const PasswordStrength = () => {
    const requirements = Object.values(passwordRequirements);
    const metCount = requirements.filter(Boolean).length;
    const totalCount = requirements.length;
    const percentage = (metCount / totalCount) * 100;

    let strengthColor = 'bg-red-500';
    let strengthText = 'Weak';
    
    if (percentage >= 80) {
      strengthColor = 'bg-green-500';
      strengthText = 'Strong';
    } else if (percentage >= 60) {
      strengthColor = 'bg-yellow-500';
      strengthText = 'Good';
    } else if (percentage >= 40) {
      strengthColor = 'bg-orange-500';
      strengthText = 'Fair';
    }

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-600">Password Strength</span>
          <span className={`text-xs font-medium ${
            percentage >= 80 ? 'text-green-600' : 
            percentage >= 60 ? 'text-yellow-600' : 
            percentage >= 40 ? 'text-orange-600' : 'text-red-600'
          }`}>
            {strengthText}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full ${strengthColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
    );
  };

  const handleCloseSecurityPassModal = () => {
    setShowSecurityPassModal(false);
    setHasDownloaded(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4 relative">
      <Toaster position="top-center" />

      {/* --- Main Signup Card --- */}
      <Card className="w-full max-w-md shadow-xl bg-card border border-border">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
            <img 
              src={logo}
              alt="Nandha Notes Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <CardTitle className="text-3xl text-card-foreground">Join Nandha Notes</CardTitle>
          <CardDescription>
            Create your account to start sharing and accessing notes
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleInitialSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                className="bg-background text-foreground border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">College Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="regno@nandhaengg.org"
                value={email}
                onChange={handleEmailChange}
                required
                disabled={loading}
                className={`bg-background text-foreground border-border ${
                  email && !isValidEmail(email) ? 'border-red-500' : ''
                }`}
              />
              
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <PasswordInput
                id="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-background text-foreground border-border"
              />
              
              {/* Password Requirements with Animations */}
              <AnimatePresence>
                {password && (
                  <motion.div
                    className="space-y-2 mt-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Password Strength Bar */}
                    <PasswordStrength />
                    
                    {/* Requirements List */}
                    <motion.div 
                      className="space-y-2 mt-3"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.1
                          }
                        }
                      }}
                    >
                      <PasswordRequirement
                        met={passwordRequirements.minLength}
                        text="At least 8 characters"
                      />
                      <PasswordRequirement
                        met={passwordRequirements.hasUpperCase}
                        text="One uppercase letter (A-Z)"
                      />
                      <PasswordRequirement
                        met={passwordRequirements.hasLowerCase}
                        text="One lowercase letter (a-z)"
                      />
                      <PasswordRequirement
                        met={passwordRequirements.hasNumber}
                        text="One number (0-9)"
                      />
                      <PasswordRequirement
                        met={passwordRequirements.hasSpecialChar}
                        text="One special character (!@#$%^&*)"
                      />
                    </motion.div>

                    {/* All Requirements Met Celebration */}
                    <AnimatePresence>
                      {isPasswordValid && (
                        <motion.div
                          className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg mt-2"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ 
                              type: "spring", 
                              stiffness: 200, 
                              delay: 0.2 
                            }}
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </motion.div>
                          <span className="text-sm font-medium text-green-700">
                            All requirements met! Password is strong.
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-background text-foreground border-border"
              />
              
              {/* Password Match Indicator */}
              <AnimatePresence>
                {password && confirmPassword && (
                  <motion.div
                    className="flex items-center gap-2 mt-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {password === confirmPassword ? (
                      <>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          <Check className="w-4 h-4 text-green-600" />
                        </motion.div>
                        <span className="text-sm text-green-600 font-medium">
                          Passwords match
                        </span>
                      </>
                    ) : (
                      <>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </motion.div>
                        <span className="text-sm text-red-600 font-medium">
                          Passwords do not match
                        </span>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 mt-4">
            <Button 
              type="submit" 
              className="w-full cursor-pointer" 
              disabled={loading || !isPasswordValid || password !== confirmPassword || !username || !email || !isValidEmail(email)}
            >
              {loading ? (
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Checking...
                </motion.div>
              ) : (
                'Create Account'
              )}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-primary hover:underline cursor-pointer"
                disabled={loading}
              >
                Sign in
              </button>
            </p>
          </CardFooter>
        </form>
      </Card>

      {/* --- Security Password Modal --- */}
      <Dialog open={showSecurityPassModal} onOpenChange={handleCloseSecurityPassModal}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-card-foreground text-center">Your Security Password</DialogTitle>
            <DialogDescription className="text-center">
              Save this security password for account recovery
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Important Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-amber-800 font-medium">
                    IMPORTANT: Download and save this security password. You will need it for password recovery.
                  </p>
                </div>
              </div>
            </div>

            {/* Security Password Display */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-card-foreground">
                Your Security Password
              </Label>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="font-mono text-lg text-center font-bold text-primary break-all">
                  {securityPass}
                </div>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                This unique security password is generated for your account
              </div>
            </div>

            {/* Download Button */}
            <Button
              onClick={downloadSecurityPass}
              className="w-full gap-2"
              variant="outline"
            >
              <Download className="w-4 h-4" />
              Download Security Password
            </Button>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCloseSecurityPassModal}
              disabled={loading}
              className="border-border text-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleFinalSignup}
              disabled={loading || !hasDownloaded}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  Creating Account...
                </div>
              ) : (
                'Confirm & Create Account'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}