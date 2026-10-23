import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './db/init.js';
import shareRoutes from './routes/shareRoutes.js';
import aiProxyRoutes from './routes/aiProxyRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.NODE_PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

initDatabase();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'resumeforge-node-sqlite' });
});

app.use('/api', shareRoutes);
app.use('/api', aiProxyRoutes);

app.listen(PORT, () => {
  console.log(`ResumeForge Node.js + SQLite Server listening on http://localhost:${PORT}`);
});
