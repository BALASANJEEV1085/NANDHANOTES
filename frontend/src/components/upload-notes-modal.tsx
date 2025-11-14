import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Upload, File, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface UploadNotesModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (noteData: any) => void;
  channels: Array<{ id: string; name: string }>;
  currentUser: {
    email: string;
    username: string;
  };
  onProfileUpdate: () => void;
  onUploadSuccess?: () => void;
}

export function UploadNotesModal({ 
  open, 
  onClose, 
  onUpload, 
  channels, 
  currentUser,
  onProfileUpdate,
  onUploadSuccess
}: UploadNotesModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [regulation, setRegulation] = useState('');
  const [year, setYear] = useState('');
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [description, setDescription] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const allowedTypes = [
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/jpg',
        'image/png'
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Invalid file type. Please upload PDF, PPT, PPTX, DOC, DOCX, JPG, or PNG files.');
        e.target.value = '';
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size too large. Please upload files smaller than 10MB.');
        e.target.value = '';
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const allowedTypes = [
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/jpg',
        'image/png'
      ];
      if (!allowedTypes.includes(droppedFile.type)) {
        toast.error('Invalid file type. Please upload PDF, PPT, PPTX, DOC, DOCX, JPG, or PNG files.');
        return;
      }
      if (droppedFile.size > 10 * 1024 * 1024) {
        toast.error('File size too large. Please upload files smaller than 10MB.');
        return;
      }
      setFile(droppedFile);
      setFileName(droppedFile.name);
    }
  };

  const getFileType = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'ppt':
      case 'pptx':
        return 'ppt';
      case 'doc':
      case 'docx':
        return 'doc';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'image';
      default:
        return 'unknown';
    }
  };

  const getCreditsForFileType = (fileType: string): number => {
    switch (fileType) {
      case 'pdf':
        return 3;
      case 'ppt':
        return 2;
      case 'doc':
        return 2; // DOC files earn same as PPT
      case 'image':
        return 1;
      default:
        return 0;
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'doc':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'ppt':
        return <FileText className="w-5 h-5 text-orange-500" />;
      case 'image':
        return <FileText className="w-5 h-5 text-green-500" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  const handleSubjectCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    
    // Allow only alphanumeric characters and limit to 7 characters
    const sanitizedValue = value.replace(/[^A-Z0-9]/g, '').slice(0, 7);
    
    setSubjectCode(sanitizedValue);
  };

  const validateSubjectCode = (code: string): boolean => {
    return code.length === 7;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please upload a file before submitting.');
      return;
    }

    // Validate subject code
    if (!validateSubjectCode(subjectCode)) {
      toast.error('Subject code must be exactly 7 characters (e.g., 22CSC15)');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('regulation', regulation);
    formData.append('year', year);
    formData.append('topic', topic);
    formData.append('subject', subject);
    formData.append('subjectCode', subjectCode);
    formData.append('description', description);
    formData.append('channel', selectedChannel);
    formData.append('uploadedBy', currentUser.email);

    setIsUploading(true);

    try {
      const response = await fetch('https://nandhanotes.onrender.com/upload-note', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const fileType = getFileType(fileName);
        const creditsEarned = getCreditsForFileType(fileType);
        const channelName = channels.find(ch => ch.id === selectedChannel)?.name;

        if (selectedChannel && selectedChannel !== 'none' && channelName) {
          toast.success(
            `Notes uploaded successfully! You earned ${creditsEarned} credits. Channel members have been notified via email.`,
            { duration: 5000 }
          );
        } else {
          toast.success(
            `Notes uploaded successfully! You earned ${creditsEarned} credits.`,
            { duration: 4000 }
          );
        }

        onUpload(data);
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          userData.credits = data.user.credits;
          userData.uploadCount = data.user.uploadCount;
          localStorage.setItem('currentUser', JSON.stringify(userData));
        }
        onProfileUpdate();
        
        // ✅ Call the upload success callback to trigger dashboard refresh
        if (onUploadSuccess) onUploadSuccess();
        
        handleClose();
      } else {
        toast.error('Failed to upload notes.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error uploading file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setFileName('');
    setRegulation('');
    setYear('');
    setTopic('');
    setSubject('');
    setSubjectCode('');
    setDescription('');
    setSelectedChannel('');
    setIsUploading(false);
    onClose();
  };

  const getSelectedChannelName = () => {
    if (!selectedChannel || selectedChannel === 'none') return null;
    return channels.find(ch => ch.id === selectedChannel)?.name;
  };

  const fileType = getFileType(fileName);
  const creditsEarned = getCreditsForFileType(fileType);
  const selectedChannelName = getSelectedChannelName();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle>Upload Notes</DialogTitle>
          <DialogDescription>
            Share your notes with other students. Supported formats: 
            PDF (3 credits), PPT/PPTX (2 credits), DOC/DOCX (2 credits), Images (1 credit)
            {selectedChannelName && (
              <span className="block mt-1 text-green-600 font-medium">
                📧 Channel members will be notified via email when you upload to "{selectedChannelName}"
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* File Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="file">File Upload</Label>
              <div 
                className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  id="file"
                  type="file"
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
                <label htmlFor="file" className="cursor-pointer block">
                  <div className="flex items-center justify-center mb-2">
                    {fileName ? getFileIcon(fileType) : <File className="w-8 h-8 text-muted-foreground" />}
                  </div>
                  {fileName ? (
                    <div>
                      <p className="text-sm font-medium">{fileName}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {fileType.toUpperCase()} - {
                          file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : ''
                        } • Earns {creditsEarned} credits
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm mb-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">
                        PDF, PPT, PPTX, DOC, DOCX, JPG, PNG (Max 10MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Regulation and Year */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="regulation">Regulation</Label>
                <Select value={regulation} onValueChange={setRegulation} required>
                  <SelectTrigger id="regulation" className="bg-input-background">
                    <SelectValue placeholder="Select regulation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="R22">R22</SelectItem>
                    <SelectItem value="R21">R21</SelectItem>
                    <SelectItem value="R20">R20</SelectItem>
                    <SelectItem value="R19">R19</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select value={year} onValueChange={setYear} required>
                  <SelectTrigger id="year" className="bg-input-background">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="I">Year I</SelectItem>
                    <SelectItem value="II">Year II</SelectItem>
                    <SelectItem value="III">Year III</SelectItem>
                    <SelectItem value="IV">Year IV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Topic */}
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                type="text"
                placeholder="e.g., Data Structures - Unit 1"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                className="bg-input-background"
              />
            </div>

            {/* Subject and Subject Code */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="e.g., Full Stack Development"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="bg-input-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subjectCode">Subject Code</Label>
                <Input
                  id="subjectCode"
                  type="text"
                  placeholder="e.g., 22CSC15"
                  value={subjectCode}
                  onChange={handleSubjectCodeChange}
                  required
                  className="bg-input-background"
                  maxLength={7}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add a brief description of the notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
                className="bg-input-background resize-none"
              />
            </div>

            {/* Channel */}
            <div className="space-y-2">
              <Label htmlFor="channel">Share to Channel (Optional)</Label>
              <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                <SelectTrigger id="channel" className="bg-input-background">
                  <SelectValue placeholder="Select a channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Don't share to channel</SelectItem>
                  {channels.map((channel) => (
                    <SelectItem key={channel.id} value={channel.id}>
                      {channel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : `Upload Notes ${creditsEarned > 0 ? `(+${creditsEarned} credits)` : ''}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}