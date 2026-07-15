// GET /api/health — endpoint simple para confirmar que las APIs de Vercel están activas.
module.exports = (req, res) => {
  res.status(200).json({ ok: true, service: 'orocash-dashboard-api', time: new Date().toISOString() });
};
