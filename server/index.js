const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = Number(process.env.API_PORT || 4000);
const ROOT = path.resolve(__dirname, '..');
const CONTENT_FILE = path.join(__dirname, 'data', 'content.json');
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const TYPES = new Set(['places', 'stories', 'events']);
const REQUIRED = { places: ['name', 'region', 'description'], stories: ['person', 'place', 'text'], events: ['title', 'day', 'month', 'city'] };
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-this-jwt-secret-before-production';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'fotografo@guiaceara.com.br').toLowerCase();
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync('FotoCeara@2026', 12);
const loginAttempts = new Map();

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.disable('x-powered-by');
app.use(cors({ origin: process.env.ADMIN_ORIGIN?.split(',') || true }));
app.use(express.json({ limit: '1mb' }));
app.use('/media', express.static(UPLOAD_DIR, { maxAge: '7d', immutable: true }));
app.use('/admin', express.static(path.join(ROOT, 'admin')));

function readContent() {
  return JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'));
}

function writeContent(content) {
  const temporary = `${CONTENT_FILE}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(content, null, 2));
  fs.renameSync(temporary, CONTENT_FILE);
}

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Token não informado.' });
  try {
    req.user = jwt.verify(token, JWT_SECRET, { issuer: 'guia-ceara-api', audience: 'guia-ceara-admin' });
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

function validateType(req, res, next) {
  if (!TYPES.has(req.params.type)) return res.status(404).json({ error: 'Tipo de conteúdo inválido.' });
  next();
}

function safeFilename(file) {
  const extension = path.extname(file.originalname).toLowerCase();
  return `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`;
}

const upload = multer({
  storage: multer.diskStorage({ destination: UPLOAD_DIR, filename: (_req, file, callback) => callback(null, safeFilename(file)) }),
  limits: { fileSize: 150 * 1024 * 1024, files: 2 },
  fileFilter: (_req, file, callback) => {
    const accepted = file.fieldname === 'image' ? file.mimetype.startsWith('image/') : file.fieldname === 'video' ? file.mimetype.startsWith('video/') : false;
    callback(accepted ? null : new Error('Formato de arquivo não permitido.'), accepted);
  },
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'guia-ceara-api' }));
app.get('/api/content', (_req, res) => res.json(readContent()));

app.post('/api/auth/login', async (req, res) => {
  const key = req.ip;
  const current = loginAttempts.get(key) || { count: 0, blockedUntil: 0 };
  if (current.blockedUntil > Date.now()) return res.status(429).json({ error: 'Muitas tentativas. Aguarde 15 minutos.' });

  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const valid = email === ADMIN_EMAIL && await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  if (!valid) {
    const count = current.count + 1;
    loginAttempts.set(key, count >= 5 ? { count: 0, blockedUntil: Date.now() + 15 * 60 * 1000 } : { count, blockedUntil: 0 });
    return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
  }

  loginAttempts.delete(key);
  const token = jwt.sign({ sub: 'photographer', email, role: 'publisher' }, JWT_SECRET, { expiresIn: '8h', issuer: 'guia-ceara-api', audience: 'guia-ceara-admin' });
  res.json({ token, expiresIn: 28800, user: { email, role: 'publisher' } });
});

app.get('/api/admin/session', authenticate, (req, res) => res.json({ user: req.user }));
app.get('/api/admin/content', authenticate, (_req, res) => res.json(readContent()));

app.post('/api/admin/content/:type', authenticate, validateType, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), (req, res) => {
  const type = req.params.type;
  const missing = REQUIRED[type].filter(field => !String(req.body[field] || '').trim());
  if (missing.length) return res.status(400).json({ error: `Campos obrigatórios: ${missing.join(', ')}.` });

  const item = { ...req.body, id: `${type}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}` };
  if (req.files?.image?.[0]) item.image = `/media/${req.files.image[0].filename}`;
  if (req.files?.video?.[0]) item.video = `/media/${req.files.video[0].filename}`;
  if (type === 'places') {
    item.tags = String(item.tags || '').split(',').map(tag => tag.trim()).filter(Boolean);
    item.photos = Number(item.photos || 1);
  }
  if (type === 'events') item.free = item.free === 'true';

  const content = readContent();
  content[type].unshift(item);
  writeContent(content);
  res.status(201).json(item);
});

app.delete('/api/admin/content/:type/:id', authenticate, validateType, (req, res) => {
  const content = readContent();
  const item = content[req.params.type].find(entry => entry.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Conteúdo não encontrado.' });
  content[req.params.type] = content[req.params.type].filter(entry => entry.id !== req.params.id);
  writeContent(content);
  for (const field of ['image', 'video']) {
    if (item[field]?.startsWith('/media/')) {
      const file = path.join(UPLOAD_DIR, path.basename(item[field]));
      if (fs.existsSync(file)) fs.unlinkSync(file);
    }
  }
  res.status(204).end();
});

app.use((error, _req, res, _next) => {
  const status = error instanceof multer.MulterError || error.message?.includes('arquivo') ? 400 : 500;
  res.status(status).json({ error: status === 500 ? 'Erro interno do servidor.' : error.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API: http://localhost:${PORT}`);
  console.log(`Admin: http://localhost:${PORT}/admin`);
  if (!process.env.JWT_SECRET) console.warn('AVISO: usando JWT_SECRET de desenvolvimento. Configure o .env antes da produção.');
});
