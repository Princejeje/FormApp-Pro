require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/auth');
const formRoutes = require('./routes/forms');
const submissionRoutes = require('./routes/submissions');

const app = express();
const PORT = process.env.PORT || 3001;

// --- SECURITY MIDDLEWARE ---
app.use(helmet({
  contentSecurityPolicy: false, // Disable default CSP to allow inline scripts/styles if needed
}));

// Allow CORS
app.use(cors({
  origin: '*', // In production, usually restrict this
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 300, 
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(morgan('dev'));
app.use(express.json());

// --- API ROUTES ---
const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/forms', formRoutes); 
apiRouter.use('/', submissionRoutes); 

app.use('/api', apiRouter);

// --- SERVE FRONTEND STATIC FILES (Production Fallback) ---
if (process.env.NODE_ENV === 'production') {
  // Go up one level from 'server' to find 'dist'
  const distPath = path.join(__dirname, '../dist');
  
  app.use(express.static(distPath));

  // Handle SPA Routing: Send all non-API requests to index.html
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// --- ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error'
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
