const { admin, requireAdmin } = require('./_lib/firebaseAdmin');

// POST /api/reset-password
// Body: { email, newPassword }
// Header: Authorization: Bearer <idToken de un admin logueado con Firebase Auth>
//
// Permite a un administrador (Omairo o David) resetear la contraseña de
// cualquier empleado sin exponer contraseñas en el código ni en la base de datos.
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido.' });
    return;
  }

  try {
    await requireAdmin(req);

    const { email, newPassword } = req.body || {};
    if (!email || !newPassword) {
      res.status(400).json({ error: 'Faltan campos requeridos: email, newPassword.' });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    const userRecord = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(userRecord.uid, { password: newPassword });

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Error interno.' });
  }
};
