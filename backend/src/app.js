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

// Enhanced CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://127.0.0.1:3000',  // Alternative localhost
    'https://hoppscotch.io',  // Hoppscotch
    'https://hopp.sh'         // Hoppscotch alternative domain
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CRITICAL: Add these middleware BEFORE your routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log(`🔍 Origin:`, req.headers.origin);
  console.log(`📦 Content-Type:`, req.headers['content-type']);
  console.log(`📄 Body:`, req.body);
  next();
});

// File upload middleware
app.use('/uploads', express.static('uploads'));

// Routes (these come AFTER the body parsing middleware)
app.use('/api/auth', authRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/chat', chatRoutes);

// Debug logs
console.log('Auth routes registered at /api/auth');
console.log('Available auth routes:');
console.log('POST /api/auth/register-school');
console.log('POST /api/auth/login');

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler for undefined routes (Express v5 compatible)
app.use(/.*/, (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SmartDrive server running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/api/health`);
});
