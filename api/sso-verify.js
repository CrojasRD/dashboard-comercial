// ══════════════════════════════════════════════════════════════════
//  SSO desde IGI — Vercel Function para OroCash Dashboard Comercial
//  ✅ Las credenciales NUNCA llegan al navegador
//  ✅ Verifica el token de IGI server-side
//  ✅ Genera un custom token de Firebase para obueno@orocash.ec
//
//  Variables de entorno requeridas en Vercel:
//    IGI_API_KEY         → API key del Firebase de IGI (plataforma-igi-6feeb)
//    FIREBASE_PROJECT_ID → orocash-dashboard
//    FIREBASE_CLIENT_EMAIL → firebase-adminsdk-fbsvc@orocash-dashboard.iam...
//    FIREBASE_PRIVATE_KEY  → -----BEGIN RSA PRIVATE KEY----- ...
// ══════════════════════════════════════════════════════════════════

const admin = require('firebase-admin');

const SSO_IGI_EMAIL = '8521@igi.ec';
const SSO_EMAIL     = 'obueno@orocash.ec';

function getAdminApp() {
  if (admin.apps.length > 0) return admin.apps[0];
  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const IGI_API_KEY = process.env.IGI_API_KEY;
  if (!IGI_API_KEY) return res.status(500).json({ error: 'IGI_API_KEY no configurado' });

  const { igiToken } = req.body || {};
  if (!igiToken) return res.status(400).json({ error: 'Token requerido' });

  try {
    // ── 1. Verificar token contra el Firebase de IGI ──────────────
    const verifyRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${IGI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: igiToken }),
      }
    );
    const verifyData = await verifyRes.json();
    const email = verifyData.users?.[0]?.email;

    if (email !== SSO_IGI_EMAIL) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    // ── 2. Buscar UID del usuario SSO ─────────────────────────────
    getAdminApp();
    const ssoUser = await admin.auth().getUserByEmail(SSO_EMAIL);

    // ── 3. Generar custom token (válido 1 hora) ───────────────────
    const customToken = await admin.auth().createCustomToken(ssoUser.uid);

    return res.status(200).json({ customToken });

  } catch (e) {
    console.error('SSO Comercial error:', e.message);
    return res.status(500).json({ error: 'Error interno' });
  }
};
