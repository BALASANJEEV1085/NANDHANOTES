import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { PasswordInput } from './ui/password-input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { BookOpen, Check, X } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export function SignupPage({ onSignup, onNavigateToLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [loading, setLoading] = useState(false);

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

  // --- Handle Signup ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error('Password does not meet requirements!');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (!email.endsWith('@nandhaengg.org')) {
      toast.error('Please use your domain mail');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Verification code sent to your email!');
        setShowVerification(true);
      } else {
        toast.error(data.message || 'Signup failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  // --- Handle Verification ---
  const handleVerification = async () => {
    if (!verificationCode) {
      toast.error('Please enter the verification code.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Email verified successfully!');
        // wait briefly so toast shows before redirecting to login
        setTimeout(() => {
          setShowVerification(false);
          // Redirect to login page instead of calling onSignup
          onNavigateToLogin();
        }, 1500);
      } else {
        toast.error(data.message || 'Verification failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error verifying code.');
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4 relative">
      <Toaster position="top-center" />

      {/* --- Signup Card --- */}
      <Card className="w-full max-w-md shadow-xl bg-white border border-gray-200">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Join Nandha Notes</CardTitle>
          <CardDescription>
            Create your account to start sharing and accessing notes
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">College Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Your domain mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
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
              disabled={loading || !isPasswordValid || password !== confirmPassword}
            >
              {loading ? (
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Creating Account...
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
              >
                Sign in
              </button>
            </p>
          </CardFooter>
        </form>
      </Card>

      {/* --- OTP Verification Modal --- */}
      <AnimatePresence>
        {showVerification && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-md mx-4"
            >
              <Card className="w-full bg-card shadow-2xl border">
                <CardHeader className="space-y-3 text-center">
                  <div className="mx-auto bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center">
                    <BookOpen className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-semibold">
                    Verify Your Email
                  </CardTitle>
                  <CardDescription>
                    Enter the 6-digit code sent to your <br />
                    <span className="font-medium">{email}</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="verificationCode">Verification Code</Label>
                    <Input
                      id="verificationCode"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      maxLength={6}
                      className="text-center text-lg tracking-widest"
                    />
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3">
                  <Button
                    onClick={handleVerification}
                    className="w-full cursor-pointer"
                    disabled={loading}
                  >
                    {loading ? (
                      <motion.div
                        className="flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        Verifying...
                      </motion.div>
                    ) : (
                      'Verify Email'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowVerification(false)}
                    className="w-full cursor-pointer"
                  >
                    Cancel
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}