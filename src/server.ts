import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { generalRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import analyzeRoutes from './routes/analyzeRoutes.js';
import scanRoutes from './routes/scanRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// ── Security Middleware ─────────────────────────────────────────────────────────

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", process.env.SUPABASE_URL || ''],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(generalRateLimiter);

// ── Health Check ────────────────────────────────────────────────────────────────

app.get(['/api/health', '/api/v1/health'], (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'TrustShield AI Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ──────────────────────────────────────────────────────────────────

app.use('/api/v1/analyze', analyzeRoutes);
app.use('/api/v1/scans', scanRoutes);
app.use('/api/v1/admin', adminRoutes);

// ── 404 Handler ─────────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({
    error: 'Endpoint not found.',
    statusCode: 404,
  });
});

// ── Global Error Handler ────────────────────────────────────────────────────────

app.use(errorHandler);

// ── Server Start ────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🛡️  TrustShield AI Server running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   API Base: http://localhost:${PORT}/api/v1\n`);
});

export default app;
