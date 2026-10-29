import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  db,
  initDatabase,
  verifyPassword,
  hashPassword,
  generateSessionToken
} from './src/server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Initialize SQLite schema and initial data
initDatabase();

// Basic security middleware (remove x-powered-by, nosniff, frame protection)
app.disable('x-powered-by');
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(express.json({ limit: '1mb' }));

// Simple in-memory rate limiter for mutation routes
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();
function rateLimit(limit = 60, windowMs = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = ipRequestCounts.get(ip);

    if (!entry || now > entry.resetTime) {
      ipRequestCounts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (entry.count >= limit) {
      return res.status(429).json({
        error: 'Limite de requisições excedido. Aguarde alguns instantes antes de tentar novamente.'
      });
    }

    entry.count++;
    next();
  };
}

// User interface
interface AuthenticatedUser {
  id: string;
  username: string;
  name: string;
  nickname?: string;
  email: string;
  role: 'atleta' | 'treinador' | 'visitante' | 'administrador';
  avatar?: string;
  is_minor?: number;
}

// Authentication middleware using SQLite sessions
function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    (req as any).user = null;
    return next();
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    (req as any).user = null;
    return next();
  }

  try {
    const nowISO = new Date().toISOString();
    const sessionStmt = db.prepare(`
      SELECT s.token, s.expires_at, u.id, u.username, u.name, u.nickname, u.email, u.role, u.avatar, u.is_minor
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ? AND s.expires_at > ?
    `);

    const row = sessionStmt.get(token, nowISO) as any;
    if (row) {
      (req as any).user = {
        id: row.id,
        username: row.username,
        name: row.name,
        nickname: row.nickname,
        email: row.email,
        role: row.role,
        avatar: row.avatar,
        is_minor: row.is_minor
      } as AuthenticatedUser;
    } else {
      (req as any).user = null;
    }
  } catch (err) {
    console.error('[Auth Middleware] Session query error:', err);
    (req as any).user = null;
  }

  next();
}

// Require authenticated user
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as AuthenticatedUser | null;
  if (!user) {
    return res.status(401).json({
      error: 'Acesso não autorizado. É necessário fazer login para realizar esta ação.'
    });
  }
  next();
}

// Require specific roles
function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as AuthenticatedUser | null;
    if (!user) {
      return res.status(401).json({
        error: 'Acesso não autorizado. Por favor faça login.'
      });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        error: `Acesso negado. Esta ação requer permissão de: ${allowedRoles.join(', ')}.`
      });
    }

    next();
  };
}

// ======================== API ROUTES ========================

// 1. Auth routes
app.post('/api/auth/login', rateLimit(20, 60000), (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
  }

  const cleanUsername = username.trim().toLowerCase();

  try {
    const userStmt = db.prepare('SELECT * FROM users WHERE LOWER(username) = ?');
    const user = userStmt.get(cleanUsername) as any;

    if (!user) {
      return res.status(401).json({
        error: 'Credenciais inválidas. Verifique o nome de usuário e a senha.'
      });
    }

    const isValid = verifyPassword(password, user.password_hash, user.salt);
    if (!isValid) {
      return res.status(401).json({
        error: 'Credenciais inválidas. Verifique o nome de usuário e a senha.'
      });
    }

    // Generate session token (7 days duration)
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const createdAt = new Date().toISOString();

    const insertSession = db.prepare(`
      INSERT INTO sessions (token, user_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `);
    insertSession.run(token, user.id, expiresAt, createdAt);

    const safeUser: AuthenticatedUser = {
      id: user.id,
      username: user.username,
      name: user.name,
      nickname: user.nickname,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      is_minor: user.is_minor
    };

    return res.json({
      user: safeUser,
      token
    });
  } catch (err: any) {
    console.error('[Login Error]', err);
    return res.status(500).json({ error: 'Erro interno ao processar autenticação.' });
  }
});

app.post('/api/auth/logout', authenticate, (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    try {
      db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    } catch (e) {
      console.warn('Logout session delete error:', e);
    }
  }
  return res.json({ success: true, message: 'Sessão encerrada com sucesso.' });
});

app.get('/api/auth/me', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({ user });
});

app.post('/api/auth/change-password', authenticate, requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser;
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    return res.status(400).json({ error: 'A nova senha deve conter pelo menos 6 caracteres.' });
  }

  try {
    const userRow = db.prepare('SELECT password_hash, salt FROM users WHERE id = ?').get(user.id) as any;
    if (!userRow || !verifyPassword(currentPassword, userRow.password_hash, userRow.salt)) {
      return res.status(401).json({ error: 'Senha atual incorreta.' });
    }

    const { hash, salt } = hashPassword(newPassword);
    db.prepare('UPDATE users SET password_hash = ?, salt = ? WHERE id = ?').run(hash, salt, user.id);
    res.json({ success: true, message: 'Senha alterada com sucesso.' });
  } catch (err) {
    console.error('[Change Password Error]', err);
    res.status(500).json({ error: 'Erro ao alterar senha.' });
  }
});

// Athlete profiles routes (persistent roster & personal profile update)
app.get('/api/athletes', (_req: Request, res: Response) => {
  try {
    const rows = db.prepare(`
      SELECT p.id, p.user_id as userId, p.display_name as displayName, p.approved_nickname as approvedNickname,
             p.category, p.level, p.years_playing as yearsPlaying, p.favorite_shot as favoriteShot,
             p.grip_type as gripType, p.achievements_json, p.birth_month as birthMonth, p.birth_day as birthDay,
             p.avatar_url as avatarUrl, p.consent_granted as consentGranted, p.updated_at_iso as updatedAtISO
      FROM athlete_profiles p
      ORDER BY p.display_name ASC
    `).all() as any[];

    const formatted = rows.map(r => ({
      ...r,
      achievements: JSON.parse(r.achievements_json || '[]'),
      consentGranted: Boolean(r.consentGranted)
    }));

    res.json(formatted);
  } catch (err) {
    console.error('[Get Athletes Error]', err);
    res.status(500).json({ error: 'Erro ao carregar atletas da equipe.' });
  }
});

app.get('/api/athletes/me', authenticate, requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser;
  try {
    const row = db.prepare(`
      SELECT p.id, p.user_id as userId, p.display_name as displayName, p.approved_nickname as approvedNickname,
             p.category, p.level, p.years_playing as yearsPlaying, p.favorite_shot as favoriteShot,
             p.grip_type as gripType, p.achievements_json, p.birth_month as birthMonth, p.birth_day as birthDay,
             p.avatar_url as avatarUrl, p.consent_granted as consentGranted
      FROM athlete_profiles p
      WHERE p.user_id = ?
    `).get(user.id) as any;

    if (row) {
      return res.json({
        ...row,
        achievements: JSON.parse(row.achievements_json || '[]'),
        consentGranted: Boolean(row.consentGranted)
      });
    }

    res.json({
      id: `ath-${user.id}`,
      userId: user.id,
      displayName: user.name,
      approvedNickname: user.nickname || user.name.split(' ')[0],
      category: 'Adulto • Representação Municipal',
      level: 'Intermediário',
      yearsPlaying: '3 anos de prática',
      favoriteShot: 'Topspin de Forehand Cruzado',
      gripType: 'Clássica (Shakehand)',
      achievements: [],
      birthMonth: 'Janeiro',
      birthDay: 1,
      avatarUrl: '',
      consentGranted: true
    });
  } catch (err) {
    console.error('[Get Me Athlete Error]', err);
    res.status(500).json({ error: 'Erro ao carregar perfil do atleta.' });
  }
});

app.put('/api/athletes/me', authenticate, requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser;
  const { displayName, approvedNickname, category, level, yearsPlaying, favoriteShot, gripType } = req.body;

  if (!displayName || typeof displayName !== 'string' || displayName.trim().length < 3) {
    return res.status(400).json({ error: 'Nome de exibição inválido (mínimo 3 caracteres).' });
  }

  const nowISO = new Date().toISOString();
  const cleanDisplayName = displayName.trim();
  const cleanNickname = approvedNickname ? approvedNickname.trim() : user.nickname || '';
  const cleanCategory = category || 'Adulto • Representação Municipal';
  const cleanLevel = level || 'Intermediário';
  const cleanYears = yearsPlaying || '3 anos de prática';
  const cleanShot = favoriteShot || 'Topspin de Forehand Cruzado';
  const cleanGrip = gripType || 'Clássica (Shakehand)';

  try {
    const existing = db.prepare('SELECT id FROM athlete_profiles WHERE user_id = ?').get(user.id) as any;

    if (existing) {
      db.prepare(`
        UPDATE athlete_profiles
        SET display_name = ?, approved_nickname = ?, category = ?, level = ?, years_playing = ?, favorite_shot = ?, grip_type = ?, updated_at_iso = ?
        WHERE user_id = ?
      `).run(cleanDisplayName, cleanNickname, cleanCategory, cleanLevel, cleanYears, cleanShot, cleanGrip, nowISO, user.id);
    } else {
      const newId = `ath-${user.id}`;
      db.prepare(`
        INSERT INTO athlete_profiles (id, user_id, display_name, approved_nickname, category, level, years_playing, favorite_shot, grip_type, achievements_json, updated_at_iso)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', ?)
      `).run(newId, user.id, cleanDisplayName, cleanNickname, cleanCategory, cleanLevel, cleanYears, cleanShot, cleanGrip, nowISO);
    }

    db.prepare('UPDATE users SET name = ?, nickname = ? WHERE id = ?').run(cleanDisplayName, cleanNickname, user.id);

    res.json({
      success: true,
      profile: {
        userId: user.id,
        displayName: cleanDisplayName,
        approvedNickname: cleanNickname,
        category: cleanCategory,
        level: cleanLevel,
        yearsPlaying: cleanYears,
        favoriteShot: cleanShot,
        gripType: cleanGrip
      }
    });
  } catch (err) {
    console.error('[Update Athlete Error]', err);
    res.status(500).json({ error: 'Erro ao atualizar perfil do atleta.' });
  }
});

// 2. Notices routes
app.get('/api/notices', (_req: Request, res: Response) => {
  try {
    const rows = db.prepare(`
      SELECT id, title, body, author_name as author, author_role as authorRole,
             published_at as publishedAt, published_at_iso as publishedAtISO,
             expires_at as expiresAt, expires_at_iso as expiresAtISO,
             category, is_urgent as isUrgent, status
      FROM notices
      ORDER BY is_urgent DESC, published_at_iso DESC
    `).all() as any[];

    const formatted = rows.map(r => ({
      ...r,
      isUrgent: Boolean(r.isUrgent)
    }));

    res.json(formatted);
  } catch (err) {
    console.error('[Get Notices Error]', err);
    res.status(500).json({ error: 'Erro ao carregar avisos.' });
  }
});

app.post('/api/notices', authenticate, requireRole(['treinador', 'administrador']), (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser;
  const { title, body, category, isUrgent, expiresAt } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length < 4 || title.length > 150) {
    return res.status(400).json({ error: 'Título inválido (deve conter entre 4 e 150 caracteres).' });
  }

  if (!body || typeof body !== 'string' || body.trim().length < 10 || body.length > 3000) {
    return res.status(400).json({ error: 'Conteúdo do aviso inválido (deve conter entre 10 e 3000 caracteres).' });
  }

  const id = `not-${Date.now()}`;
  const now = new Date();
  const publishedAt = now.toLocaleDateString('pt-BR');
  const publishedAtISO = now.toISOString();
  const cleanExpiresAt = expiresAt || new Date(Date.now() + 30 * 86400000).toLocaleDateString('pt-BR');
  const expiresAtISO = new Date(Date.now() + 30 * 86400000).toISOString();
  const cleanCategory = ['Torneio', 'Horários', 'Manutenção', 'Geral'].includes(category) ? category : 'Geral';
  const urgentVal = isUrgent ? 1 : 0;
  const authorRole = user.role === 'treinador' ? 'Treinador Titular - Mogi Guaçu' : 'Administrador';

  try {
    const stmt = db.prepare(`
      INSERT INTO notices (id, title, body, author_id, author_name, author_role, published_at, published_at_iso, expires_at, expires_at_iso, category, is_urgent, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Ativo')
    `);

    stmt.run(
      id,
      title.trim(),
      body.trim(),
      user.id,
      user.name,
      authorRole,
      publishedAt,
      publishedAtISO,
      cleanExpiresAt,
      expiresAtISO,
      cleanCategory,
      urgentVal
    );

    res.status(201).json({
      id,
      title: title.trim(),
      body: body.trim(),
      author: user.name,
      authorRole,
      publishedAt,
      publishedAtISO,
      expiresAt: cleanExpiresAt,
      expiresAtISO,
      category: cleanCategory,
      isUrgent: Boolean(urgentVal),
      status: 'Ativo'
    });
  } catch (err) {
    console.error('[Create Notice Error]', err);
    res.status(500).json({ error: 'Erro ao cadastrar aviso no banco de dados.' });
  }
});

app.delete('/api/notices/:id', authenticate, requireRole(['treinador', 'administrador']), (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = db.prepare('DELETE FROM notices WHERE id = ?').run(id);
    res.json({ success: true, deleted: result.changes > 0 });
  } catch (err) {
    console.error('[Delete Notice Error]', err);
    res.status(500).json({ error: 'Erro ao remover aviso.' });
  }
});

// 3. Events routes
app.get('/api/events', (_req: Request, res: Response) => {
  try {
    const rows = db.prepare(`
      SELECT id, title, type, date_display as date, date_iso as dateISO, time_str as time,
             location, city, organizer, status, registration_deadline_iso as registrationDeadlineISO,
             categories_json, official_link as officialLink, last_verified_at as lastVerifiedAt
      FROM events
      ORDER BY date_iso ASC
    `).all() as any[];

    const formatted = rows.map(r => ({
      ...r,
      categories: JSON.parse(r.categories_json || '[]')
    }));

    res.json(formatted);
  } catch (err) {
    console.error('[Get Events Error]', err);
    res.status(500).json({ error: 'Erro ao carregar eventos.' });
  }
});

app.post('/api/events', authenticate, requireRole(['treinador', 'administrador']), (req: Request, res: Response) => {
  const {
    title,
    type,
    date,
    dateISO,
    time,
    location,
    city,
    organizer,
    status,
    categories,
    officialLink,
    registrationDeadlineISO
  } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    return res.status(400).json({ error: 'Título do evento é obrigatório.' });
  }

  if (!location || !city) {
    return res.status(400).json({ error: 'Local e cidade são obrigatórios.' });
  }

  const id = `evt-${Date.now()}`;
  const verifiedAt = new Date().toLocaleDateString('pt-BR');
  const catJson = JSON.stringify(Array.isArray(categories) ? categories : ['Adulto', 'Livre']);

  try {
    const stmt = db.prepare(`
      INSERT INTO events (id, title, type, date_display, date_iso, time_str, location, city, organizer, status, registration_deadline_iso, categories_json, official_link, last_verified_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      title.trim(),
      type || 'Campeonato Regional',
      date || 'Data a confirmar',
      dateISO || new Date().toISOString(),
      time || '08:30',
      location.trim(),
      city.trim(),
      organizer || 'Comissão Técnica Mogi Guaçu',
      status || 'Inscrições Abertas',
      registrationDeadlineISO || null,
      catJson,
      officialLink || null,
      verifiedAt
    );

    res.status(201).json({
      id,
      title: title.trim(),
      type: type || 'Campeonato Regional',
      date: date || 'Data a confirmar',
      dateISO: dateISO || new Date().toISOString(),
      time: time || '08:30',
      location: location.trim(),
      city: city.trim(),
      organizer: organizer || 'Comissão Técnica Mogi Guaçu',
      status: status || 'Inscrições Abertas',
      registrationDeadlineISO: registrationDeadlineISO || null,
      categories: Array.isArray(categories) ? categories : ['Adulto', 'Livre'],
      officialLink: officialLink || null,
      lastVerifiedAt: verifiedAt
    });
  } catch (err) {
    console.error('[Create Event Error]', err);
    res.status(500).json({ error: 'Erro ao cadastrar evento.' });
  }
});

// 4. Attendances routes
app.get('/api/attendances', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser | null;
  try {
    const rows = db.prepare(`
      SELECT id, event_id as eventId, user_id as userId, athlete_name as athleteName,
             athlete_nickname as athleteNickname, category, transport_need as transportNeed,
             confirmed_at as confirmedAt, status
      FROM attendances
    `).all() as any[];

    const formatted = rows.map(r => ({
      ...r,
      isCurrentUser: user ? r.userId === user.id : false
    }));

    res.json(formatted);
  } catch (err) {
    console.error('[Get Attendances Error]', err);
    res.status(500).json({ error: 'Erro ao consultar convocações.' });
  }
});

app.post('/api/attendances/toggle', authenticate, requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser;

  if (user.role === 'visitante') {
    return res.status(403).json({
      error: 'Visitantes em modo somente leitura não podem confirmar presença em convocações da equipe.'
    });
  }

  const { eventId, transportNeed, category } = req.body;

  if (!eventId || typeof eventId !== 'string') {
    return res.status(400).json({ error: 'ID do evento é obrigatório.' });
  }

  try {
    // Check if attendance already exists for this user and event
    const existing = db.prepare('SELECT id FROM attendances WHERE event_id = ? AND user_id = ?').get(eventId, user.id) as any;

    if (existing) {
      // Remove
      db.prepare('DELETE FROM attendances WHERE id = ?').run(existing.id);
    } else {
      // Insert
      const newId = `att-${Date.now()}`;
      const confirmedAt = new Date().toLocaleDateString('pt-BR');
      const cleanCategory = category || 'Adulto • Equipe Mogi Guaçu';
      const cleanTransport = transportNeed || 'Van da Equipe';
      const athleteNickname = user.nickname || user.name.split(' ')[0];

      db.prepare(`
        INSERT INTO attendances (id, event_id, user_id, athlete_name, athlete_nickname, category, transport_need, confirmed_at, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Confirmado pelo Prof. Max')
      `).run(
        newId,
        eventId,
        user.id,
        user.name,
        athleteNickname,
        cleanCategory,
        cleanTransport,
        confirmedAt
      );
    }

    // Return updated list
    const allRows = db.prepare(`
      SELECT id, event_id as eventId, user_id as userId, athlete_name as athleteName,
             athlete_nickname as athleteNickname, category, transport_need as transportNeed,
             confirmed_at as confirmedAt, status
      FROM attendances
    `).all() as any[];

    const formatted = allRows.map(r => ({
      ...r,
      isCurrentUser: r.userId === user.id
    }));

    return res.json({
      confirmed: !existing,
      attendances: formatted
    });
  } catch (err) {
    console.error('[Toggle Attendance Error]', err);
    return res.status(500).json({ error: 'Erro ao registrar confirmação.' });
  }
});

// 5. Chat routes
app.get('/api/chat', (_req: Request, res: Response) => {
  try {
    const rows = db.prepare(`
      SELECT id, channel_id as channelId, user_id as userId, sender_name as senderName,
             sender_role as senderRole, sender_avatar as senderAvatar,
             timestamp_display as timestamp, text, is_official as isOfficialAnnouncement,
             created_at_iso as createdAtISO
      FROM chat_messages
      ORDER BY created_at_iso ASC
      LIMIT 150
    `).all() as any[];

    const formatted = rows.map(r => ({
      ...r,
      isOfficialAnnouncement: Boolean(r.isOfficialAnnouncement)
    }));

    res.json(formatted);
  } catch (err) {
    console.error('[Get Chat Error]', err);
    res.status(500).json({ error: 'Erro ao carregar mensagens.' });
  }
});

app.post('/api/chat', authenticate, requireAuth, rateLimit(30, 60000), (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser;

  if (user.role === 'visitante') {
    return res.status(403).json({
      error: 'Visitantes em modo somente leitura não podem postar mensagens no chat da equipe.'
    });
  }

  const { channelId, text } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Texto da mensagem não pode ser vazio.' });
  }

  if (text.trim().length > 1000) {
    return res.status(400).json({ error: 'A mensagem excede o limite máximo de 1000 caracteres.' });
  }

  // Security check: only coach/admin can post in coach announcements channel
  if (channelId === 'avisos-treinador' && user.role !== 'treinador' && user.role !== 'administrador') {
    return res.status(403).json({
      error: 'Somente o treinador ou a comissão técnica pode emitir avisos no canal oficial do Prof. Max.'
    });
  }

  const cleanChannel = channelId || 'geral';
  const id = `msg-${Date.now()}`;
  const now = new Date();
  const timeDisplay = 'Hoje às ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const isOfficial = cleanChannel === 'avisos-treinador' ? 1 : 0;
  const createdAtISO = now.toISOString();

  try {
    const stmt = db.prepare(`
      INSERT INTO chat_messages (id, channel_id, user_id, sender_name, sender_role, sender_avatar, timestamp_display, text, is_official, created_at_iso)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      cleanChannel,
      user.id,
      user.name,
      user.role,
      user.avatar || null,
      timeDisplay,
      text.trim(),
      isOfficial,
      createdAtISO
    );

    res.status(201).json({
      id,
      channelId: cleanChannel,
      userId: user.id,
      senderName: user.name,
      senderRole: user.role,
      senderAvatar: user.avatar,
      timestamp: timeDisplay,
      text: text.trim(),
      isOfficialAnnouncement: Boolean(isOfficial),
      createdAtISO
    });
  } catch (err) {
    console.error('[Post Chat Error]', err);
    res.status(500).json({ error: 'Erro ao enviar mensagem.' });
  }
});

// 6. Reports & Moderation
app.post('/api/reports', authenticate, requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser;
  const { reportedChannel, reportedMessageId, reason } = req.body;

  if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
    return res.status(400).json({ error: 'Motivo da denúncia é obrigatório (mínimo 5 caracteres).' });
  }

  const id = `rep-${Date.now()}`;
  const createdAtISO = new Date().toISOString();

  try {
    const stmt = db.prepare(`
      INSERT INTO reports (id, reporter_user_id, reporter_name, reporter_role, reported_channel, reported_message_id, reason, created_at_iso, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pendente')
    `);

    stmt.run(
      id,
      user.id,
      user.name,
      user.role,
      reportedChannel || 'geral',
      reportedMessageId || null,
      reason.trim(),
      createdAtISO
    );

    res.status(201).json({
      success: true,
      message: 'Denúncia recebida com sucesso e encaminhada para moderação da comissão técnica.',
      reportId: id
    });
  } catch (err) {
    console.error('[Create Report Error]', err);
    res.status(500).json({ error: 'Erro ao registrar denúncia.' });
  }
});

// List reports (Coach / Admin)
app.get('/api/reports', authenticate, requireRole(['treinador', 'administrador']), (_req: Request, res: Response) => {
  try {
    const rows = db.prepare(`
      SELECT r.id, r.reporter_user_id as reporterUserId, r.reporter_name as reporterName,
             r.reporter_role as reporterRole, r.reported_channel as reportedChannel,
             r.reported_message_id as reportedMessageId, r.reason, r.status,
             r.decision_note as decisionNote, r.resolved_by as resolvedBy,
             r.resolved_at_iso as resolvedAtISO, r.created_at_iso as createdAtISO,
             m.text as reportedMessageText, m.sender_name as reportedMessageAuthor
      FROM reports r
      LEFT JOIN chat_messages m ON r.reported_message_id = m.id
      ORDER BY CASE WHEN r.status = 'Pendente' THEN 0 ELSE 1 END, r.created_at_iso DESC
    `).all() as any[];

    res.json(rows);
  } catch (err) {
    console.error('[Get Reports Error]', err);
    res.status(500).json({ error: 'Erro ao listar denúncias.' });
  }
});

// Resolve a report (Coach / Admin)
app.patch('/api/reports/:id/resolve', authenticate, requireRole(['treinador', 'administrador']), (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser;
  const { id } = req.params;
  const { action, decisionNote } = req.body; // action: 'dismiss' | 'remove_message'

  try {
    const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(id) as any;
    if (!report) {
      return res.status(404).json({ error: 'Denúncia não encontrada.' });
    }

    const nowISO = new Date().toISOString();
    let newStatus = 'Analisado';

    if (action === 'remove_message' && report.reported_message_id) {
      db.prepare('DELETE FROM chat_messages WHERE id = ?').run(report.reported_message_id);
      newStatus = 'Mensagem Removida';
    } else if (action === 'dismiss') {
      newStatus = 'Arquivado';
    }

    const cleanNote = decisionNote || (action === 'remove_message' ? 'Mensagem excluída por violação das diretrizes da equipe.' : 'Denúncia analisada e arquivada.');

    db.prepare(`
      UPDATE reports
      SET status = ?, decision_note = ?, resolved_by = ?, resolved_at_iso = ?
      WHERE id = ?
    `).run(newStatus, cleanNote, user.name, nowISO, id);

    res.json({
      success: true,
      reportId: id,
      status: newStatus,
      resolvedBy: user.name,
      decisionNote: cleanNote
    });
  } catch (err) {
    console.error('[Resolve Report Error]', err);
    res.status(500).json({ error: 'Erro ao resolver denúncia.' });
  }
});

// Delete message by coach/moderator
app.delete('/api/chat/messages/:id', authenticate, requireRole(['treinador', 'administrador']), (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = db.prepare('DELETE FROM chat_messages WHERE id = ?').run(id);
    res.json({ success: true, deleted: result.changes > 0 });
  } catch (err) {
    console.error('[Delete Chat Message Error]', err);
    res.status(500).json({ error: 'Erro ao remover mensagem.' });
  }
});

// Psychology Journal Routes (Persistent per User)
app.get('/api/psychology/journal', authenticate, requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser;
  try {
    const rows = db.prepare(`
      SELECT id, date_display as date, match_or_training as matchOrTraining, feeling,
             what_went_well as whatWentWell, what_to_improve as whatToImprove, focus_next as focusForNextTime,
             created_at_iso as createdAtISO
      FROM psychology_journals
      WHERE user_id = ?
      ORDER BY created_at_iso DESC
    `).all(user.id) as any[];

    res.json(rows);
  } catch (err) {
    console.error('[Get Psych Journal Error]', err);
    res.status(500).json({ error: 'Erro ao carregar diário psicológico.' });
  }
});

app.post('/api/psychology/journal', authenticate, requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser;
  const { matchOrTraining, feeling, whatWentWell, whatToImprove, focusForNextTime } = req.body;

  if (!matchOrTraining || !whatWentWell) {
    return res.status(400).json({ error: 'Treino/partida e pontos positivos são obrigatórios.' });
  }

  const id = `pj-${Date.now()}`;
  const now = new Date();
  const dateDisplay = now.toLocaleDateString('pt-BR');
  const createdAtISO = now.toISOString();

  try {
    db.prepare(`
      INSERT INTO psychology_journals (id, user_id, athlete_name, date_display, match_or_training, feeling, what_went_well, what_to_improve, focus_next, created_at_iso)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      user.id,
      user.name,
      dateDisplay,
      matchOrTraining.trim(),
      feeling || 'Focado',
      whatWentWell.trim(),
      whatToImprove ? whatToImprove.trim() : '',
      focusForNextTime ? focusForNextTime.trim() : '',
      createdAtISO
    );

    res.status(201).json({
      id,
      date: dateDisplay,
      matchOrTraining: matchOrTraining.trim(),
      feeling: feeling || 'Focado',
      whatWentWell: whatWentWell.trim(),
      whatToImprove: whatToImprove ? whatToImprove.trim() : '',
      focusForNextTime: focusForNextTime ? focusForNextTime.trim() : '',
      createdAtISO
    });
  } catch (err) {
    console.error('[Save Psych Journal Error]', err);
    res.status(500).json({ error: 'Erro ao salvar reflexão no diário.' });
  }
});

app.delete('/api/psychology/journal/:id', authenticate, requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser;
  const { id } = req.params;
  try {
    const resDel = db.prepare('DELETE FROM psychology_journals WHERE id = ? AND user_id = ?').run(id, user.id);
    res.json({ success: true, deleted: resDel.changes > 0 });
  } catch (err) {
    console.error('[Delete Psych Journal Error]', err);
    res.status(500).json({ error: 'Erro ao remover entrada do diário.' });
  }
});

// Tactical Scouting Routes (Persistent per User)
app.get('/api/tactical/scouting', authenticate, requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser;
  try {
    const rows = db.prepare(`
      SELECT id, opponent_name as opponentName, opponent_grip as opponentGrip, opponent_rubber as opponentRubber,
             favorite_serve as favoriteServe, weakness, my_gameplan as myGameplan, notes, created_at_iso as createdAtISO
      FROM tactical_scoutings
      WHERE user_id = ?
      ORDER BY created_at_iso DESC
    `).all(user.id) as any[];

    res.json(rows);
  } catch (err) {
    console.error('[Get Scouting Error]', err);
    res.status(500).json({ error: 'Erro ao carregar fichas de observação.' });
  }
});

app.post('/api/tactical/scouting', authenticate, requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser;
  const { opponentName, opponentGrip, opponentRubber, favoriteServe, weakness, myGameplan, notes } = req.body;

  if (!opponentName || typeof opponentName !== 'string' || opponentName.trim().length < 2) {
    return res.status(400).json({ error: 'Nome do adversário observado é obrigatório.' });
  }

  const id = `scout-${Date.now()}`;
  const createdAtISO = new Date().toISOString();

  try {
    db.prepare(`
      INSERT INTO tactical_scoutings (id, user_id, athlete_name, opponent_name, opponent_grip, opponent_rubber, favorite_serve, weakness, my_gameplan, notes, created_at_iso)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      user.id,
      user.name,
      opponentName.trim(),
      opponentGrip || 'Clássica Destro',
      opponentRubber || 'Borrachas Lisas em Ambos os Lados',
      favoriteServe ? favoriteServe.trim() : '',
      weakness ? weakness.trim() : '',
      myGameplan ? myGameplan.trim() : '',
      notes ? notes.trim() : '',
      createdAtISO
    );

    res.status(201).json({
      id,
      opponentName: opponentName.trim(),
      opponentGrip: opponentGrip || 'Clássica Destro',
      opponentRubber: opponentRubber || 'Borrachas Lisas em Ambos os Lados',
      favoriteServe: favoriteServe ? favoriteServe.trim() : '',
      weakness: weakness ? weakness.trim() : '',
      myGameplan: myGameplan ? myGameplan.trim() : '',
      notes: notes ? notes.trim() : '',
      createdAtISO
    });
  } catch (err) {
    console.error('[Create Scouting Error]', err);
    res.status(500).json({ error: 'Erro ao registrar ficha de observação.' });
  }
});

app.delete('/api/tactical/scouting/:id', authenticate, requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser;
  const { id } = req.params;
  try {
    const resDel = db.prepare('DELETE FROM tactical_scoutings WHERE id = ? AND user_id = ?').run(id, user.id);
    res.json({ success: true, deleted: resDel.changes > 0 });
  } catch (err) {
    console.error('[Delete Scouting Error]', err);
    res.status(500).json({ error: 'Erro ao remover ficha.' });
  }
});

// 6b. Athlete Equipment Setup Routes (Ferramenta #6)
app.get('/api/equipment/my', authenticate, requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser;
  try {
    const row = db.prepare(`
      SELECT id, user_id as userId, athlete_name as athleteName, blade_name as bladeName, blade_type as bladeType,
             blade_weight_grams as bladeWeightGrams, grip_type as gripType, fh_rubber_name as fhRubberName,
             fh_rubber_type as fhRubberType, fh_sponge_thickness as fhSpongeThickness, fh_assembly_date as fhAssemblyDate,
             bh_rubber_name as bhRubberName, bh_rubber_type as bhRubberType, bh_sponge_thickness as bhSpongeThickness,
             bh_assembly_date as bhAssemblyDate, glue_type as glueType, total_weight_grams as totalWeightGrams,
             notes, updated_at_iso as updatedAtISO
      FROM athlete_equipment
      WHERE user_id = ?
    `).get(user.id) as any;

    res.json({ equipment: row || null });
  } catch (err) {
    console.error('[Get My Equipment Error]', err);
    res.status(500).json({ error: 'Erro ao carregar dados do equipamento.' });
  }
});

app.put('/api/equipment/my', authenticate, requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser;
  const {
    bladeName, bladeType, bladeWeightGrams, gripType,
    fhRubberName, fhRubberType, fhSpongeThickness, fhAssemblyDate,
    bhRubberName, bhRubberType, bhSpongeThickness, bhAssemblyDate,
    glueType, totalWeightGrams, notes
  } = req.body;

  if (!bladeName || !fhRubberName || !bhRubberName) {
    return res.status(400).json({ error: 'Nome da madeira e das borrachas são obrigatórios.' });
  }

  const id = `eq-${user.id}`;
  const nowISO = new Date().toISOString();

  try {
    db.prepare(`
      INSERT INTO athlete_equipment (
        id, user_id, athlete_name, blade_name, blade_type, blade_weight_grams, grip_type,
        fh_rubber_name, fh_rubber_type, fh_sponge_thickness, fh_assembly_date,
        bh_rubber_name, bh_rubber_type, bh_sponge_thickness, bh_assembly_date,
        glue_type, total_weight_grams, notes, updated_at_iso
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        blade_name = excluded.blade_name,
        blade_type = excluded.blade_type,
        blade_weight_grams = excluded.blade_weight_grams,
        grip_type = excluded.grip_type,
        fh_rubber_name = excluded.fh_rubber_name,
        fh_rubber_type = excluded.fh_rubber_type,
        fh_sponge_thickness = excluded.fh_sponge_thickness,
        fh_assembly_date = excluded.fh_assembly_date,
        bh_rubber_name = excluded.bh_rubber_name,
        bh_rubber_type = excluded.bh_rubber_type,
        bh_sponge_thickness = excluded.bh_sponge_thickness,
        bh_assembly_date = excluded.bh_assembly_date,
        glue_type = excluded.glue_type,
        total_weight_grams = excluded.total_weight_grams,
        notes = excluded.notes,
        updated_at_iso = excluded.updated_at_iso
    `).run(
      id, user.id, user.name,
      bladeName.trim(), bladeType || 'Madeira Pura 5F', Number(bladeWeightGrams) || 85, gripType || 'Clássica (Shakehand)',
      fhRubberName.trim(), fhRubberType || 'Borracha Lisa', fhSpongeThickness || '2.0mm', fhAssemblyDate || new Date().toISOString().split('T')[0],
      bhRubberName.trim(), bhRubberType || 'Borracha Lisa', bhSpongeThickness || '2.0mm', bhAssemblyDate || new Date().toISOString().split('T')[0],
      glueType || 'Cola à Base d\'Água', Number(totalWeightGrams) || 180, notes ? notes.trim() : '', nowISO
    );

    res.json({ success: true, message: 'Ficha de equipamento atualizada com sucesso!' });
  } catch (err) {
    console.error('[Update Equipment Error]', err);
    res.status(500).json({ error: 'Erro ao salvar ficha de equipamento.' });
  }
});

// 6c. Match Diaries Routes (Ferramenta #3)
app.get('/api/matches', authenticate, requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser;
  try {
    let rows: any[];
    if (user.role === 'treinador' || user.role === 'administrador') {
      rows = db.prepare(`
        SELECT id, user_id as userId, athlete_name as athleteName, opponent_name as opponentName,
               opponent_club as opponentClub, opponent_style as opponentStyle, match_format as matchFormat,
               sets_won_player as setsWonPlayer, sets_won_opponent as setsWonOpponent,
               sets_detail as setsDetail, is_victory as isVictory, competition_or_event as competitionOrEvent,
               positive_takeaways as positiveTakeaways, difficulties_faced as difficultiesFaced,
               coach_focus_next as coachFocusNext, created_at_iso as createdAtISO
        FROM match_diaries
        ORDER BY created_at_iso DESC
      `).all() as any[];
    } else {
      rows = db.prepare(`
        SELECT id, user_id as userId, athlete_name as athleteName, opponent_name as opponentName,
               opponent_club as opponentClub, opponent_style as opponentStyle, match_format as matchFormat,
               sets_won_player as setsWonPlayer, sets_won_opponent as setsWonOpponent,
               sets_detail as setsDetail, is_victory as isVictory, competition_or_event as competitionOrEvent,
               positive_takeaways as positiveTakeaways, difficulties_faced as difficultiesFaced,
               coach_focus_next as coachFocusNext, created_at_iso as createdAtISO
        FROM match_diaries
        WHERE user_id = ?
        ORDER BY created_at_iso DESC
      `).all(user.id) as any[];
    }

    res.json(rows.map(r => ({ ...r, isVictory: Boolean(r.isVictory) })));
  } catch (err) {
    console.error('[Get Matches Error]', err);
    res.status(500).json({ error: 'Erro ao carregar diário de partidas.' });
  }
});

app.post('/api/matches', authenticate, requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser;
  const {
    opponentName, opponentClub, opponentStyle, matchFormat,
    setsWonPlayer, setsWonOpponent, setsDetail, isVictory,
    competitionOrEvent, positiveTakeaways, difficultiesFaced, coachFocusNext
  } = req.body;

  if (!opponentName || setsWonPlayer === undefined || setsWonOpponent === undefined) {
    return res.status(400).json({ error: 'Nome do adversário e placar de sets são obrigatórios.' });
  }

  const id = `match-${Date.now()}`;
  const nowISO = new Date().toISOString();

  try {
    db.prepare(`
      INSERT INTO match_diaries (
        id, user_id, athlete_name, opponent_name, opponent_club, opponent_style, match_format,
        sets_won_player, sets_won_opponent, sets_detail, is_victory, competition_or_event,
        positive_takeaways, difficulties_faced, coach_focus_next, created_at_iso
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, user.id, user.name,
      opponentName.trim(), opponentClub ? opponentClub.trim() : 'Não informado',
      opponentStyle ? opponentStyle.trim() : 'Geral', Number(matchFormat) || 5,
      Number(setsWonPlayer), Number(setsWonOpponent), setsDetail || `${setsWonPlayer}x${setsWonOpponent}`,
      isVictory ? 1 : 0, competitionOrEvent ? competitionOrEvent.trim() : 'Treino / Amistoso',
      positiveTakeaways ? positiveTakeaways.trim() : '', difficultiesFaced ? difficultiesFaced.trim() : '',
      coachFocusNext ? coachFocusNext.trim() : '', nowISO
    );

    res.status(201).json({
      id,
      userId: user.id,
      athleteName: user.name,
      opponentName: opponentName.trim(),
      opponentClub: opponentClub ? opponentClub.trim() : '',
      opponentStyle: opponentStyle || '',
      matchFormat: Number(matchFormat) || 5,
      setsWonPlayer: Number(setsWonPlayer),
      setsWonOpponent: Number(setsWonOpponent),
      setsDetail: setsDetail || `${setsWonPlayer}x${setsWonOpponent}`,
      isVictory: Boolean(isVictory),
      competitionOrEvent: competitionOrEvent || 'Treino / Amistoso',
      positiveTakeaways: positiveTakeaways || '',
      difficultiesFaced: difficultiesFaced || '',
      coachFocusNext: coachFocusNext || '',
      createdAtISO: nowISO
    });
  } catch (err) {
    console.error('[Create Match Error]', err);
    res.status(500).json({ error: 'Erro ao registrar partida no diário.' });
  }
});

app.delete('/api/matches/:id', authenticate, requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser;
  const { id } = req.params;
  try {
    let resDel;
    if (user.role === 'treinador' || user.role === 'administrador') {
      resDel = db.prepare('DELETE FROM match_diaries WHERE id = ?').run(id);
    } else {
      resDel = db.prepare('DELETE FROM match_diaries WHERE id = ? AND user_id = ?').run(id, user.id);
    }
    res.json({ success: true, deleted: resDel.changes > 0 });
  } catch (err) {
    console.error('[Delete Match Error]', err);
    res.status(500).json({ error: 'Erro ao excluir partida do diário.' });
  }
});

// 7. Drill history (P1.5 Training Sessions History with strict userId isolation)
app.get('/api/drills/history', authenticate, requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser;

  try {
    let rows: any[];
    if (user.role === 'treinador' || user.role === 'administrador') {
      // Coach sees all athlete drills for team performance tracking
      rows = db.prepare(`
        SELECT id, drill_id as drillId, drill_title as drillTitle, athlete_name as athleteName,
               completed_at_iso as completedAtISO, duration_seconds as durationSeconds,
               sets_completed as setsCompleted, rest_duration_seconds as restDurationSeconds, notes
        FROM drill_history
        ORDER BY completed_at_iso DESC
      `).all() as any[];
    } else {
      // Athlete sees strictly their own drill sessions
      rows = db.prepare(`
        SELECT id, drill_id as drillId, drill_title as drillTitle, athlete_name as athleteName,
               completed_at_iso as completedAtISO, duration_seconds as durationSeconds,
               sets_completed as setsCompleted, rest_duration_seconds as restDurationSeconds, notes
        FROM drill_history
        WHERE user_id = ?
        ORDER BY completed_at_iso DESC
      `).all(user.id) as any[];
    }

    res.json(rows);
  } catch (err) {
    console.error('[Get Drills History Error]', err);
    res.status(500).json({ error: 'Erro ao carregar histórico de treinos.' });
  }
});

app.post('/api/drills/history', authenticate, requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser;
  const { drillId, drillTitle, durationSeconds, setsCompleted, restDurationSeconds, notes } = req.body;

  const id = `dh-${Date.now()}`;
  const completedAtISO = new Date().toISOString();
  const durSec = Math.max(1, Number(durationSeconds) || 180);
  const sets = Math.max(1, Number(setsCompleted) || 1);
  const restSec = Math.max(0, Number(restDurationSeconds) || 60);

  try {
    const stmt = db.prepare(`
      INSERT INTO drill_history (id, user_id, athlete_name, drill_id, drill_title, completed_at_iso, duration_seconds, sets_completed, rest_duration_seconds, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      user.id,
      user.name,
      drillId || 'drill-custom',
      drillTitle || 'Sessão de Treino Prático',
      completedAtISO,
      durSec,
      sets,
      restSec,
      notes || 'Sessão concluída com foco técnico em Mogi Guaçu.'
    );

    res.status(201).json({
      id,
      drillId: drillId || 'drill-custom',
      drillTitle: drillTitle || 'Sessão de Treino Prático',
      athleteName: user.name,
      completedAtISO,
      durationSeconds: durSec,
      setsCompleted: sets,
      restDurationSeconds: restSec,
      notes: notes || 'Sessão concluída com foco técnico em Mogi Guaçu.'
    });
  } catch (err) {
    console.error('[Save Drill History Error]', err);
    res.status(500).json({ error: 'Erro ao salvar histórico de treino.' });
  }
});

// 8. Stories routes (strict editorial flow and visibility filtering)
app.get('/api/stories', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser | null;

  try {
    let rows: any[];
    if (user && (user.role === 'treinador' || user.role === 'administrador')) {
      // Coach/Admin can see all stories, including 'Em Revisão'
      rows = db.prepare(`
        SELECT id, user_id as userId, title, author_name as authorName, author_nickname as authorNickname,
               date_display as date, summary, content, medals, status, reviewed_by as reviewedBy,
               has_photo_consent as hasPhotoConsent, created_at_iso as createdAtISO
        FROM stories
        ORDER BY created_at_iso DESC
      `).all() as any[];
    } else if (user) {
      // Athlete sees all published stories PLUS their own drafts/pending
      rows = db.prepare(`
        SELECT id, user_id as userId, title, author_name as authorName, author_nickname as authorNickname,
               date_display as date, summary, content, medals, status, reviewed_by as reviewedBy,
               has_photo_consent as hasPhotoConsent, created_at_iso as createdAtISO
        FROM stories
        WHERE status = 'Publicado' OR user_id = ?
        ORDER BY created_at_iso DESC
      `).all(user.id) as any[];
    } else {
      // Public / Guest sees strictly published stories
      rows = db.prepare(`
        SELECT id, user_id as userId, title, author_name as authorName, author_nickname as authorNickname,
               date_display as date, summary, content, medals, status, reviewed_by as reviewedBy,
               has_photo_consent as hasPhotoConsent, created_at_iso as createdAtISO
        FROM stories
        WHERE status = 'Publicado'
        ORDER BY created_at_iso DESC
      `).all() as any[];
    }

    const formatted = rows.map(r => ({
      ...r,
      hasPhotoConsent: Boolean(r.hasPhotoConsent)
    }));

    res.json(formatted);
  } catch (err) {
    console.error('[Get Stories Error]', err);
    res.status(500).json({ error: 'Erro ao carregar histórias.' });
  }
});

app.post('/api/stories', authenticate, requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser;
  const { title, summary, content, medals, hasConsent } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length < 4) {
    return res.status(400).json({ error: 'Título é obrigatório (mínimo 4 caracteres).' });
  }

  if (!content || typeof content !== 'string' || content.trim().length < 20) {
    return res.status(400).json({ error: 'Conteúdo do relato é obrigatório (mínimo 20 caracteres).' });
  }

  if (!hasConsent) {
    return res.status(400).json({
      error: 'É obrigatório declarar consentimento e autorização de publicação conforme a LGPD.'
    });
  }

  const isCoach = user.role === 'treinador' || user.role === 'administrador';
  const initialStatus = isCoach ? 'Publicado' : 'Em Revisão';
  const reviewedBy = isCoach ? user.name : 'Pendente de revisão pelo Prof. Max';

  const id = `story-${Date.now()}`;
  const now = new Date();
  const dateDisplay = now.toLocaleDateString('pt-BR');
  const createdAtISO = now.toISOString();
  const cleanSummary = summary || content.slice(0, 120) + '...';

  try {
    const stmt = db.prepare(`
      INSERT INTO stories (id, user_id, title, author_name, author_nickname, date_display, summary, content, medals, status, reviewed_by, has_photo_consent, created_at_iso)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      user.id,
      title.trim(),
      user.name,
      user.nickname || user.name.split(' ')[0],
      dateDisplay,
      cleanSummary,
      content.trim(),
      medals || '',
      initialStatus,
      reviewedBy,
      1,
      createdAtISO
    );

    res.status(201).json({
      id,
      userId: user.id,
      title: title.trim(),
      authorName: user.name,
      authorNickname: user.nickname || user.name.split(' ')[0],
      date: dateDisplay,
      summary: cleanSummary,
      content: content.trim(),
      medals: medals || '',
      status: initialStatus,
      reviewedBy,
      hasPhotoConsent: true,
      createdAtISO
    });
  } catch (err) {
    console.error('[Create Story Error]', err);
    res.status(500).json({ error: 'Erro ao enviar história.' });
  }
});

// Coach/Admin can approve/reject stories
app.patch('/api/stories/:id/status', authenticate, requireRole(['treinador', 'administrador']), (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser;
  const { id } = req.params;
  const { status } = req.body;

  if (!['Publicado', 'Em Revisão', 'Arquivado'].includes(status)) {
    return res.status(400).json({ error: 'Status editorial inválido.' });
  }

  try {
    const result = db.prepare(`
      UPDATE stories
      SET status = ?, reviewed_by = ?
      WHERE id = ?
    `).run(status, `Aprovado por ${user.name}`, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'História não encontrada.' });
    }

    res.json({ success: true, id, status, reviewedBy: `Aprovado por ${user.name}` });
  } catch (err) {
    console.error('[Update Story Status Error]', err);
    res.status(500).json({ error: 'Erro ao atualizar status editorial.' });
  }
});

// 9. LGPD Consents Register with Server Validation (P0.4)
app.post('/api/consents', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as AuthenticatedUser | null;
  const { policyVersion, isMinor, legalGuardianName, legalGuardianCpf, legalGuardianRelationship, legalGuardianPhone, agreedTerms } = req.body;

  if (agreedTerms !== true) {
    return res.status(400).json({
      error: 'É obrigatório declarar a concordância formal com os termos da Política de Privacidade (campo agreedTerms).'
    });
  }

  if (isMinor) {
    if (!legalGuardianName || typeof legalGuardianName !== 'string' || legalGuardianName.trim().length < 3) {
      return res.status(400).json({
        error: 'Para atletas menores de 18 anos, é obrigatório informar o nome completo do responsável legal.'
      });
    }
  }

  // Mask CPF if provided to avoid storing raw plaintext CPF per data minimization
  let maskedCpf: string | null = null;
  if (legalGuardianCpf && typeof legalGuardianCpf === 'string') {
    const digits = legalGuardianCpf.replace(/\D/g, '');
    if (digits.length === 11) {
      maskedCpf = `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
    } else {
      maskedCpf = 'CPF Informado (Ofuscado)';
    }
  }

  const id = `cst-${Date.now()}`;
  const acceptedAtISO = new Date().toISOString();
  const ipHint = req.ip || req.socket.remoteAddress || 'unknown';

  try {
    const stmt = db.prepare(`
      INSERT INTO consents (id, user_id, policy_version, ip_hint, accepted_at_iso, is_minor, legal_guardian_name, legal_guardian_cpf, agreed_terms, legal_guardian_relationship, legal_guardian_phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      user?.id || null,
      policyVersion || 'LGPD-2026.1-MOGI',
      ipHint,
      acceptedAtISO,
      isMinor ? 1 : 0,
      legalGuardianName ? legalGuardianName.trim() : null,
      maskedCpf,
      1,
      legalGuardianRelationship || (isMinor ? 'Responsável Legal' : null),
      legalGuardianPhone ? legalGuardianPhone.trim() : null
    );

    res.status(201).json({
      success: true,
      message: 'Termo de consentimento LGPD validado e registrado com sucesso no banco de dados.',
      consentId: id,
      acceptedAtISO,
      isMinor: Boolean(isMinor)
    });
  } catch (err) {
    console.error('[Register Consent Error]', err);
    res.status(500).json({ error: 'Erro ao registrar consentimento no banco de dados.' });
  }
});

// 10. AI Technical Coaching Assistant (P1.6 Gemini API)
app.post('/api/ai/coach-advice', authenticate, rateLimit(15, 60000), async (req: Request, res: Response) => {
  const { topic, question, athleteLevel, athleteGrip } = req.body;

  if (!question || typeof question !== 'string' || question.trim().length < 3) {
    return res.status(400).json({ error: 'Pergunta técnica é obrigatória.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI();
      const prompt = `Atleta Nível: ${athleteLevel || 'Intermediário'}, Empunhadura: ${athleteGrip || 'Clássica'}, Tópico: ${topic || 'Técnica e Treinamento'}.\nPergunta: ${question.trim()}`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'Você é o Assistente Técnico Oficial do Professor Max, treinador da equipe de Tênis de Mesa de Mogi Guaçu - SP. Forneça respostas práticas, didáticas e fundamentadas nas Regras Oficiais da ITTF/CBTM. Mantenha tom esportivo motivador e técnico. Não faça diagnósticos médicos.'
        }
      });

      return res.json({
        source: 'gemini-2.5-flash',
        advice: aiResponse.text || 'Siga a orientação técnica do Prof. Max nos treinos regulares no Ginásio do Furno.',
        disclaimer: 'Orientação metodológica de apoio. A execução deve ser supervisionada pelo Prof. Max.'
      });
    } catch (e) {
      console.warn('[Gemini AI] Call failed, fallback to local coaching rules:', e);
    }
  }

  // Curated technical fallback when API key is not present
  const advice = `[Orientação Técnica - Prof. Max]: Para sua dúvida sobre ${topic || 'técnica'} ("${question.trim().slice(0, 50)}..."), foque no relaxamento do punho no momento do contato e no centro de gravidade rebaixado. Pratique 3 séries de 5 minutos na mesa 1 ou 2 com foco em consistência antes de acelerar a bola.`;
  return res.json({
    source: 'diretrizes-tecnicas-mogi',
    advice,
    disclaimer: 'Orientação técnica baseada na metodologia oficial de treino do Tênis de Mesa Mogi Guaçu.'
  });
});

// 10. Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    database: 'SQLite (node:sqlite WAL mode)',
    time: new Date().toISOString(),
    city: 'Mogi Guaçu - SP',
    team: 'Tênis de Mesa Mogi Guaçu',
    version: '2026.1-secure'
  });
});

// ======================== STATIC & VITE MIDDLEWARES ========================

async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TM Mogi Guaçu Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
