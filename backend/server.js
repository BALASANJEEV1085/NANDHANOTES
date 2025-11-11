import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import { Resend } from 'resend';
import multer from "multer";
import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Connect MongoDB Atlas
mongoose
  .connect(
    "mongodb+srv://balasanjeev:balasanjeev@cluster0.vvgdhov.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ✅ GitHub Configuration
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;

// ✅ Resend Configuration
const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ Multer for file handling - 10MB LIMIT
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Rate limit tracking
let rateLimitResetTime = 0;

// ✅ Mongoose Schemas
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  verificationCode: String,
  verified: { type: Boolean, default: false },
  resetCode: String,
  credits: { type: Number, default: 0 },
  uploadCount: { type: Number, default: 0 },
  uploadedNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],
  joinedChannels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }],
  
  // ✅ Add this field
  allowEmailNotifications: { type: Boolean, default: true }
});

const User = mongoose.model("User", userSchema);

const noteSchema = new mongoose.Schema({
  fileName: String,
  fileUrl: String,
  filePath: String,
  regulation: String,
  year: String,
  topic: String,
  subject: String,
  subjectCode: String,
  description: String,
  channel: String,
  uploadedBy: { type: String, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now },
});

const Note = mongoose.model("Note", noteSchema);

const channelSchema = new mongoose.Schema({
  name: String,
  code: { type: String, unique: true },
  createdBy: { type: String, ref: 'User' },
  members: [{ 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    email: String,
    isAdmin: Boolean,
    joinedAt: { type: Date, default: Date.now }
  }],
  notes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],
  createdAt: { type: Date, default: Date.now }
});

const Channel = mongoose.model("Channel", channelSchema);

// ✅ Route: Signup
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const newUser = new User({ username, email, password, verificationCode });
    await newUser.save();

    // ✅ Send verification email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Nandha Notes <onboarding@resend.dev>',
 // Update with your verified domain
      to: email,
      subject: "📚 Verify your Nandha Notes Account",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; padding: 40px;">
          <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="background-color: #16a34a; padding: 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">📚 Nandha Notes</h1>
            </div>
            <div style="padding: 30px; text-align: center;">
              <h2 style="color: #333333; font-size: 20px; margin-bottom: 15px;">Verify Your Email Address</h2>
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                Hello 👋, thank you for signing up for <strong>Nandha Notes</strong>.<br>
                To complete your registration, please use the verification code below:
              </p>
              <div style="display: inline-block; padding: 15px 30px; background-color: #16a34a; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 3px; border-radius: 8px; margin-bottom: 25px;">
                ${verificationCode}
              </div>
              <p style="color: #777777; font-size: 14px; margin-top: 20px;">
                This code will expire in 10 minutes. Please do not share it with anyone.
              </p>
            </div>
            <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 13px; color: #888888;">
              <p style="margin: 0;">
                © ${new Date().getFullYear()} Nandha Notes. All rights reserved.<br>
              </p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ message: "Failed to send verification code" });
    }

    res.json({ message: "Verification code sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send verification code" });
  }
});

// ✅ Route: Verify Signup
app.post("/verify", async (req, res) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.verificationCode === code) {
    user.verified = true;
    await user.save();
    res.json({ message: "Account verified successfully" });
  } else {
    res.status(400).json({ message: "Invalid verification code" });
  }
});

// ✅ Route: Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No account found. Please sign up first." });
    }

    if (!user.verified) {
      return res.status(403).json({ message: "Your email is not verified. Please verify it first." });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    res.json({ 
      message: "Login successful!",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        credits: user.credits,
        uploadCount: user.uploadCount
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// ✅ Route: Get User Profile
app.get("/user/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      username: user.username,
      email: user.email,
      credits: user.credits,
      uploadCount: user.uploadCount
    });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ message: "Error fetching user data" });
  }
});

// ✅ Route: Request Password Reset
app.post("/request-reset", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "No account found with that email." });

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = resetCode;
    await user.save();

    // ✅ Send reset email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Nandha Notes <onboarding@resend.dev>',
// Update with your verified domain
      to: email,
      subject: "🔐 Password Reset Code - Nandha Notes",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; padding: 40px;">
          <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="background-color: #dc2626; padding: 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🔐 Nandha Notes</h1>
            </div>
            <div style="padding: 30px; text-align: center;">
              <h2 style="color: #333333; font-size: 20px; margin-bottom: 15px;">Password Reset Request</h2>
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                We received a request to reset your password for your <strong>Nandha Notes</strong> account.
                Use the code below to reset your password:
              </p>
              <div style="display: inline-block; padding: 15px 30px; background-color: #dc2626; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 3px; border-radius: 8px; margin-bottom: 25px;">
                ${resetCode}
              </div>
              <p style="color: #777777; font-size: 14px; margin-top: 20px;">
                This code will expire in 10 minutes.<br>
                If you didn't request this, you can safely ignore this email.
              </p>
            </div>
            <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 13px; color: #888888;">
              <p style="margin: 0;">
                © ${new Date().getFullYear()} Nandha Notes. All rights reserved.<br>
              </p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ message: "Failed to send reset code." });
    }

    res.json({ message: "Reset code sent to your email." });
  } catch (err) {
    console.error("Reset error:", err);
    res.status(500).json({ message: "Failed to send reset code." });
  }
});

// ✅ Route: Verify Reset Code
app.post("/verify-reset", async (req, res) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.resetCode === code) {
    res.json({ message: "Code verified successfully" });
  } else {
    res.status(400).json({ message: "Invalid reset code" });
  }
});

// ✅ Route: Update Password
app.post("/update-password", async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = newPassword;
    user.resetCode = null;
    await user.save();

    res.json({ message: "Password updated successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error updating password." });
  }
});

// ✅ Generate unique channel code
const generateChannelCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// ✅ Route: Create Channel
app.post("/create-channel", async (req, res) => {
  try {
    const { name, createdBy } = req.body;

    const user = await User.findOne({ email: createdBy });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let channelCode;
    let isUnique = false;
    while (!isUnique) {
      channelCode = generateChannelCode();
      const existingChannel = await Channel.findOne({ code: channelCode });
      if (!existingChannel) {
        isUnique = true;
      }
    }

    const channel = new Channel({
      name,
      code: channelCode,
      createdBy: user.email,
      members: [{
        userId: user._id,
        username: user.username,
        email: user.email,
        isAdmin: true
      }]
    });

    await channel.save();

    user.joinedChannels.push(channel._id);
    await user.save();

    res.json({
      message: "Channel created successfully!",
      channel: {
        id: channel._id,
        name: channel.name,
        code: channel.code,
        createdBy: channel.createdBy,
        memberCount: channel.members.length,
        noteCount: channel.notes.length,
        isAdmin: true
      }
    });
  } catch (err) {
    console.error("❌ Create channel error:", err);
    res.status(500).json({ message: "Failed to create channel" });
  }
});

// ✅ Route: Join Channel
app.post("/join-channel", async (req, res) => {
  try {
    const { code, userEmail } = req.body;

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const channel = await Channel.findOne({ code });
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const isMember = channel.members.some(member => member.email === user.email);
    if (isMember) {
      return res.status(400).json({ message: "You are already a member of this channel" });
    }

    channel.members.push({
      userId: user._id,
      username: user.username,
      email: user.email,
      isAdmin: false
    });

    await channel.save();

    user.joinedChannels.push(channel._id);
    await user.save();

    res.json({
      message: "Successfully joined channel!",
      channel: {
        id: channel._id,
        name: channel.name,
        code: channel.code,
        createdBy: channel.createdBy,
        memberCount: channel.members.length,
        noteCount: channel.notes.length,
        isAdmin: false
      }
    });
  } catch (err) {
    console.error("❌ Join channel error:", err);
    res.status(500).json({ message: "Failed to join channel" });
  }
});

// ✅ Route: Get User Channels
app.get("/user-channels/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).populate('joinedChannels');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const channels = await Channel.find({ _id: { $in: user.joinedChannels } });

    const formattedChannels = channels.map(channel => ({
      id: channel._id,
      name: channel.name,
      code: channel.code,
      createdBy: channel.createdBy,
      memberCount: channel.members.length,
      noteCount: channel.notes.length,
      isAdmin: channel.members.some(member => 
        member.email === req.params.email && member.isAdmin
      )
    }));

    res.json(formattedChannels);
  } catch (err) {
    console.error("❌ Get channels error:", err);
    res.status(500).json({ message: "Failed to fetch channels" });
  }
});

// ✅ Route: Get Channel Details
app.get("/channel/:channelId", async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId)
      .populate('notes')
      .populate('members.userId');

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const members = channel.members.map(member => ({
      id: member.userId._id,
      username: member.username,
      email: member.email,
      isAdmin: member.isAdmin
    }));

    const noteIds = channel.notes.map(note => note._id || note);
    const completeNotes = await Note.find({ _id: { $in: noteIds } });

    const notes = completeNotes.map(note => ({
      id: note._id,
      title: note.topic || note.fileName,
      subject: note.subject,
      subjectCode: note.subjectCode,
      regulation: note.regulation,
      year: note.year,
      description: note.description,
      fileType: getFileTypeFromName(note.fileName),
      uploadedBy: note.uploadedBy,
      uploadDate: new Date(note.uploadedAt).toLocaleDateString(),
      fileUrl: note.fileUrl
    }));

    res.json({
      channel: {
        id: channel._id,
        name: channel.name,
        code: channel.code,
        createdBy: channel.createdBy
      },
      members,
      notes
    });
  } catch (err) {
    console.error("❌ Get channel details error:", err);
    res.status(500).json({ message: "Failed to fetch channel details" });
  }
});

// ✅ Route: Remove User from Channel
app.post("/remove-user-from-channel", async (req, res) => {
  try {
    const { channelId, userId, currentUserEmail } = req.body;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const currentUser = channel.members.find(member => member.email === currentUserEmail);
    if (!currentUser || !currentUser.isAdmin) {
      return res.status(403).json({ message: "Only admin can remove users" });
    }

    channel.members = channel.members.filter(member => member.userId.toString() !== userId);
    await channel.save();

    await User.findByIdAndUpdate(userId, {
      $pull: { joinedChannels: channelId }
    });

    res.json({ message: "User removed from channel successfully" });
  } catch (err) {
    console.error("❌ Remove user error:", err);
    res.status(500).json({ message: "Failed to remove user from channel" });
  }
});

// ✅ FIXED: Helper function to determine file type (CORRECT ORDER)
const getFileTypeFromName = (fileName) => {
  if (!fileName) return 'pdf';
  const nameLower = fileName.toLowerCase();
  
  // Check in correct order - most specific first
  if (nameLower.endsWith('.pdf')) return 'pdf';
  if (nameLower.endsWith('.ppt') || nameLower.endsWith('.pptx')) return 'ppt';
  if (nameLower.endsWith('.jpg') || nameLower.endsWith('.jpeg') || nameLower.endsWith('.png')) return 'image';
  
  return 'pdf'; // default
};

// ✅ UPDATED: Upload Note Route with GitHub + Email Notifications
app.post("/upload-note", upload.single("file"), async (req, res) => {
  try {
    const { regulation, year, topic, subject, subjectCode, description, channel, uploadedBy } = req.body;
    const file = req.file;

    console.log("📤 Upload request received - File:", file?.originalname, "Size:", file?.size);

    if (!file) return res.status(400).json({ message: "No file uploaded" });
    if (file.size > 10 * 1024 * 1024) return res.status(400).json({ message: "File too large. Maximum 10MB." });

    // Check GitHub rate limit
    const now = Date.now();
    if (now < rateLimitResetTime) {
      const minutesLeft = Math.ceil((rateLimitResetTime - now) / 60000);
      return res.status(429).json({ message: `GitHub rate limit exceeded. Try again in ${minutesLeft} minutes.` });
    }

    const fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = `notes/${fileName}`;
    const fileContent = file.buffer.toString("base64");

    console.log("🔄 Uploading to GitHub...");
    const { data } = await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: filePath,
      message: `Upload note: ${topic || file.originalname}`,
      content: fileContent,
      branch: "main",
    });

    console.log("✅ GitHub upload successful");

    const publicUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${filePath}`;
    const fileType = getFileTypeFromName(file.originalname);
    let creditsEarned = fileType === "pdf" ? 3 : fileType === "ppt" ? 2 : fileType === "image" ? 1 : 0;

    // Save note
    const note = new Note({
      fileName: file.originalname,
      fileUrl: publicUrl,
      filePath,
      regulation,
      year,
      topic,
      subject,
      subjectCode,
      description,
      channel,
      uploadedBy,
    });
    await note.save();

    // Update uploader info
    const user = await User.findOne({ email: uploadedBy });
    if (user) {
      user.credits += creditsEarned;
      user.uploadCount += 1;
      user.uploadedNotes.push(note._id);
      await user.save();
    }

    // ✅ If uploaded to a channel, notify all members
    if (channel && channel !== "none") {
      const channelDoc = await Channel.findById(channel);
      if (channelDoc) {
        channelDoc.notes.push(note._id);
        await channelDoc.save();

        try {
          const uploader = await User.findOne({ email: uploadedBy });
          const channelMembers = channelDoc.members;

          console.log(`📢 Sending email notifications for upload in channel "${channelDoc.name}"...`);
          await sendChannelUploadNotification(uploader, channelDoc, note, channelMembers);
        } catch (notifyErr) {
          console.error("❌ Failed to send upload notifications:", notifyErr);
        }
      } else {
        console.warn("⚠️ Channel not found, skipping notification");
      }
    }

    res.json({
      message: "File uploaded successfully!",
      fileUrl: publicUrl,
      creditsEarned,
      user: { credits: user.credits, uploadCount: user.uploadCount },
    });
  } catch (err) {
    console.error("❌ Upload error:", err);
    if (err.status === 403 && err.message.includes("rate limit")) {
      rateLimitResetTime = Date.now() + 3600000;
      return res.status(429).json({ message: "GitHub rate limit exceeded. Try again later." });
    }
    res.status(500).json({ message: "Failed to upload file." });
  }
});

// ✅ Route: Get All Notes
app.get("/get-notes", async (req, res) => {
  try {
    const notes = await Note.find().sort({ uploadedAt: -1 });
    
    // Transform notes for frontend
    const transformedNotes = notes.map(note => ({
      _id: note._id,
      fileName: note.fileName,
      fileUrl: note.fileUrl,
      regulation: note.regulation,
      year: note.year,
      topic: note.topic,
      subject: note.subject,
      subjectCode: note.subjectCode,
      description: note.description,
      uploadedBy: note.uploadedBy,
      uploadedAt: note.uploadedAt,
      fileType: getFileTypeFromName(note.fileName) // Use the same function
    }));
    
    res.json(transformedNotes);
  } catch (err) {
    console.error("❌ Fetch notes error:", err);
    res.status(500).json({ message: "Failed to fetch notes" });
  }
});

// ✅ Test GitHub Connection Route
app.get("/test-github", async (req, res) => {
  try {
    console.log("🔍 Testing GitHub connection...");
    
    // Test if we can access the repo
    const { data } = await octokit.repos.get({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO
    });
    
    console.log("✅ GitHub connection successful!");
    
    res.json({ 
      success: true, 
      message: "GitHub connection successful",
      repository: data.full_name
    });
  } catch (error) {
    console.error("❌ GitHub connection failed:", error);
    res.status(500).json({ 
      success: false, 
      message: "GitHub connection failed",
      error: error.message 
    });
  }
});

// ✅ Function to check if user allows email notifications
const checkEmailNotificationsAllowed = async (email) => {
  try {
    const user = await User.findOne({ email });
    return user?.allowEmailNotifications !== false;
  } catch (err) {
    console.error("Preference lookup failed:", err);
    return true;
  }
};

// ✅ Channel Upload Notification Email — Styled like Password Reset (Teal Theme)
const sendChannelUploadNotification = async (uploader, channel, note, channelMembers) => {
  try {
    const uploaderEmail = uploader.email || uploader;
    const uploaderName = uploader.username || "A user";

    // Exclude the uploader from the recipients
    const recipients = channelMembers.filter(m => m.email !== uploaderEmail);
    if (recipients.length === 0) {
      console.log("📧 No recipients to notify (only uploader in channel)");
      return;
    }

    const validRecipients = [];
    for (const member of recipients) {
      const allows = await checkEmailNotificationsAllowed(member.email);
      if (allows) validRecipients.push(member);
      else console.log(`📪 Skipping ${member.email} (notifications disabled)`);
    }

    if (validRecipients.length === 0) {
      console.log("📭 No members have notifications enabled");
      return;
    }

    const appBaseUrl = "http://localhost:3000"; // ⚙️ Update this when deployed

    for (const member of validRecipients) {
      const { data, error } = await resend.emails.send({
        from: 'Nandha Notes <onboarding@resend.dev>',

        to: member.email,
        subject: `📚 New Notes Uploaded in ${channel.name} - Nandha Notes`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; padding: 40px;">
            <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <div style="background-color: #15b8a6; padding: 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">📚 Nandha Notes</h1>
              </div>

              <!-- Body -->
              <div style="padding: 30px; text-align: center;">
                <h2 style="color: #333333; font-size: 20px; margin-bottom: 15px;">New Notes Uploaded</h2>
                <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                  <strong>${uploaderName}</strong> has uploaded new notes to your channel
                  <strong>${channel.name}</strong>.
                </p>

                <!-- Note Details -->
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: left; margin-bottom: 25px;">
                  <h3 style="color: #15b8a6; margin-top: 0; margin-bottom: 10px;">📖 Note Details</h3>
                  <p style="margin: 5px 0; color: #333;"><strong>Title:</strong> ${note.topic || note.fileName}</p>
                  <p style="margin: 5px 0; color: #333;"><strong>Subject:</strong> ${note.subject} (${note.subjectCode})</p>
                  <p style="margin: 5px 0; color: #333;"><strong>Regulation:</strong> ${note.regulation}</p>
                  <p style="margin: 5px 0; color: #333;"><strong>Year:</strong> ${note.year}</p>
                  <p style="margin: 5px 0; color: #333;"><strong>Description:</strong> ${note.description || "No description provided"}</p>
                </div>

                <!-- Buttons -->
                <div style="margin-bottom: 25px;">
                  <a href="${appBaseUrl}/notes/${note._id}"
   style="display: inline-block; padding: 12px 24px; background-color: #15b8a6; color: #ffffff; border-radius: 8px; text-decoration: none; font-weight: bold; margin-right: 10px;">
   📥 View Notes
</a>

                  <a href="${appBaseUrl}/channels/${channel._id}"
                     style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; border-radius: 8px; text-decoration: none; font-weight: bold;">
                     🔗 Open Channel
                  </a>
                </div>

                <p style="color: #777777; font-size: 14px; margin-top: 15px;">
                  You are receiving this email because you are a member of <strong>${channel.name}</strong>.<br>
                  Manage your notification preferences in your account settings.
                </p>
              </div>

              <!-- Footer -->
              <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 13px; color: #888888;">
                <p style="margin: 0;">
                  © ${new Date().getFullYear()} Nandha Notes. All rights reserved.<br>
                  <a href="${appBaseUrl}/settings" style="color: #15b8a6; text-decoration: none;">Manage Notification Preferences</a>
                </p>
              </div>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error(`❌ Failed to send email to ${member.email}:`, error);
      } else {
        console.log(`✅ Channel upload notification sent to ${member.email}`);
      }
    }

    console.log(`✅ All upload notifications sent for channel "${channel.name}"`);
  } catch (err) {
    console.error("❌ Error in sendChannelUploadNotification:", err);
  }
});

// ✅ Test Resend Email Route
app.get("/test-email", async (req, res) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Nandha Notes <onboarding@resend.dev>',
      to: 'balasnjeev1085@gmail.com', // Change to your test email
      subject: "✅ Test Email from Nandha Notes",
      html: "<p>If you see this, Resend is configured correctly 🎉</p>",
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, message: "Email sent successfully ✅", data });
  } catch (error) {
    console.error("❌ Email test failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
