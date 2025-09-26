const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const schoolRoutes = require('./routes/schools');
const userRoutes = require('./routes/users');
const chapterRoutes = require('./routes/chapters');
const quizRoutes = require('./routes/quizzes');
const chatRoutes = require('./routes/chat');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// File upload middleware
app.use('/uploads', express.static('uploads'));

// Routes - CRITICAL: Remove /api prefix since frontend expects direct routes
app.use('/auth', authRoutes);
app.use('/schools', schoolRoutes);
app.use('/users', userRoutes);
app.use('/chapters', chapterRoutes);
app.use('/quizzes', quizRoutes);
app.use('/chat', chatRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SmartDrive server running on port ${PORT}`);
});