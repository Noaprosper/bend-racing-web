import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';

const app = express();
app.use(cors());
app.use(express.json({ limit: '30mb' }));

const SCW_SECRET_KEY = process.env.SCW_SECRET_KEY;
const SCW_PROJECT_ID = process.env.SCW_PROJECT_ID;
const SCW_REGION = process.env.SCW_REGION || 'fr-par';
const TO_EMAILS = (process.env.TO_EMAIL || process.env.TO_EMAILS || 'contact@bend-racing.fr')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean);
const FROM_EMAIL = process.env.FROM_EMAIL || 'rdv@rdv.bend-racing.fr';
const FROM_EMAIL_REPRISE = process.env.FROM_EMAIL_REPRISE || 'reprise@reprise.bend-racing.fr';
const FROM_EMAIL_DEVIS = process.env.FROM_EMAIL_DEVIS || FROM_EMAIL;

// =========================
// Admin + stockage véhicules
// =========================
const VEHICULES_ADMIN_USER = process.env.VEHICULES_ADMIN_USER;
const VEHICULES_ADMIN_PASSWORD = process.env.VEHICULES_ADMIN_PASSWORD;
const VEHICULES_BASE_DIR = process.env.VEHICULES_BASE_DIR || '/data/vehicules';
const VEHICULES_DB_PATH = path.join(VEHICULES_BASE_DIR, 'vehicles.json');
const VEHICULES_UPLOAD_DIR = path.join(VEHICULES_BASE_DIR, 'uploads');

// Réalisations (même auth admin)
const REALISATIONS_BASE_DIR = process.env.REALISATIONS_BASE_DIR || '/data/realisations';
const REALISATIONS_DB_PATH = path.join(REALISATIONS_BASE_DIR, 'realisations.json');
const REALISATIONS_UPLOAD_DIR = path.join(REALISATIONS_BASE_DIR, 'uploads');

async function initVehiculesStorage() {
  await fs.mkdir(VEHICULES_BASE_DIR, { recursive: true });
  await fs.mkdir(VEHICULES_UPLOAD_DIR, { recursive: true });
}

async function initRealisationsStorage() {
  await fs.mkdir(REALISATIONS_BASE_DIR, { recursive: true });
  await fs.mkdir(REALISATIONS_UPLOAD_DIR, { recursive: true });
}

async function readVehiclesFromDisk() {
  try {
    const raw = await fs.readFile(VEHICULES_DB_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.vehicles)) return [];
    return parsed.vehicles;
  } catch (err) {
    // Dossier/premier démarrage : pas de fichier encore
    if (err && err.code === 'ENOENT') return [];
    console.error('readVehiclesFromDisk error:', err);
    return [];
  }
}

async function writeVehiclesToDisk(vehicles) {
  const tmp = `${VEHICULES_DB_PATH}.tmp`;
  await fs.writeFile(tmp, JSON.stringify({ vehicles }, null, 2), 'utf8');
  await fs.rename(tmp, VEHICULES_DB_PATH);
}

async function readRealisationsFromDisk() {
  try {
    const raw = await fs.readFile(REALISATIONS_DB_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.realisations)) return [];
    return parsed.realisations;
  } catch (err) {
    if (err && err.code === 'ENOENT') return [];
    console.error('readRealisationsFromDisk error:', err);
    return [];
  }
}

async function writeRealisationsToDisk(realisations) {
  const tmp = `${REALISATIONS_DB_PATH}.tmp`;
  await fs.writeFile(tmp, JSON.stringify({ realisations }, null, 2), 'utf8');
  await fs.rename(tmp, REALISATIONS_DB_PATH);
}

function timingSafeEq(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function requireVehiculesAdmin(req, res, next) {
  if (!VEHICULES_ADMIN_USER || !VEHICULES_ADMIN_PASSWORD) {
    console.error('Vehicules admin auth: config manquante (VEHICULES_ADMIN_USER/PASSWORD)');
    return res.status(500).json({ error: 'Config admin véhicules manquante' });
  }

  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Basic ')) {
    console.warn('Vehicules admin auth failed: missing/invalid Authorization header');
    res.setHeader('WWW-Authenticate', 'Basic realm="vehicules-admin"');
    return res.status(401).json({ error: 'Non autorisé' });
  }

  let decoded;
  try {
    decoded = Buffer.from(auth.slice(6), 'base64').toString('utf8');
  } catch {
    console.warn('Vehicules admin auth failed: invalid base64');
    res.setHeader('WWW-Authenticate', 'Basic realm="vehicules-admin"');
    return res.status(401).json({ error: 'Non autorisé' });
  }

  const idx = decoded.indexOf(':');
  const user = idx >= 0 ? decoded.slice(0, idx) : decoded;
  const pass = idx >= 0 ? decoded.slice(idx + 1) : '';

  // Ne loggue jamais le mot de passe
  // (on loggue juste l'identifiant fourni pour diagnostiquer un mismatch)
  console.warn('Vehicules admin auth attempt user=', user);

  const ok = timingSafeEq(user, VEHICULES_ADMIN_USER) && timingSafeEq(pass, VEHICULES_ADMIN_PASSWORD);
  if (!ok) {
    console.warn('Vehicules admin auth failed: credentials mismatch');
    res.setHeader('WWW-Authenticate', 'Basic realm="vehicules-admin"');
    return res.status(401).json({ error: 'Identifiants invalides' });
  }

  next();
}

function toSafeString(v) {
  return typeof v === 'string' ? v.trim() : '';
}

function toOptionalNumber(v) {
  if (v === undefined || v === null) return undefined;
  const s = String(v).trim();
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

async function saveVehiclePhotos(vehicleId, photoAttachments) {
  if (!photoAttachments || photoAttachments.length === 0) return [];

  const vehicleDir = path.join(VEHICULES_UPLOAD_DIR, vehicleId);
  await fs.mkdir(vehicleDir, { recursive: true });

  const photosMeta = [];
  for (let i = 0; i < photoAttachments.length; i++) {
    const att = photoAttachments[i];
    if (!att || !att.name || !att.content) continue;

    const fileName = `${i + 1}-${path.basename(att.name)}`;
    const filePath = path.join(vehicleDir, fileName);
    const buf = Buffer.from(att.content, 'base64');
    await fs.writeFile(filePath, buf);

    photosMeta.push({ filename: fileName, type: att.type || 'image/jpeg' });
  }

  return photosMeta;
}

async function saveRealisationPhotos(realisationId, photoAttachments) {
  if (!photoAttachments || photoAttachments.length === 0) return [];

  const dir = path.join(REALISATIONS_UPLOAD_DIR, realisationId);
  await fs.mkdir(dir, { recursive: true });

  const photosMeta = [];
  for (let i = 0; i < photoAttachments.length; i++) {
    const att = photoAttachments[i];
    if (!att || !att.name || !att.content) continue;

    const fileName = `${i + 1}-${path.basename(att.name)}`;
    const filePath = path.join(dir, fileName);
    const buf = Buffer.from(att.content, 'base64');
    await fs.writeFile(filePath, buf);
    photosMeta.push({ filename: fileName, type: att.type || 'image/jpeg' });
  }

  return photosMeta;
}

const TEM_API = `https://api.scaleway.com/transactional-email/v1alpha1/regions/${SCW_REGION}/emails`;

function temErrorDetail(json) {
  if (typeof json?.message === 'string') return json.message;
  if (typeof json?.error === 'string') return json.error;
  if (Array.isArray(json?.details)) {
    return json.details.map((d) => d?.message || d).filter(Boolean).join(' — ');
  }
  return undefined;
}

async function sendTem(payload) {
  const r = await fetch(TEM_API, {
    method: 'POST',
    headers: {
      'X-Auth-Token': SCW_SECRET_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const json = await r.json();
  return { ok: r.ok, status: r.status, json };
}

function ensureSubjectMin10(subject, fallback) {
  const s = subject.trim();
  if (s.length >= 10) return s;
  return fallback;
}

function buildRdvEmailBody(data) {
  const typeLabel = { entretien: 'Entretien', reparation: 'Réparation', diagnostic: 'Diagnostic', preparation: 'Préparation moteur' }[data.type] || data.type;
  return `
Nouvelle demande de rendez-vous – Bend Racing

Type d'intervention : ${typeLabel}
Date : ${data.date || 'Non renseignée'}
Heure : ${data.heure || 'Non renseignée'}
Moto : ${data.moto || 'Non renseignée'}

Client :
- Nom : ${data.nom || 'Non renseigné'}
- Email : ${data.email || 'Non renseigné'}
- Téléphone : ${data.telephone || 'Non renseigné'}

Description :
${data.description || 'Aucune description.'}
  `.trim();
}

function buildRdvEmailHtml(data) {
  const typeLabel = { entretien: 'Entretien', reparation: 'Réparation', diagnostic: 'Diagnostic', preparation: 'Préparation moteur' }[data.type] || data.type;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body{font-family:sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}table{width:100%;border-collapse:collapse}td{padding:8px 0;border-bottom:1px solid #eee}.label{font-weight:bold;color:#666;width:140px}h1{color:#dc2626;font-size:1.3em}</style></head>
<body>
  <h1>Nouvelle demande de rendez-vous</h1>
  <table>
    <tr><td class="label">Type</td><td>${typeLabel}</td></tr>
    <tr><td class="label">Date</td><td>${data.date || '-'}</td></tr>
    <tr><td class="label">Heure</td><td>${data.heure || '-'}</td></tr>
    <tr><td class="label">Moto</td><td>${data.moto || '-'}</td></tr>
    <tr><td class="label">Nom</td><td>${data.nom || '-'}</td></tr>
    <tr><td class="label">Email</td><td>${data.email ? `<a href="mailto:${data.email}">${data.email}</a>` : '-'}</td></tr>
    <tr><td class="label">Téléphone</td><td>${data.telephone ? `<a href="tel:${data.telephone}">${data.telephone}</a>` : '-'}</td></tr>
  </table>
  <p><strong>Description :</strong></p>
  <p>${(data.description || 'Aucune.').replace(/\n/g, '<br>')}</p>
  <p style="margin-top:24px;font-size:12px;color:#999;">Envoyé depuis bend-racing.fr/rendez-vous</p>
</body>
</html>
  `.trim();
}

function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildRepriseEmailBody(data, photoCount) {
  return `
Demande de reprise moto – Bend Racing

Contact :
- Prénom : ${data.prenom || ''}
- Nom : ${data.nom || ''}
- Téléphone : ${data.telephone || ''}
- Email : ${data.email || 'Non renseigné'}

Véhicule :
- Modèle : ${data.modele || 'Non renseigné'}
- Kilométrage : ${data.kilometrage || 'Non renseigné'}

Message :
${data.message || 'Aucun message.'}

Photos jointes : ${photoCount > 0 ? `${photoCount} fichier(s)` : 'aucune'}
  `.trim();
}

function buildRepriseEmailHtml(data, photoCount) {
  const p = escapeHtml(data.prenom);
  const n = escapeHtml(data.nom);
  const telRaw = data.telephone || '';
  const telDisplay = escapeHtml(telRaw);
  const telHref = String(telRaw).replace(/[^\d+]/g, '') || telRaw;
  const em = data.email ? `<a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a>` : '-';
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body{font-family:sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}table{width:100%;border-collapse:collapse}td{padding:8px 0;border-bottom:1px solid #eee}.label{font-weight:bold;color:#666;width:160px}h1{color:#dc2626;font-size:1.3em}</style></head>
<body>
  <h1>Demande de reprise moto</h1>
  <table>
    <tr><td class="label">Prénom</td><td>${p}</td></tr>
    <tr><td class="label">Nom</td><td>${n}</td></tr>
    <tr><td class="label">Téléphone</td><td>${telRaw ? `<a href="tel:${escapeHtml(telHref)}">${telDisplay}</a>` : '-'}</td></tr>
    <tr><td class="label">Email</td><td>${em}</td></tr>
    <tr><td class="label">Modèle</td><td>${escapeHtml(data.modele) || '-'}</td></tr>
    <tr><td class="label">Kilométrage</td><td>${escapeHtml(data.kilometrage) || '-'}</td></tr>
  </table>
  <p><strong>Message :</strong></p>
  <p>${(escapeHtml(data.message) || 'Aucun.').replace(/\n/g, '<br>')}</p>
  <p><strong>Photos :</strong> ${photoCount > 0 ? `${photoCount} pièce(s) jointe(s)` : 'aucune'}</p>
  <p style="margin-top:24px;font-size:12px;color:#999;">Envoyé depuis bend-racing.fr/vehicules</p>
</body>
</html>
  `.trim();
}

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);
const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_BYTES = 1_900_000;

function normalizeAttachments(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  const out = [];
  for (let i = 0; i < Math.min(raw.length, MAX_ATTACHMENTS); i++) {
    const a = raw[i];
    if (!a || typeof a.content !== 'string') continue;
    const type = typeof a.type === 'string' ? a.type.toLowerCase() : 'image/jpeg';
    if (!ALLOWED_IMAGE_TYPES.has(type)) continue;
    let buf;
    try {
      buf = Buffer.from(a.content, 'base64');
    } catch {
      continue;
    }
    if (buf.length === 0 || buf.length > MAX_ATTACHMENT_BYTES) continue;
    const name = String(a.name || `photo-${i + 1}.jpg`).replace(/[^\w.\-]+/g, '_').slice(0, 120);
    out.push({ name, type, content: buf.toString('base64') });
  }
  return out;
}

app.post('/api/rdv', async (req, res) => {
  if (!SCW_SECRET_KEY || !SCW_PROJECT_ID) {
    console.error('Missing SCW_SECRET_KEY or SCW_PROJECT_ID');
    return res.status(500).json({ error: 'Configuration serveur manquante' });
  }

  const data = req.body;
  if (!data.nom || !data.email) {
    return res.status(400).json({ error: 'Nom et email requis' });
  }

  let subject = `[RDV] ${data.nom} – ${data.type || 'Demande'} – ${data.date || 'Date à confirmer'}`;
  subject = ensureSubjectMin10(subject, `[RDV Bend Racing] Demande de rendez-vous – ${data.nom}`);

  const payload = {
    from: { name: 'Bend Racing – Rendez-vous', email: FROM_EMAIL },
    to: TO_EMAILS.map((email) => ({ name: 'Bend Racing', email })),
    subject,
    text: buildRdvEmailBody(data),
    html: buildRdvEmailHtml(data),
    project_id: SCW_PROJECT_ID,
    additional_headers: data.email ? [{ key: 'Reply-To', value: data.email }] : [],
  };

  try {
    const { ok, json } = await sendTem(payload);
    if (!ok) {
      console.error('TEM API error (rdv):', JSON.stringify(json));
      const detail = temErrorDetail(json);
      const safeDetail = detail && detail.length <= 300 ? detail : detail?.slice(0, 297) + '…';
      return res.status(502).json({
        error: "Erreur lors de l'envoi de l'email",
        ...(safeDetail ? { details: safeDetail } : {}),
      });
    }
    res.json({ success: true, message: 'Demande envoyée avec succès' });
  } catch (err) {
    console.error('Error sending email (rdv):', err);
    res.status(500).json({ error: "Erreur serveur lors de l'envoi" });
  }
});

app.post('/api/reprise', async (req, res) => {
  if (!SCW_SECRET_KEY || !SCW_PROJECT_ID) {
    console.error('Missing SCW_SECRET_KEY or SCW_PROJECT_ID');
    return res.status(500).json({ error: 'Configuration serveur manquante' });
  }

  const data = req.body || {};
  const prenom = typeof data.prenom === 'string' ? data.prenom.trim() : '';
  const nom = typeof data.nom === 'string' ? data.nom.trim() : '';
  const telephone = typeof data.telephone === 'string' ? data.telephone.trim() : '';
  const email = typeof data.email === 'string' ? data.email.trim() : '';

  if (!prenom || !nom || !telephone) {
    return res.status(400).json({ error: 'Prénom, nom et téléphone sont obligatoires' });
  }

  const attachments = normalizeAttachments(data.attachments);
  const photoCount = attachments.length;

  let subject = `[Reprise] ${prenom} ${nom} – ${data.modele || 'Demande moto'}`;
  subject = ensureSubjectMin10(subject, `[Reprise Bend Racing] ${prenom} ${nom}`);

  const payload = {
    from: { name: 'Bend Racing – Reprise', email: FROM_EMAIL_REPRISE },
    to: TO_EMAILS.map((e) => ({ name: 'Bend Racing', email: e })),
    subject,
    text: buildRepriseEmailBody(
      { ...data, prenom, nom, telephone, email },
      photoCount,
    ),
    html: buildRepriseEmailHtml(
      { ...data, prenom, nom, telephone, email },
      photoCount,
    ),
    project_id: SCW_PROJECT_ID,
    additional_headers: email ? [{ key: 'Reply-To', value: email }] : [],
  };

  if (attachments.length > 0) {
    payload.attachments = attachments;
  }

  try {
    const { ok, json } = await sendTem(payload);
    if (!ok) {
      console.error('TEM API error (reprise):', JSON.stringify(json));
      const detail = temErrorDetail(json);
      const safeDetail = detail && detail.length <= 300 ? detail : detail?.slice(0, 297) + '…';
      return res.status(502).json({
        error: "Erreur lors de l'envoi de l'email",
        ...(safeDetail ? { details: safeDetail } : {}),
      });
    }
    res.json({ success: true, message: 'Demande de reprise envoyée' });
  } catch (err) {
    console.error('Error sending email (reprise):', err);
    res.status(500).json({ error: "Erreur serveur lors de l'envoi" });
  }
});

app.post('/api/devis', async (req, res) => {
  if (!SCW_SECRET_KEY || !SCW_PROJECT_ID) {
    console.error('Missing SCW_SECRET_KEY or SCW_PROJECT_ID');
    return res.status(500).json({ error: 'Configuration serveur manquante' });
  }

  const data = req.body || {};

  const prenom = typeof data.prenom === 'string' ? data.prenom.trim() : '';
  const nom = typeof data.nom === 'string' ? data.nom.trim() : '';
  const telephone = typeof data.telephone === 'string' ? data.telephone.trim() : '';
  const email = typeof data.email === 'string' ? data.email.trim() : '';
  const vehicule = typeof data.vehicule === 'string' ? data.vehicule.trim() : '';
  const commentaire = typeof data.commentaire === 'string' ? data.commentaire.trim() : '';

  const operation = typeof data.operation === 'string' ? data.operation.trim() : '';
  const operation_autre = typeof data.operation_autre === 'string' ? data.operation_autre.trim() : '';

  if (!prenom || !nom) {
    return res.status(400).json({ error: 'Prénom et nom requis' });
  }
  if (!operation) {
    return res.status(400).json({ error: 'Type d’opération requis' });
  }
  if (operation === 'autre' && !operation_autre) {
    return res.status(400).json({ error: 'Précisez l’opération « Autre »' });
  }
  if (!vehicule) {
    return res.status(400).json({ error: 'Véhicule requis' });
  }

  if (!telephone && !email) {
    return res.status(400).json({ error: 'Téléphone ou email requis' });
  }

  const attachments = normalizeAttachments(data.attachments);
  const photoCount = attachments.length;

  const operationLabelByValue = {
    revision: 'Révision',
    vidange: 'Vidange',
    freinage: 'Freinage (plaquettes/disques)',
    pneus: 'Pneus',
    kit_chaine: 'Kit chaîne',
    embrayage: 'Embrayage',
    suspension: 'Suspension',
    injection: 'Injection / réglage injection',
    diagnostic: 'Diagnostic',
    reparation: 'Réparation mécanique',
    preparation: 'Préparation moteur / performance',
    autre: 'Autre',
  };

  const operationLabel =
    operation === 'autre' ? operation_autre : (operationLabelByValue[operation] || operation);

  const subject = ensureSubjectMin10(
    `[DEVIS] ${prenom} ${nom} – ${operationLabel}`,
    `[DEVIS Bend Racing] Demande de devis – ${prenom} ${nom}`,
  );

  const text = `
Demande de devis – Bend Racing

Client :
- Prénom : ${prenom}
- Nom : ${nom}
- Téléphone : ${telephone || '-'}
- Email : ${email || '-'}

Opération : ${operationLabel}
Véhicule : ${vehicule}

Commentaire :
${commentaire || '-'}

Photos jointes : ${photoCount > 0 ? `${photoCount} fichier(s)` : 'aucune'}
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body{font-family:sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}
    table{width:100%;border-collapse:collapse}
    td{padding:8px 0;border-bottom:1px solid #eee}
    .label{font-weight:bold;color:#666;width:170px}
    h1{color:#dc2626;font-size:1.3em}
  </style>
</head>
<body>
  <h1>Demande de devis</h1>
  <table>
    <tr><td class="label">Prénom</td><td>${escapeHtml(prenom)}</td></tr>
    <tr><td class="label">Nom</td><td>${escapeHtml(nom)}</td></tr>
    <tr><td class="label">Téléphone</td><td>${telephone ? `<a href="tel:${escapeHtml(telephone)}">${escapeHtml(telephone)}</a>` : '-'}</td></tr>
    <tr><td class="label">Email</td><td>${email ? `<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>` : '-'}</td></tr>
    <tr><td class="label">Opération</td><td>${escapeHtml(operationLabel)}</td></tr>
    <tr><td class="label">Véhicule</td><td>${escapeHtml(vehicule)}</td></tr>
  </table>
  <p><strong>Commentaire :</strong></p>
  <p>${(escapeHtml(commentaire) || '-').replace(/\\n/g, '<br>')}</p>
  <p><strong>Photos :</strong> ${photoCount > 0 ? `${photoCount} pièce(s) jointe(s)` : 'aucune'}</p>
  <p style="margin-top:24px;font-size:12px;color:#999;">Envoyé depuis bend-racing.fr/devis</p>
</body>
</html>
  `.trim();

  const payload = {
    from: { name: 'Bend Racing – Devis', email: FROM_EMAIL_DEVIS },
    to: TO_EMAILS.map((e) => ({ name: 'Bend Racing', email: e })),
    subject,
    text,
    html,
    project_id: SCW_PROJECT_ID,
    additional_headers: email ? [{ key: 'Reply-To', value: email }] : [],
  };

  if (attachments.length > 0) {
    payload.attachments = attachments;
  }

  try {
    const { ok, json } = await sendTem(payload);
    if (!ok) {
      console.error('TEM API error (devis):', JSON.stringify(json));
      const detail = temErrorDetail(json);
      const safeDetail = detail && detail.length <= 300 ? detail : detail?.slice(0, 297) + '…';
      return res.status(502).json({
        error: "Erreur lors de l'envoi de l'email",
        ...(safeDetail ? { details: safeDetail } : {}),
      });
    }
    res.json({ success: true, message: 'Demande de devis envoyée' });
  } catch (err) {
    console.error('Error sending email (devis):', err);
    res.status(500).json({ error: "Erreur serveur lors de l'envoi" });
  }
});

// =========================
// API véhicules (public + admin)
// =========================
app.get('/api/vehicles', async (_, res) => {
  await initVehiculesStorage();
  const vehicles = await readVehiclesFromDisk();
  const normalized = vehicles.map((v) => {
    const photos = Array.isArray(v.photos) ? v.photos : [];
    return {
      ...v,
      photos: photos.map((p) => ({
        filename: p.filename,
        type: p.type,
        url: `/media/${v.id}/${encodeURIComponent(p.filename)}`,
      })),
    };
  });
  normalized.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  res.json({ vehicles: normalized });
});

app.get('/api/admin/vehicles', requireVehiculesAdmin, async (_, res) => {
  await initVehiculesStorage();
  const vehicles = await readVehiclesFromDisk();
  res.json({ vehicles });
});

app.post('/api/admin/vehicles', requireVehiculesAdmin, async (req, res) => {
  const data = req.body || {};
  const marque = toSafeString(data.marque);
  const modele = toSafeString(data.modele);
  const kilometrage = toSafeString(data.kilometrage);
  const description = toSafeString(data.description);
  const annee = toOptionalNumber(data.annee);
  const prix = toSafeString(data.prix);
  const type = toSafeString(data.type);
  const photosInput = data.photos || data.attachments;

  if (!marque || !modele || !kilometrage || !description) {
    return res.status(400).json({ error: 'Champs obligatoires manquants (marque, modele, kilometrage, description)' });
  }

  await initVehiculesStorage();
  const vehicles = await readVehiclesFromDisk();

  const vehicleId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const photoAttachments = normalizeAttachments(photosInput);
  const photosMeta = await saveVehiclePhotos(vehicleId, photoAttachments);

  const vehicle = {
    id: vehicleId,
    createdAt,
    marque,
    modele,
    annee,
    kilometrage,
    prix: prix || undefined,
    type: type || undefined,
    description,
    photos: photosMeta,
  };

  vehicles.push(vehicle);
  await writeVehiclesToDisk(vehicles);

  res.json({ success: true, vehicleId });
});

app.delete('/api/admin/vehicles/:vehicleId', requireVehiculesAdmin, async (req, res) => {
  const vehicleId = toSafeString(req.params.vehicleId);
  if (!vehicleId) {
    return res.status(400).json({ error: 'vehicleId manquant' });
  }

  console.log('Admin delete vehicle requested:', vehicleId);
  await initVehiculesStorage();
  const vehicles = await readVehiclesFromDisk();

  const idx = vehicles.findIndex((v) => v && v.id === vehicleId);
  if (idx === -1) {
    console.warn('Admin delete vehicle not found in vehicles.json:', vehicleId);
    return res.status(404).json({ error: 'Véhicule introuvable' });
  }

  // Retirer la fiche du JSON
  vehicles.splice(idx, 1);
  await writeVehiclesToDisk(vehicles);

  // Retirer les fichiers photo associés
  const vehicleDir = path.join(VEHICULES_UPLOAD_DIR, vehicleId);
  try {
    await fs.rm(vehicleDir, { recursive: true, force: true });
  } catch (err) {
    // Même si la suppression des fichiers échoue, on a déjà retiré la fiche.
    console.error('Erreur suppression photos véhicule:', err);
  }

  console.log('Admin delete vehicle done:', vehicleId);
  return res.json({ success: true });
});

// =========================
// API réalisations (public + admin)
// =========================
app.get('/api/realisations', async (_, res) => {
  await initRealisationsStorage();
  const realisations = await readRealisationsFromDisk();
  const normalized = realisations.map((r) => {
    const photos = Array.isArray(r.photos) ? r.photos : [];
    return {
      ...r,
      photos: photos.map((p) => ({
        filename: p.filename,
        type: p.type,
        url: `/media/realisations/${r.id}/${encodeURIComponent(p.filename)}`,
      })),
    };
  });
  normalized.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  res.json({ realisations: normalized });
});

app.get('/api/admin/realisations', requireVehiculesAdmin, async (_, res) => {
  await initRealisationsStorage();
  const realisations = await readRealisationsFromDisk();
  res.json({ realisations });
});

app.post('/api/admin/realisations', requireVehiculesAdmin, async (req, res) => {
  const data = req.body || {};
  const titre = toSafeString(data.titre);
  const description = toSafeString(data.description);
  const date = toSafeString(data.date);
  const photosInput = data.photos || data.attachments;

  if (!titre || !description) {
    return res.status(400).json({ error: 'Titre et description sont obligatoires' });
  }

  await initRealisationsStorage();
  const realisations = await readRealisationsFromDisk();

  const realisationId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const photoAttachments = normalizeAttachments(photosInput);
  const photosMeta = await saveRealisationPhotos(realisationId, photoAttachments);

  const realisation = {
    id: realisationId,
    createdAt,
    titre,
    description,
    date: date || undefined,
    photos: photosMeta,
  };

  realisations.push(realisation);
  await writeRealisationsToDisk(realisations);

  res.json({ success: true, realisationId });
});

app.delete('/api/admin/realisations/:realisationId', requireVehiculesAdmin, async (req, res) => {
  const realisationId = toSafeString(req.params.realisationId);
  if (!realisationId) return res.status(400).json({ error: 'realisationId manquant' });

  await initRealisationsStorage();
  const realisations = await readRealisationsFromDisk();
  const idx = realisations.findIndex((r) => r && r.id === realisationId);
  if (idx === -1) return res.status(404).json({ error: 'Réalisation introuvable' });

  realisations.splice(idx, 1);
  await writeRealisationsToDisk(realisations);

  const dir = path.join(REALISATIONS_UPLOAD_DIR, realisationId);
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch (err) {
    console.error('Erreur suppression photos réalisation:', err);
  }

  return res.json({ success: true });
});

// Photos réalisations
app.get('/media/realisations/:realisationId/:filename', async (req, res) => {
  const realisationId = toSafeString(req.params.realisationId);
  const filename = toSafeString(req.params.filename);
  const safeId = path.basename(realisationId);
  const safeFilename = path.basename(filename);

  const filePath = path.join(REALISATIONS_UPLOAD_DIR, safeId, safeFilename);
  if (!fsSync.existsSync(filePath)) return res.status(404).send('Not found');

  res.setHeader('Cache-Control', 'public, max-age=31536000');
  return res.sendFile(filePath);
});

// Serveur des photos uploadées (pour affichage sur /vehicules)
app.get('/media/:vehicleId/:filename', async (req, res) => {
  const vehicleId = toSafeString(req.params.vehicleId);
  const filename = toSafeString(req.params.filename);
  const safeVehicleId = path.basename(vehicleId);
  const safeFilename = path.basename(filename);

  const filePath = path.join(VEHICULES_UPLOAD_DIR, safeVehicleId, safeFilename);
  if (!fsSync.existsSync(filePath)) {
    return res.status(404).send('Not found');
  }

  res.setHeader('Cache-Control', 'public, max-age=31536000');
  return res.sendFile(filePath);
});

app.get('/api/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
