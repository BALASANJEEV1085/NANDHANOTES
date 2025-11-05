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
import { Mail } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export function ResetPasswordModal({ open, onClose }: ResetPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = enter email, 2 = verify code, 3 = new password
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

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.endsWith('@nandhaengg.org')) {
      toast.error('Please use your domain mail');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Reset code sent to your email!');
        setStep(2);
      } else toast.error(data.message);
    } catch (err) {
      toast.error('Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/verify-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: resetCode }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Code verified successfully!');
        setStep(3);
      } else toast.error(data.message);
    } catch (err) {
      toast.error('Error verifying code.');
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
      const res = await fetch('http://localhost:5000/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Password updated successfully!');
        setTimeout(() => {
          setStep(1);
          onClose();
        }, 1000);
      } else toast.error(data.message);
    } catch (err) {
      toast.error('Error updating password.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setResetCode('');
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
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle>
              {step === 1 && 'Reset Password'}
              {step === 2 && 'Verify Reset Code'}
              {step === 3 && 'Set New Password'}
            </DialogTitle>
            <DialogDescription>
              {step === 1 &&
                "Enter your college email address and we'll send you instructions to reset your password."}
              {step === 2 && 'Enter the reset code you received in your email.'}
              {step === 3 && 'Enter your new password to complete reset.'}
            </DialogDescription>
          </DialogHeader>

          {/* Step 1: Request Code */}
          {step === 1 && (
            <form onSubmit={handleRequestCode}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">College Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="yourname@nandhaengg.org"
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
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* Step 2: Verify Code */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-code">Reset Code</Label>
                  <Input
                    id="reset-code"
                    type="text"
                    placeholder="Enter the 6-digit code"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
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
                  {loading ? 'Verifying...' : 'Verify Code'}
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
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
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