const { admin, requireAdmin } = require('./_lib/firebaseAdmin');

// POST /api/create-employee
// Body: { id, name, role, ini, col, badge, email, tempPassword, nav }
// Header: Authorization: Bearer <idToken de un admin logueado con Firebase Auth>
//
// Crea la cuenta de Firebase Auth del nuevo empleado, la registra en la colección
// pública "directory" (solo id -> email, para que el login sepa a qué email
// autenticar) y agrega su perfil completo a content/users. Esto requiere la
// clave de servicio de Firebase, por eso corre en el servidor (Vercel) y no
// en el navegador.
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido.' });
    return;
  }

  try {
    await requireAdmin(req);

    const { id, name, role, ini, col, badge, email, tempPassword, nav } = req.body || {};
    if (!id || !name || !email || !tempPassword) {
      res.status(400).json({ error: 'Faltan campos requeridos: id, name, email, tempPassword.' });
      return;
    }

    // 1) Crear la cuenta en Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password: tempPassword,
      displayName: name,
    });

    // 2) Registrar id -> email en el directorio público (para el mapeo usuario/login)
    await admin.firestore().collection('directory').doc(id).set({ email });

    // 3) Agregar el perfil completo a content/users
    const usersRef = admin.firestore().collection('content').doc('users');
    const snap = await usersRef.get();
    const items = snap.exists ? (snap.data().items || []) : [];
    const profile = { id, name, role: role || '—', ini: ini || name.slice(0, 2).toUpperCase(), col: col || '#475569', badge: !!badge, email, nav: nav || ['tablero', 'perfiles'] };
    const idx = items.findIndex((u) => u.id === id);
    if (idx >= 0) items[idx] = profile; else items.push(profile);
    await usersRef.set({ items });

    res.status(200).json({ ok: true, uid: userRecord.uid, profile });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Error interno.' });
  }
};
