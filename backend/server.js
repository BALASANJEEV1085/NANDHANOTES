import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import multer from "multer";
import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Connect MongoDB Atlas
mongoose.connect(
  process.env.MONGODB_URI || "mongodb+srv://balasanjeev:balasanjeev@cluster0.vvgdhov.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
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
  securityQuestion1: String,
  securityAnswer1: String,
  securityQuestion2: String,
  securityAnswer2: String,
  verified: { type: Boolean, default: true }, // Auto-verify since no email verification
  credits: { type: Number, default: 0 },
  uploadCount: { type: Number, default: 0 },
  uploadedNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],
  joinedChannels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }],
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

// ✅ Route: Check if email exists
app.post("/check-email", async (req, res) => {
  const { email } = req.body;

  try {
    const existing = await User.findOne({ email });
    res.json({ exists: !!existing });
  } catch (err) {
    console.error("❌ Check email error:", err);
    res.status(500).json({ message: "Error checking email" });
  }
});

// ✅ Route: Signup
app.post("/signup", async (req, res) => {
  const { username, email, password, securityQuestion1, securityAnswer1, securityQuestion2, securityAnswer2 } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const newUser = new User({ 
      username, 
      email, 
      password, 
      securityQuestion1,
      securityAnswer1: securityAnswer1.toLowerCase().trim(),
      securityQuestion2,
      securityAnswer2: securityAnswer2.toLowerCase().trim(),
      verified: true // Auto-verify since no email verification
    });
    await newUser.save();

    res.json({ 
      message: "Account created successfully! Remember your security answers for password recovery.",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ message: "Failed to create account" });
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
    console.error("❌ Login error:", err);
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
    console.error("❌ Get user error:", err);
    res.status(500).json({ message: "Error fetching user data" });
  }
});

// ✅ Route: Get Security Questions
app.post("/get-security-questions", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with that email." });
    }

    res.json({
      securityQuestion1: user.securityQuestion1,
      securityQuestion2: user.securityQuestion2
    });
  } catch (err) {
    console.error("❌ Get security questions error:", err);
    res.status(500).json({ message: "Failed to get security questions" });
  }
});

// ✅ Route: Verify Security Answers
app.post("/verify-security-answers", async (req, res) => {
  const { email, securityAnswer1, securityAnswer2 } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const answer1Match = user.securityAnswer1 === securityAnswer1.toLowerCase().trim();
    const answer2Match = user.securityAnswer2 === securityAnswer2.toLowerCase().trim();

    if (answer1Match && answer2Match) {
      res.json({ message: "Security answers verified successfully" });
    } else {
      res.status(400).json({ message: "Incorrect security answers" });
    }
  } catch (err) {
    console.error("❌ Security answers verification error:", err);
    res.status(500).json({ message: "Security answers verification failed" });
  }
});

// ✅ Route: Update Password
app.post("/update-password", async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully!" });
  } catch (err) {
    console.error("❌ Password update error:", err);
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

// ✅ Helper function to determine file type
const getFileTypeFromName = (fileName) => {
  if (!fileName) return 'pdf';
  const nameLower = fileName.toLowerCase();
  
  if (nameLower.endsWith('.pdf')) return 'pdf';
  if (nameLower.endsWith('.ppt') || nameLower.endsWith('.pptx')) return 'ppt';
  if (nameLower.endsWith('.jpg') || nameLower.endsWith('.jpeg') || nameLower.endsWith('.png')) return 'image';
  
  return 'pdf'; // default
};

// ✅ Upload Note Route
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

    // If uploaded to a channel, add note to channel
    if (channel && channel !== "none") {
      const channelDoc = await Channel.findById(channel);
      if (channelDoc) {
        channelDoc.notes.push(note._id);
        await channelDoc.save();
        console.log(`✅ Note added to channel "${channelDoc.name}"`);
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
      fileType: getFileTypeFromName(note.fileName)
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

app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));