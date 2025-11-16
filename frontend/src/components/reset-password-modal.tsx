import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { PasswordInput } from './ui/password-input';
import { Button } from './ui/button';
import { Shield, Lock, Key } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onReset: (email: string) => void;
}

export function ResetPasswordModal({ open, onClose, onReset }: ResetPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [securityPass, setSecurityPass] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = enter email, 2 = security password, 3 = new password
  const [loading, setLoading] = useState(false);

  // Password requirements
  const passwordRequirements = {
    minLength: 8,
    hasUpperCase: /[A-Z]/.test(newPassword),
    hasLowerCase: /[a-z]/.test(newPassword),
    hasNumber: /\d/.test(newPassword),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
  };

  const isPasswordValid = 
    newPassword.length >= passwordRequirements.minLength &&
    passwordRequirements.hasUpperCase &&
    passwordRequirements.hasLowerCase &&
    passwordRequirements.hasNumber &&
    passwordRequirements.hasSpecialChar;

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.endsWith('@nandhaengg.org')) {
      toast.error('Please use your domain mail');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('https://nandhanotes.onrender.com/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.exists) {
        setStep(2);
      } else {
        toast.error('No account found with this email');
      }
    } catch (err) {
      toast.error('Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySecurityPass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityPass) {
      toast.error('Please enter your security password');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('https://nandhanotes.onrender.com/verify-security-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          securityPass 
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Security password verified successfully!');
        setStep(3);
      } else {
        toast.error(data.message || 'Invalid security password');
      }
    } catch (err) {
      toast.error('Error verifying security password.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      toast.error('Password does not meet requirements!');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('https://nandhanotes.onrender.com/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Password updated successfully!');
        setTimeout(() => {
          resetForm();
          onClose();
          onReset(email);
        }, 1000);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Error updating password.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setSecurityPass('');
    setNewPassword('');
    setConfirmPassword('');
    setStep(1);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      <Toaster position="top-center" />
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
              {step === 1 && <Shield className="w-6 h-6 text-primary" />}
              {step === 2 && <Key className="w-6 h-6 text-primary" />}
              {step === 3 && <Lock className="w-6 h-6 text-primary" />}
            </div>
            <DialogTitle>
              {step === 1 && 'Reset Password'}
              {step === 2 && 'Verify Security Password'}
              {step === 3 && 'Set New Password'}
            </DialogTitle>
            <DialogDescription>
              {step === 1 &&
                "Enter your college email address to proceed with password reset."}
              {step === 2 && 'Enter your security password to verify your identity.'}
              {step === 3 && 'Enter your new password to complete reset.'}
            </DialogDescription>
          </DialogHeader>

          {/* Step 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleVerifyEmail}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">College Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="regno@nandhaengg.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-input-background"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Checking...' : 'Continue'}
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* Step 2: Security Password */}
          {step === 2 && (
            <form onSubmit={handleVerifySecurityPass}>
              <div className="space-y-4 py-4">
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 font-medium mb-2">
                      Enter the security password that was generated during your signup.
                    </p>
                    <Input
                      type="text"
                      placeholder="Enter your security password"
                      value={securityPass}
                      onChange={(e) => setSecurityPass(e.target.value)}
                      required
                      className="bg-input-background font-mono"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify Security Password'}
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleUpdatePassword}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <PasswordInput
                    id="new-password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="bg-input-background"
                  />
                  {/* Password Requirements */}
                  {newPassword && (
                    <div className="text-xs space-y-1 mt-2">
                      <div className={`flex items-center gap-1 ${newPassword.length >= 8 ? 'text-green-600' : 'text-red-600'}`}>
                        <span>•</span>
                        <span>At least 8 characters</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordRequirements.hasUpperCase ? 'text-green-600' : 'text-red-600'}`}>
                        <span>•</span>
                        <span>One uppercase letter</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordRequirements.hasLowerCase ? 'text-green-600' : 'text-red-600'}`}>
                        <span>•</span>
                        <span>One lowercase letter</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                        <span>•</span>
                        <span>One number</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordRequirements.hasSpecialChar ? 'text-green-600' : 'text-red-600'}`}>
                        <span>•</span>
                        <span>One special character</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <PasswordInput
                    id="confirm-password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-input-background"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button type="submit" disabled={loading || !isPasswordValid}>
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}