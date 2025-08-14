import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import locationsRouter from './routes/locations.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '256kb' }));
app.use(morgan('dev'));

// Healthcheck
app.get('/health', (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development' });
});

// Routes
app.use('/api/locations', locationsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'NOT_FOUND' });
});

// Error fallback (jaga-jaga)
app.use((err, _req, res, _next) => {
  console.error('UNHANDLED_ERROR', err);
  res.status(500).json({ error: 'UNHANDLED_ERROR' });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
