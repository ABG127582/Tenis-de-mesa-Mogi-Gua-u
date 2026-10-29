import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory at project root /data
const DATA_DIR = path.resolve(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.resolve(DATA_DIR, 'tm_guacu.db');

export const db = new DatabaseSync(DB_FILE);

// Enable WAL mode and foreign keys for durability and data integrity
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Password hashing helper using scrypt
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, actualSalt, 64).toString('hex');
  return { hash, salt: actualSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const computed = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
}

// Generate secure session token (64 hex characters)
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Initialize tables and seed data
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      name TEXT NOT NULL,
      nickname TEXT,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      avatar TEXT,
      is_minor INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

    CREATE TABLE IF NOT EXISTS notices (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      author_id TEXT,
      author_name TEXT NOT NULL,
      author_role TEXT NOT NULL,
      published_at TEXT NOT NULL,
      published_at_iso TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      expires_at_iso TEXT NOT NULL,
      category TEXT NOT NULL,
      is_urgent INTEGER DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Ativo',
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      date_display TEXT NOT NULL,
      date_iso TEXT NOT NULL,
      time_str TEXT,
      location TEXT NOT NULL,
      city TEXT NOT NULL,
      organizer TEXT NOT NULL,
      status TEXT NOT NULL,
      registration_deadline_iso TEXT,
      categories_json TEXT NOT NULL,
      official_link TEXT,
      last_verified_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS attendances (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      athlete_name TEXT NOT NULL,
      athlete_nickname TEXT,
      category TEXT NOT NULL,
      transport_need TEXT NOT NULL,
      confirmed_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Confirmado pelo Prof. Max',
      UNIQUE(event_id, user_id),
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      channel_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      sender_role TEXT NOT NULL,
      sender_avatar TEXT,
      timestamp_display TEXT NOT NULL,
      text TEXT NOT NULL,
      is_official INTEGER DEFAULT 0,
      created_at_iso TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_chat_channel ON chat_messages(channel_id);

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      reporter_user_id TEXT NOT NULL,
      reporter_name TEXT NOT NULL,
      reporter_role TEXT NOT NULL,
      reported_channel TEXT NOT NULL,
      reported_message_id TEXT,
      reason TEXT NOT NULL,
      created_at_iso TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pendente',
      FOREIGN KEY (reporter_user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS drill_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      athlete_name TEXT NOT NULL,
      drill_id TEXT NOT NULL,
      drill_title TEXT NOT NULL,
      completed_at_iso TEXT NOT NULL,
      duration_seconds INTEGER NOT NULL,
      sets_completed INTEGER NOT NULL,
      rest_duration_seconds INTEGER NOT NULL,
      notes TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_drill_history_user ON drill_history(user_id);

    CREATE TABLE IF NOT EXISTS stories (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_nickname TEXT,
      date_display TEXT NOT NULL,
      summary TEXT NOT NULL,
      content TEXT NOT NULL,
      medals TEXT,
      status TEXT NOT NULL DEFAULT 'Em Revisão',
      reviewed_by TEXT,
      has_photo_consent INTEGER NOT NULL DEFAULT 0,
      created_at_iso TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS consents (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      policy_version TEXT NOT NULL,
      ip_hint TEXT,
      accepted_at_iso TEXT NOT NULL,
      is_minor INTEGER DEFAULT 0,
      legal_guardian_name TEXT,
      legal_guardian_cpf TEXT,
      agreed_terms INTEGER DEFAULT 1,
      legal_guardian_relationship TEXT,
      legal_guardian_phone TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS psychology_journals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      athlete_name TEXT NOT NULL,
      date_display TEXT NOT NULL,
      match_or_training TEXT NOT NULL,
      feeling TEXT NOT NULL,
      what_went_well TEXT NOT NULL,
      what_to_improve TEXT NOT NULL,
      focus_next TEXT NOT NULL,
      created_at_iso TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_psych_user ON psychology_journals(user_id);

    CREATE TABLE IF NOT EXISTS tactical_scoutings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      athlete_name TEXT NOT NULL,
      opponent_name TEXT NOT NULL,
      opponent_grip TEXT NOT NULL,
      opponent_rubber TEXT NOT NULL,
      favorite_serve TEXT,
      weakness TEXT,
      my_gameplan TEXT,
      notes TEXT,
      created_at_iso TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_scouting_user ON tactical_scoutings(user_id);

    CREATE TABLE IF NOT EXISTS athlete_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      approved_nickname TEXT,
      category TEXT NOT NULL,
      level TEXT NOT NULL,
      years_playing TEXT NOT NULL,
      favorite_shot TEXT NOT NULL,
      grip_type TEXT NOT NULL,
      achievements_json TEXT NOT NULL DEFAULT '[]',
      birth_month TEXT,
      birth_day INTEGER,
      avatar_url TEXT DEFAULT '',
      consent_granted INTEGER DEFAULT 1,
      updated_at_iso TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS athlete_equipment (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      athlete_name TEXT NOT NULL,
      blade_name TEXT NOT NULL,
      blade_type TEXT NOT NULL,
      blade_weight_grams REAL DEFAULT 85,
      grip_type TEXT NOT NULL,
      fh_rubber_name TEXT NOT NULL,
      fh_rubber_type TEXT NOT NULL,
      fh_sponge_thickness TEXT NOT NULL,
      fh_assembly_date TEXT NOT NULL,
      bh_rubber_name TEXT NOT NULL,
      bh_rubber_type TEXT NOT NULL,
      bh_sponge_thickness TEXT NOT NULL,
      bh_assembly_date TEXT NOT NULL,
      glue_type TEXT DEFAULT 'Cola à Base d''Água',
      total_weight_grams REAL DEFAULT 180,
      notes TEXT,
      updated_at_iso TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS match_diaries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      athlete_name TEXT NOT NULL,
      opponent_name TEXT NOT NULL,
      opponent_club TEXT,
      opponent_style TEXT,
      match_format INTEGER DEFAULT 5,
      sets_won_player INTEGER NOT NULL,
      sets_won_opponent INTEGER NOT NULL,
      sets_detail TEXT NOT NULL,
      is_victory INTEGER NOT NULL,
      competition_or_event TEXT,
      positive_takeaways TEXT,
      difficulties_faced TEXT,
      coach_focus_next TEXT,
      created_at_iso TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_match_diaries_user ON match_diaries(user_id);
  `);

  // Migrate existing tables safely if columns don't exist yet
  try { db.exec('ALTER TABLE reports ADD COLUMN decision_note TEXT;'); } catch {}
  try { db.exec('ALTER TABLE reports ADD COLUMN resolved_by TEXT;'); } catch {}
  try { db.exec('ALTER TABLE reports ADD COLUMN resolved_at_iso TEXT;'); } catch {}
  try { db.exec('ALTER TABLE consents ADD COLUMN agreed_terms INTEGER DEFAULT 1;'); } catch {}
  try { db.exec('ALTER TABLE consents ADD COLUMN legal_guardian_relationship TEXT;'); } catch {}
  try { db.exec('ALTER TABLE consents ADD COLUMN legal_guardian_phone TEXT;'); } catch {}

  seedInitialData();
  syncCerescData();
}

function syncCerescData() {
  try {
    const upsertEvent = db.prepare(`
      INSERT INTO events (id, title, type, date_display, date_iso, time_str, location, city, organizer, status, registration_deadline_iso, categories_json, official_link, last_verified_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title=excluded.title,
        type=excluded.type,
        date_display=excluded.date_display,
        time_str=excluded.time_str,
        location=excluded.location,
        organizer=excluded.organizer,
        categories_json=excluded.categories_json,
        official_link=excluded.official_link,
        last_verified_at=excluded.last_verified_at
    `);

    upsertEvent.run(
      'evt-ceresc-segunda',
      'Treinamento Oficial - Segunda-Feira (CERESC)',
      'Treinamento',
      'Segunda-Feira',
      '2026-10-26T09:00:00-03:00',
      '09h às 12h e 14h às 18h',
      'CERESC (Centro Esportivo dos Servidores e Comunidade)',
      'Mogi Guaçu - SP',
      'Secretaria de Esporte e Lazer & Prefeitura de Mogi Guaçu',
      'Confirmado',
      null,
      JSON.stringify(['Treinamento Competitivo', 'Aperfeiçoamento Técnico']),
      'https://wa.me/5519998544817',
      '26/10/2026'
    );

    upsertEvent.run(
      'evt-ceresc-ter-qui',
      'Iniciação Esportiva - Terça e Quinta-Feira (CERESC)',
      'Treinamento',
      'Terça e Quinta-Feira',
      '2026-10-27T09:00:00-03:00',
      '09h às 12h, 14h às 18h e 19h às 21h',
      'CERESC (Centro Esportivo dos Servidores e Comunidade)',
      'Mogi Guaçu - SP',
      'Secretaria de Esporte e Lazer & Prefeitura de Mogi Guaçu',
      'Confirmado',
      null,
      JSON.stringify(['Iniciação', 'Aulas Abertas à Comunidade', 'Turma Noturna']),
      'https://wa.me/5519998544817',
      '26/10/2026'
    );

    upsertEvent.run(
      'evt-ceresc-sexta',
      'Treinamento Oficial - Sexta-Feira (CERESC)',
      'Treinamento',
      'Sexta-Feira',
      '2026-10-30T09:00:00-03:00',
      '09h às 12h e 13h às 15h',
      'CERESC (Centro Esportivo dos Servidores e Comunidade)',
      'Mogi Guaçu - SP',
      'Secretaria de Esporte e Lazer & Prefeitura de Mogi Guaçu',
      'Confirmado',
      null,
      JSON.stringify(['Treinamento Tático', 'Equipe Municipal']),
      'https://wa.me/5519998544817',
      '26/10/2026'
    );

    try {
      db.prepare("DELETE FROM events WHERE id IN ('evt-treino-turma-a', 'evt-treino-turma-b')").run();
    } catch {}

    const upsertNotice = db.prepare(`
      INSERT INTO notices (id, title, body, author_id, author_name, author_role, published_at, published_at_iso, expires_at, expires_at_iso, category, is_urgent, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title=excluded.title,
        body=excluded.body,
        is_urgent=excluded.is_urgent,
        status=excluded.status
    `);

    upsertNotice.run(
      'not-ceresc-oficial',
      'Horários Oficiais de Tênis de Mesa no CERESC — Iniciação e Treinamento (SEMEL)',
      'A Secretaria de Esporte e Lazer e a Prefeitura de Mogi Guaçu divulgam a grade semanal oficial no CERESC: Segundas (9h às 12h e 14h às 18h - Treinamento), Terças e Quintas (9h às 12h, 14h às 18h e 19h às 21h - Iniciação) e Sextas (9h às 12h e 13h às 15h - Treinamento). Mais informações e inscrições pelo WhatsApp oficial: (19) 99854-4817.',
      'usr-max',
      'Secretaria de Esporte e Lazer',
      'SEMEL / Prefeitura de Mogi Guaçu',
      '26/10/2026',
      '2026-10-26T08:00:00-03:00',
      '31/12/2026',
      '2026-12-31T23:59:59-03:00',
      'Horários',
      1,
      'Ativo'
    );

    // Sync official photo of Prof. Max
    const profMaxPhoto = '/assets/aistudio/Gemini_Generated_Image_si6kkasi6kkasi6k_c5b33fbe.jpeg';
    try {
      db.prepare("UPDATE users SET avatar = ? WHERE id = 'usr-max' OR username = 'max'").run(profMaxPhoto);
      db.prepare("UPDATE athlete_profiles SET avatar_url = ? WHERE id = 'ath-max' OR user_id = 'usr-max'").run(profMaxPhoto);
      db.prepare("UPDATE chat_messages SET sender_avatar = ? WHERE user_id = 'usr-max' OR sender_name LIKE '%Max%'").run(profMaxPhoto);
    } catch {}
  } catch (err) {
    console.error('[SQLite DB] Failed to sync CERESC data:', err);
  }
}

// Seed initial users and core data if users table is empty
function seedInitialData() {
  const userCountStmt = db.prepare('SELECT COUNT(*) as count FROM users');
  const result = userCountStmt.get() as { count: number };

  if (result && result.count > 0) {
    return; // Already initialized
  }

  console.log('[SQLite DB] Seeding initial users and production data...');

  // Seed Users
  // Prof. Max (Coach)
  const maxCreds = hashPassword('max@2026');
  // Adilson Bernardo Gomes (Athlete)
  const adilsonCreds = hashPassword('adilson@2026');
  // Visitante (Guest test user)
  const visitanteCreds = hashPassword('visitante@2026');

  const insertUser = db.prepare(`
    INSERT INTO users (id, username, password_hash, salt, name, nickname, email, role, avatar, is_minor, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(
    'usr-max',
    'max',
    maxCreds.hash,
    maxCreds.salt,
    'Professor Max',
    'Prof. Max',
    'max@tmguacu.com.br',
    'treinador',
    '/assets/aistudio/Gemini_Generated_Image_si6kkasi6kkasi6k_c5b33fbe.jpeg',
    0,
    new Date().toISOString()
  );

  insertUser.run(
    'usr-adilson',
    'adilson',
    adilsonCreds.hash,
    adilsonCreds.salt,
    'Adilson Bernardo Gomes',
    'Adilson',
    'adilson@tmguacu.com.br',
    'atleta',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    0,
    new Date().toISOString()
  );

  insertUser.run(
    'usr-visitante',
    'visitante',
    visitanteCreds.hash,
    visitanteCreds.salt,
    'Visitante Comunitário',
    'Visitante',
    'visitante@tmguacu.com.br',
    'visitante',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    0,
    new Date().toISOString()
  );

  // Seed Notices
  const insertNotice = db.prepare(`
    INSERT INTO notices (id, title, body, author_id, author_name, author_role, published_at, published_at_iso, expires_at, expires_at_iso, category, is_urgent, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertNotice.run(
    'not-mogi-mirim',
    'Aviso Oficial: Campeonato em Mogi Mirim no dia 24/10',
    'Atenção atletas da equipe de Mogi Guaçu: neste sábado (24/10) disputaremos o Campeonato em Mogi Mirim. Todos os convocados devem confirmar presença com o Prof. Max até quinta-feira.',
    'usr-max',
    'Prof. Max',
    'Treinador Titular - Mogi Guaçu',
    '21/10/2026',
    '2026-10-21T09:00:00-03:00',
    '25/10/2026',
    '2026-10-25T23:59:59-03:00',
    'Torneio',
    1,
    'Ativo'
  );

  insertNotice.run(
    'not-ourinhos',
    'Aviso Oficial: Campeonato em Ourinhos - SP no dia 31/10',
    'Programação de viagem: no sábado dia 31/10 nossa delegação de Mogi Guaçu competirá no Campeonato em Ourinhos - SP. Categorias Adulto, Sub-19 e Veteranos. Preparem o material de jogo homologado pela ITTF!',
    'usr-max',
    'Prof. Max',
    'Treinador Titular - Mogi Guaçu',
    '21/10/2026',
    '2026-10-21T10:15:00-03:00',
    '01/11/2026',
    '2026-11-01T23:59:59-03:00',
    'Torneio',
    1,
    'Ativo'
  );

  insertNotice.run(
    'not-03',
    'Manutenção programada na Mesa 3 e rede',
    'A mesa 3 passará por nivelamento e troca de suporte de rede nesta quinta-feira entre 14h e 16h. As demais mesas estarão liberadas normalmente.',
    'usr-max',
    'Prof. Max',
    'Comissão Técnica',
    '18/10/2026',
    '2026-10-18T14:00:00-03:00',
    '25/10/2026',
    '2026-10-25T18:00:00-03:00',
    'Manutenção',
    0,
    'Ativo'
  );

  // Seed Events
  const insertEvent = db.prepare(`
    INSERT INTO events (id, title, type, date_display, date_iso, time_str, location, city, organizer, status, registration_deadline_iso, categories_json, official_link, last_verified_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertEvent.run(
    'evt-mogi-mirim',
    'Campeonato Regional em Mogi Mirim',
    'Campeonato Regional',
    '24/Out/2026',
    '2026-10-24T08:30:00-03:00',
    '08:30',
    'Ginásio de Esportes de Mogi Mirim',
    'Mogi Mirim - SP',
    'Liga Regional de Tênis de Mesa',
    'Inscrições Abertas',
    '2026-10-23T18:00:00-03:00',
    JSON.stringify(['Sub-15', 'Sub-19', 'Adulto', 'Veteranos']),
    'https://cbtm.org.br',
    '21/10/2026'
  );

  insertEvent.run(
    'evt-ourinhos',
    'Campeonato Regional de Tênis de Mesa em Ourinhos - SP',
    'Campeonato Regional',
    '31/Out/2026',
    '2026-10-31T09:00:00-03:00',
    '09:00',
    'Centro Esportivo Municipal de Ourinhos',
    'Ourinhos - SP',
    'Comissão Organizadora Regional do Interior',
    'Confirmado',
    '2026-10-29T23:59:59-03:00',
    JSON.stringify(['Livre', 'Adulto', 'Sub-19', 'Veteranos']),
    'https://ftmsp.com.br',
    '21/10/2026'
  );

  insertEvent.run(
    'evt-ceresc-segunda',
    'Treinamento Oficial - Segunda-Feira (CERESC)',
    'Treinamento',
    'Segunda-Feira',
    '2026-10-26T09:00:00-03:00',
    '09h às 12h e 14h às 18h',
    'CERESC (Centro Esportivo dos Servidores e Comunidade)',
    'Mogi Guaçu - SP',
    'Secretaria de Esporte e Lazer & Prefeitura de Mogi Guaçu',
    'Confirmado',
    null,
    JSON.stringify(['Treinamento Competitivo', 'Aperfeiçoamento Técnico']),
    'https://wa.me/5519998544817',
    '26/10/2026'
  );

  insertEvent.run(
    'evt-ceresc-ter-qui',
    'Iniciação Esportiva - Terça e Quinta-Feira (CERESC)',
    'Treinamento',
    'Terça e Quinta-Feira',
    '2026-10-27T09:00:00-03:00',
    '09h às 12h, 14h às 18h e 19h às 21h',
    'CERESC (Centro Esportivo dos Servidores e Comunidade)',
    'Mogi Guaçu - SP',
    'Secretaria de Esporte e Lazer & Prefeitura de Mogi Guaçu',
    'Confirmado',
    null,
    JSON.stringify(['Iniciação', 'Aulas Abertas à Comunidade', 'Turma Noturna']),
    'https://wa.me/5519998544817',
    '26/10/2026'
  );

  insertEvent.run(
    'evt-ceresc-sexta',
    'Treinamento Oficial - Sexta-Feira (CERESC)',
    'Treinamento',
    'Sexta-Feira',
    '2026-10-30T09:00:00-03:00',
    '09h às 12h e 13h às 15h',
    'CERESC (Centro Esportivo dos Servidores e Comunidade)',
    'Mogi Guaçu - SP',
    'Secretaria de Esporte e Lazer & Prefeitura de Mogi Guaçu',
    'Confirmado',
    null,
    JSON.stringify(['Treinamento Tático', 'Equipe Municipal']),
    'https://wa.me/5519998544817',
    '26/10/2026'
  );

  // Seed Attendances
  const insertAttendance = db.prepare(`
    INSERT INTO attendances (id, event_id, user_id, athlete_name, athlete_nickname, category, transport_need, confirmed_at, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAttendance.run(
    'att-01',
    'evt-mogi-mirim',
    'usr-adilson',
    'Adilson Bernardo Gomes',
    'Adilson',
    'Adulto • Equipe Mogi Guaçu',
    'Van da Equipe',
    '21/10/2026',
    'Confirmado pelo Prof. Max'
  );

  insertAttendance.run(
    'att-05',
    'evt-ourinhos',
    'usr-adilson',
    'Adilson Bernardo Gomes',
    'Adilson',
    'Adulto • Equipe Mogi Guaçu',
    'Van da Equipe',
    '21/10/2026',
    'Confirmado pelo Prof. Max'
  );

  // Seed Chat
  const insertChat = db.prepare(`
    INSERT INTO chat_messages (id, channel_id, user_id, sender_name, sender_role, sender_avatar, timestamp_display, text, is_official, created_at_iso)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertChat.run(
    'msg-01',
    'avisos-treinador',
    'usr-max',
    'Prof. Max',
    'treinador',
    '/assets/aistudio/Gemini_Generated_Image_si6kkasi6kkasi6k_c5b33fbe.jpeg',
    'Hoje às 09:15',
    'Atenção convocados para a etapa de Mogi Mirim (24/10) e Ourinhos - SP (31/10): cheguem 15 minutos antes ao treino para alinharmos os saques e a devolução de banana flick.',
    1,
    new Date().toISOString()
  );

  insertChat.run(
    'msg-02',
    'geral',
    'usr-adilson',
    'Adilson Bernardo Gomes',
    'atleta',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    'Hoje às 10:40',
    'Olá Prof. Max e equipe! Chegarei 20 minutos antes para aquecer o forehand topspin na mesa 1.',
    0,
    new Date().toISOString()
  );

  // Seed Drill History for Adilson
  const insertDrill = db.prepare(`
    INSERT INTO drill_history (id, user_id, athlete_name, drill_id, drill_title, completed_at_iso, duration_seconds, sets_completed, rest_duration_seconds, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertDrill.run(
    'dh-01',
    'usr-adilson',
    'Adilson Bernardo Gomes',
    'drill-fh-regularidade',
    'Regularidade de Forehand Cruzado',
    '2026-10-20T19:35:00-03:00',
    720,
    4,
    180,
    'Boa consistência e postura estável na diagonal.'
  );

  seedAthleteProfiles();

  console.log('[SQLite DB] Database seeded successfully.');
}

export function seedAthleteProfiles() {
  try {
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM athlete_profiles');
    const result = countStmt.get() as { count: number };
    if (result && result.count > 0) return;

    const insertProf = db.prepare(`
      INSERT INTO athlete_profiles (id, user_id, display_name, approved_nickname, category, level, years_playing, favorite_shot, grip_type, achievements_json, birth_month, birth_day, avatar_url, consent_granted, updated_at_iso)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const nowISO = new Date().toISOString();

    insertProf.run(
      'ath-adilson',
      'usr-adilson',
      'Adilson Bernardo Gomes',
      'Adilson',
      'Adulto • Representação Municipal',
      'Intermediário',
      '4 anos de prática',
      'Topspin de Forehand Cruzado',
      'Clássica (Shakehand)',
      JSON.stringify(['Vice-Campeão Regional 2025', 'Medalhista de Prata nos Jogos Regionais por Equipes']),
      'Novembro',
      14,
      '',
      1,
      nowISO
    );

    insertProf.run(
      'ath-max',
      'usr-max',
      'Professor Max',
      'Prof. Max',
      'Treinador & Coordenação Técnica',
      'Avançado',
      '18 anos de experiência',
      'Terceira Bola e Bloqueio Ativo',
      'Clássica (Shakehand)',
      JSON.stringify(['Técnico Nível 2 ITTF', 'Coordenador da Equipe Municipal de Mogi Guaçu']),
      'Julho',
      8,
      '/assets/aistudio/Gemini_Generated_Image_si6kkasi6kkasi6k_c5b33fbe.jpeg',
      1,
      nowISO
    );
  } catch (e) {
    console.error('Error seeding athlete profiles:', e);
  }
}

