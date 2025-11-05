import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Settings, Moon, Sun, Bell, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  userEmail?: string;
}

export function SettingsModal({ open, onClose, isDarkMode, onToggleTheme, userEmail }: SettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your Nandha Notes experience
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Theme Settings */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                {isDarkMode ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
                Dark Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Toggle between light and dark theme
              </p>
            </div>
            <Switch
              checked={isDarkMode}
              onCheckedChange={onToggleTheme}
            />
          </div>

          {/* Email Notifications Info */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <Label className="text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Email Notifications
              </Label>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                You will receive email notifications when notes are uploaded to your channels. 
                This helps you stay updated with new study materials.
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-500 mt-2">
                🔔 Notifications are automatically sent to all channel members
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}