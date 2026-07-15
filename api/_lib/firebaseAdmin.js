const admin = require('firebase-admin');

// Inicializa Firebase Admin SDK una sola vez, reutilizando variables de entorno
// configuradas en Vercel (Project Settings > Environment Variables).
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Vercel guarda saltos de línea como "\n" literales; hay que restaurarlos.
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
}

// Cuentas con permiso de administrador (deben coincidir con ADMINS en index.html).
const ADMIN_EMAILS = ['obueno@orocash.ec', 'dchoez@orocash.ec'];

/**
 * Verifica el token de Firebase Auth que debe venir en el header
 * "Authorization: Bearer <idToken>" y confirma que pertenece a un admin.
 */
async function requireAdmin(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    const err = new Error('Falta el token de autenticación.');
    err.statusCode = 401;
    throw err;
  }
  const decoded = await admin.auth().verifyIdToken(token);
  if (!ADMIN_EMAILS.includes((decoded.email || '').toLowerCase())) {
    const err = new Error('Esta acción requiere permisos de administrador.');
    err.statusCode = 403;
    throw err;
  }
  return decoded;
}

module.exports = { admin, requireAdmin, ADMIN_EMAILS };
