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
import { BookOpen, Check, X, Shield, ArrowLeft, AlertCircle, ChevronDown } from 'lucide-react';
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
  const [securityQuestion1, setSecurityQuestion1] = useState('What is your favorite animal?');
  const [securityAnswer1, setSecurityAnswer1] = useState('');
  const [securityQuestion2, setSecurityQuestion2] = useState("What is your pet's name?");
  const [securityAnswer2, setSecurityAnswer2] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSecurityQuestions, setShowSecurityQuestions] = useState(false);

  // Security questions options
  const securityQuestions = [
    'What is your favorite animal?',
    "What is your pet's name?",
    'What city were you born in?',
    'What is your mother\'s maiden name?',
    'What was your first school name?',
    'What is your favorite movie?'
  ];

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

  // --- Handle Initial Signup Form ---
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

    if (!email.endsWith('@nandhaengg.org')) {
      toast.error('Please use your domain mail (@nandhaengg.org)');
      return;
    }

    // Check if user already exists
    try {
      setLoading(true);
      const checkRes = await fetch('http://localhost:5000/check-email', {
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

      // Show security questions modal if email is available
      setShowSecurityQuestions(true);
    } catch (err) {
      console.error('Error checking email:', err);
      // If check fails, proceed to security questions anyway and let the signup endpoint handle duplication
      setShowSecurityQuestions(true);
    } finally {
      setLoading(false);
    }
  };

  // --- Handle Final Signup with Security Questions ---
  const handleFinalSignup = async () => {
    if (!securityAnswer1.trim() || !securityAnswer2.trim()) {
      toast.error('Please answer both security questions');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          email, 
          password, 
          securityQuestion1, 
          securityAnswer1: securityAnswer1.trim(),
          securityQuestion2,
          securityAnswer2: securityAnswer2.trim()
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success('🎉 Account created successfully! Remember your security answers for password recovery.');
        // Wait briefly so toast shows before redirecting to login
        setTimeout(() => {
          setShowSecurityQuestions(false);
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

  const handleCloseSecurityQuestions = () => {
    setShowSecurityQuestions(false);
  };

  // Custom Select Component for Security Questions with Theme Colors
  const CustomSelect = ({ 
    value, 
    onChange, 
    options, 
    disabled 
  }: { 
    value: string; 
    onChange: (value: string) => void; 
    options: string[]; 
    disabled: boolean;
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="relative">
        <button
          type="button"
          className={`w-full p-3 border border-gray-300 rounded-lg text-left flex items-center justify-between transition-all duration-200 ${
            disabled ? 'bg-gray-100 cursor-not-allowed opacity-60 text-gray-500' : 'hover:border-primary/60 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground'
          } ${isOpen ? 'border-primary ring-2 ring-primary/20' : ''}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <span className="font-medium">{value}</span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="absolute z-50 w-full mt-1 border border-primary/20 rounded-lg shadow-lg max-h-60 overflow-y-auto bg-card text-card-foreground"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              {options.map((question, index) => (
                <button
                  key={index}
                  type="button"
                  className={`w-full p-3 text-left transition-colors duration-150 ${
                    value === question 
                      ? 'bg-primary text-primary-foreground font-medium' 
                      : 'hover:bg-accent hover:text-accent-foreground'
                  } ${index !== options.length - 1 ? 'border-b border-border' : ''}`}
                  onClick={() => {
                    onChange(question);
                    setIsOpen(false);
                  }}
                >
                  {question}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4 relative">
      <Toaster position="top-center" />

      {/* Back Button */}
      

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
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-background text-foreground border-border"
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
              disabled={loading || !isPasswordValid || password !== confirmPassword || !username || !email}
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

      {/* --- Security Questions Modal (Updated for Better Visibility) --- */}
      <Dialog open={showSecurityQuestions} onOpenChange={handleCloseSecurityQuestions}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-card-foreground">Security Questions</DialogTitle>
            <DialogDescription>
              Set up security questions for password recovery
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => { e.preventDefault(); handleFinalSignup(); }}>
            <div className="space-y-4 py-4">
              {/* Important Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-amber-800 font-medium">
                      Remember your answers! You'll need them to reset your password.
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Question 1 */}
              <div className="space-y-2">
                <Label htmlFor="security-question-1" className="text-sm font-medium text-card-foreground">
                  Question 1
                </Label>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                  <CustomSelect
                    value={securityQuestion1}
                    onChange={setSecurityQuestion1}
                    options={securityQuestions}
                    disabled={loading}
                  />
                </div>
                <Input
                  type="text"
                  placeholder="Your answer"
                  value={securityAnswer1}
                  onChange={(e) => setSecurityAnswer1(e.target.value)}
                  required
                  className="bg-background text-foreground border-border mt-2"
                  disabled={loading}
                />
              </div>

              {/* Security Question 2 */}
              <div className="space-y-2">
                <Label htmlFor="security-question-2" className="text-sm font-medium text-card-foreground">
                  Question 2
                </Label>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                  <CustomSelect
                    value={securityQuestion2}
                    onChange={setSecurityQuestion2}
                    options={securityQuestions}
                    disabled={loading}
                  />
                </div>
                <Input
                  type="text"
                  placeholder="Your answer"
                  value={securityAnswer2}
                  onChange={(e) => setSecurityAnswer2(e.target.value)}
                  required
                  className="bg-background text-foreground border-border mt-2"
                  disabled={loading}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCloseSecurityQuestions}
                disabled={loading}
                className="border-border text-foreground hover:bg-accent"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !securityAnswer1.trim() || !securityAnswer2.trim()}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    Creating...
                  </div>
                ) : (
                  'Complete Signup'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}