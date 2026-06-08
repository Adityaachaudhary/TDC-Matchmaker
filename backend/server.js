require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes     = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const matchRoutes    = require('./routes/matches');
const aiRoutes       = require('./routes/ai');
const notesRoutes    = require('./routes/notes');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth',      authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/matches',   matchRoutes);
app.use('/api/ai',        aiRoutes);
app.use('/api/notes',     notesRoutes);

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🌹 TDC Matchmaker API → http://localhost:${PORT}`);
  console.log(`   Profiles loaded: ${require('./data/profiles.json').length}`);
  console.log(`   Matchmakers: ${require('./data/matchmakers.json').length}\n`);
});
