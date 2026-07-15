/**
 * scripts/seed.js
 *
 * Carga única de datos: crea las cuentas de Firebase Authentication de los
 * 13 empleados (con SUS MISMAS contraseñas actuales, para que nadie note el
 * cambio) y sube el contenido inicial del dashboard (tareas, ventas, pauta,
 * eventos, proyectos y perfiles de usuario) a Firestore.
 *
 * Uso:
 *   1) npm install
 *   2) Coloca tu clave de servicio de Firebase como serviceAccountKey.json
 *      en la raíz del proyecto (Firebase Console > Configuración del proyecto
 *      > Cuentas de servicio > Generar nueva clave privada). Este archivo
 *      está en .gitignore, nunca se sube a GitHub.
 *   3) node scripts/seed.js
 *
 * Es seguro volver a correrlo: si un usuario ya existe en Auth, lo omite;
 * los documentos de Firestore se sobrescriben con estos valores base.
 */

const path = require('path');
const admin = require('firebase-admin');

const keyPath = path.join(__dirname, '..', 'serviceAccountKey.json');
let serviceAccount;
try {
  serviceAccount = require(keyPath);
} catch (e) {
  console.error('No se encontró serviceAccountKey.json en la raíz del proyecto.');
  console.error('Descárgalo desde Firebase Console > Configuración del proyecto > Cuentas de servicio.');
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const auth = admin.auth();
const db = admin.firestore();

// ── Usuarios (idénticos a los que tenía la app, contraseñas incluidas para no interrumpir a nadie) ──
const USERS = [
  { id: 'obueno', name: 'Omairo Bueno', role: 'Sub-Gerente Comercial', ini: 'OB', col: '#0c3260', badge: true, pass: 'omairo2026', email: 'obueno@orocash.ec', nav: ['tablero', 'proyectos', 'eventos', 'camion', 'perfiles', 'ventas', 'social', 'pauteo'] },
  { id: 'dchoez', name: 'David Choez', role: 'Director de Marca', ini: 'DC', col: '#1a4f96', badge: true, pass: 'david2026', email: 'dchoez@orocash.ec', nav: ['tablero', 'proyectos', 'eventos', 'camion', 'perfiles', 'ventas', 'social', 'pauteo'] },
  { id: 'amolineros', name: 'Angel Molineros', role: 'Asistente de Marketing', ini: 'AM', col: '#2563eb', badge: false, pass: 'angel2026', email: 'amolineros@orocash.ec', nav: ['tablero', 'proyectos', 'eventos', 'perfiles'] },
  { id: 'ipacheco', name: 'Israel Pacheco', role: 'Fotografía', ini: 'IP', col: '#d97706', badge: false, pass: 'israel2026', email: 'ipacheco@orocash.ec', nav: ['tablero', 'eventos', 'perfiles'] },
  { id: 'agarcia', name: 'Arturo García', role: 'Prod. Audiovisual', ini: 'AG', col: '#7c3aed', badge: false, pass: 'arturo2026', email: 'agarcia@orocash.ec', nav: ['tablero', 'eventos', 'perfiles'] },
  { id: 'gpalma', name: 'Gustavo Palma', role: 'Diseñador', ini: 'GP', col: '#059669', badge: false, pass: 'gustavo2026', email: 'gpalma@orocash.ec', nav: ['tablero', 'eventos', 'perfiles'] },
  { id: 'gbarzola', name: 'Gissella Barzola', role: 'Diseñadora', ini: 'GB', col: '#0891b2', badge: false, pass: 'gissella2026', email: 'gbarzola@orocash.ec', nav: ['tablero', 'eventos', 'perfiles'] },
  { id: 'pmosquera', name: 'Pamela Mosquera', role: 'Social Media', ini: 'PM', col: '#dc2626', badge: false, pass: 'pamela2026', email: 'pmosquera@orocash.ec', nav: ['tablero', 'eventos', 'social', 'pauteo', 'perfiles'] },
  { id: 'mgarcia', name: 'Mariela García', role: 'Jefa de Ventas', ini: 'MG', col: '#16a34a', badge: false, pass: 'mariela2026', email: 'mgarcia@orocash.ec', nav: ['tablero', 'eventos', 'ventas', 'perfiles'] },
  { id: 'kescobar', name: 'Katherine Escobar', role: 'Ventas Online', ini: 'KE', col: '#0284c7', badge: false, pass: 'katherine2026', email: 'gventas1@orocash.ec', nav: ['tablero', 'eventos', 'ventas', 'perfiles'] },
  { id: 'emendoza', name: 'Eddy Mendoza', role: 'Publicidad Móvil', ini: 'EM', col: '#475569', badge: false, pass: 'eddy2026', email: 'emendoza@orocash.ec', nav: ['tablero', 'eventos', 'camion', 'perfiles'] },
  { id: 'mmontoya', name: 'Miguel Montoya', role: 'Fotografía', ini: 'MM', col: '#b45309', badge: false, pass: 'miguel2026', email: 'mmontoya@orocash.ec', nav: ['tablero', 'eventos', 'perfiles'] },
  { id: 'jjara', name: 'Jaqueline Jara', role: 'Vitrinimos', ini: 'JJ', col: '#be185d', badge: false, pass: 'jaqueline2026', email: 'jjara@orocash.ec', nav: ['tablero', 'eventos', 'vitrinimos', 'perfiles'] },
];

const TASKS = [
  { id: 1, title: 'Sesión fotográfica productos', desc: 'Fotos de nueva línea — refacción y edición incluida', dept: 'Fotografía', assignee: 'Israel Pacheco', aId: 'ipacheco', date: '02 jul 2026', prio: 'alta', status: 'pendiente' },
  { id: 2, title: 'Reporte trayectoria ventas Q2', desc: 'Análisis de trayectoria de ventas segundo trimestre', dept: 'Ventas Mariela', assignee: 'Mariela García', aId: 'mgarcia', date: '01 jul 2026', prio: 'media', status: 'pendiente' },
  { id: 3, title: 'Pautaje redes julio', desc: 'Planificación de pauta digital para julio', dept: 'Social / Pautaje', assignee: 'Pamela Mosquera', aId: 'pmosquera', date: '28 jun 2026', prio: 'media', status: 'pendiente' },
  { id: 4, title: 'Ruta movilización camión', desc: 'Logística y movilización para evento comercial', dept: 'Publicidad Móvil', assignee: 'Eddy Mendoza', aId: 'emendoza', date: '26 jun 2026', prio: 'alta', status: 'pendiente' },
  { id: 5, title: 'Diseño catálogo Coop Atahualpa', desc: 'Catálogo digital temporada segunda mitad 2026', dept: 'Diseño', assignee: 'Gissella Barzola', aId: 'gbarzola', date: '05 jul 2026', prio: 'media', status: 'pendiente' },
  { id: 6, title: 'Cuña radial julio', desc: 'Guion, grabación y edición de cuña radial mensual', dept: 'Prod. Audiovisual', assignee: 'Arturo García', aId: 'agarcia', date: '28 jun 2026', prio: 'baja', status: 'pendiente' },
  { id: 7, title: 'Banner campaña julio', desc: 'Diseño de banner para campaña de julio en redes', dept: 'Diseño', assignee: 'Gustavo Palma', aId: 'gpalma', date: '30 jun 2026', prio: 'alta', status: 'en_progreso' },
  { id: 8, title: 'Video institucional', desc: 'Producción y entrega video institucional', dept: 'Prod. Audiovisual', assignee: 'Arturo García', aId: 'agarcia', date: '08 jul 2026', prio: 'media', status: 'en_progreso' },
  { id: 9, title: 'Vitrina julio — centro comercial', desc: 'Instalación y diseño de vitrina para julio', dept: 'Eventos / Vitrinimos', assignee: 'Jaqueline Jara', aId: 'jjara', date: '01 jul 2026', prio: 'alta', status: 'en_progreso' },
  { id: 10, title: 'Métricas ecommerce junio', desc: 'Números de ventas plataforma online', dept: 'Ventas Online', assignee: 'Katherine Escobar', aId: 'kescobar', date: '25 jun 2026', prio: 'baja', status: 'completado' },
  { id: 11, title: 'Sesión tomas aéreas GYE', desc: 'Drone para feria comercial Guayaquil', dept: 'Fotografía', assignee: 'Miguel Montoya', aId: 'mmontoya', date: '20 jun 2026', prio: 'alta', status: 'vencida' },
  { id: 12, title: 'Calendario editorial sem 26', desc: '8 publicaciones 24–30 jun', dept: 'Social Media', assignee: 'Pamela Mosquera', aId: 'pmosquera', date: '23 jun 2026', prio: 'alta', status: 'vencida' },
];

const VENTAS_MONTHLY = [
  { id: 1, mes: 'Enero', year: 2026, total: 28400, pedidos: 180, ticket: 158, conv: 2.8, gramos: 320, por: 'kescobar', porNombre: 'Katherine Escobar', fecha: '2026-01-31' },
  { id: 2, mes: 'Febrero', year: 2026, total: 29100, pedidos: 190, ticket: 153, conv: 2.9, gramos: 345, por: 'kescobar', porNombre: 'Katherine Escobar', fecha: '2026-02-28' },
  { id: 3, mes: 'Marzo', year: 2026, total: 31500, pedidos: 205, ticket: 154, conv: 3.0, gramos: 370, por: 'kescobar', porNombre: 'Katherine Escobar', fecha: '2026-03-31' },
  { id: 4, mes: 'Abril', year: 2026, total: 30200, pedidos: 196, ticket: 154, conv: 2.9, gramos: 355, por: 'kescobar', porNombre: 'Katherine Escobar', fecha: '2026-04-30' },
  { id: 5, mes: 'Mayo', year: 2026, total: 34800, pedidos: 218, ticket: 160, conv: 3.1, gramos: 402, por: 'kescobar', porNombre: 'Katherine Escobar', fecha: '2026-05-31' },
  { id: 6, mes: 'Junio', year: 2026, total: 38200, pedidos: 248, ticket: 153, conv: 3.4, gramos: 440, por: 'kescobar', porNombre: 'Katherine Escobar', fecha: '2026-06-25' },
];

const PAUTA_RECORDS = [
  { id: 1, cod: 'E-01', nom: 'OROCASH GUAYAQUIL', plataforma: 'Facebook + Instagram', budget: 250, fInicio: '2026-06-01', fFin: '', obs: '', por: 'pmosquera', porNombre: 'Pamela Mosquera', fecha: '2026-06-01' },
  { id: 2, cod: 'E-52', nom: 'OROCASH QUITO', plataforma: 'Facebook', budget: 200, fInicio: '2026-06-01', fFin: '', obs: '', por: 'pmosquera', porNombre: 'Pamela Mosquera', fecha: '2026-06-01' },
  { id: 3, cod: 'E-110', nom: 'OROCASH CUENCA', plataforma: 'Instagram', budget: 150, fInicio: '2026-06-15', fFin: '', obs: '', por: 'pmosquera', porNombre: 'Pamela Mosquera', fecha: '2026-06-15' },
];

const PROYECTOS = [
  { name: 'Campaña Julio Rosett', dept: 'Diseño', resp: 'Gissella Barzola', ini: '10 jun', fin: '28 jun', avance: 75, status: 'En Curso' },
  { name: 'Sesión Producto Verano', dept: 'Fotografía', resp: 'Arturo García', ini: '15 jun', fin: '25 jun', avance: 90, status: 'Por Cerrar' },
  { name: 'Video Redes Q3 2026', dept: 'Audiovisual', resp: 'Arturo García', ini: '20 jun', fin: '15 jul', avance: 40, status: 'Preproducción' },
  { name: 'Feria Comercial GYE', dept: 'Eventos', resp: 'Angel Molineros', ini: '15 jun', fin: '26 jun', avance: 85, status: 'Confirmado' },
  { name: 'Material POP Tienda Centro', dept: 'Diseño', resp: 'Gustavo Palma', ini: '18 jun', fin: '05 jul', avance: 55, status: 'En Curso' },
  { name: 'Reporte Visual Zona Norte', dept: 'Vitrinimos', resp: 'Jaqueline Jara', ini: '20 jun', fin: '27 jun', avance: 70, status: 'En Curso' },
];

const ALL_EVENTS = [
  { id: 1, title: 'Activación Plaza Mayor', loc: 'Plaza Mayor, Guayaquil', date: '2026-06-28', person: 'Angel Molineros', budget: '$800', type: 'ACTIVACIÓN', cls: 'pill-activacion', typeCls: 'bg-purple', forCamion: false },
  { id: 2, title: 'Traslado muestras Cuenca', loc: 'Sucursal Cuenca', date: '2026-07-02', person: 'Eddy Mendoza', budget: '$200', type: 'MOVILIZACIÓN', cls: 'pill-movilizacion', typeCls: 'bg-teal', forCamion: true },
  { id: 3, title: 'Feria Joyería Quito', loc: 'Centro de Exposiciones Quito', date: '2026-07-05', person: 'Omairo Bueno', budget: '$3.500', type: 'EVENTO', cls: 'pill-evento', typeCls: 'bg-blue', forCamion: false },
  { id: 4, title: 'Evento Clientes VIP', loc: 'Hotel Dann Carlton', date: '2026-07-12', person: 'Omairo Bueno', budget: '$5.000', type: 'EVENTO', cls: 'pill-evento', typeCls: 'bg-blue', forCamion: false },
  { id: 5, title: 'Traslado Vitrina Manta', loc: 'Manta, Costa', date: '2026-07-18', person: 'Eddy Mendoza', budget: '$350', type: 'MOVILIZACIÓN', cls: 'pill-movilizacion', typeCls: 'bg-teal', forCamion: true },
  { id: 6, title: 'Pop-up Mercado Norte', loc: 'Mercado Norte, Quito', date: '2026-07-20', person: 'Angel Molineros', budget: '$1.200', type: 'POP-UP', cls: 'pill-popup', typeCls: 'bg-teal', forCamion: false },
  { id: 7, title: 'Traslado equipos Cuenca', loc: 'Sucursal Cuenca', date: '2026-07-26', person: 'Eddy Mendoza', budget: '$180', type: 'MOVILIZACIÓN', cls: 'pill-movilizacion', typeCls: 'bg-teal', forCamion: true },
];

async function seedAuthUsers() {
  console.log('→ Creando cuentas de Firebase Authentication...');
  for (const u of USERS) {
    try {
      await auth.getUserByEmail(u.email);
      console.log(`  · ${u.email} ya existe, se omite.`);
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        await auth.createUser({ uid: u.id, email: u.email, password: u.pass, displayName: u.name });
        console.log(`  ✓ Creado ${u.email} (contraseña inicial: la misma que ya usaba).`);
      } else {
        throw e;
      }
    }
    // directorio público id -> email (necesario para el login)
    await db.collection('directory').doc(u.id).set({ email: u.email });
  }
}

async function seedContent() {
  console.log('→ Cargando contenido inicial en Firestore...');
  const usersNoPass = USERS.map(({ pass, ...rest }) => rest);
  await db.collection('content').doc('users').set({ items: usersNoPass });
  await db.collection('content').doc('tasks').set({ items: TASKS });
  await db.collection('content').doc('ventas').set({ items: VENTAS_MONTHLY });
  await db.collection('content').doc('pauta').set({ items: PAUTA_RECORDS });
  await db.collection('content').doc('eventos').set({ items: ALL_EVENTS });
  await db.collection('content').doc('proyectos').set({ items: PROYECTOS });
  await db.collection('content').doc('jara').set({ exhibidores: {}, rutas: [] });
  await db.collection('content').doc('mariela').set({ visitas: [], cronograma: [] });
  console.log('  ✓ Colecciones content/* listas.');
}

(async () => {
  try {
    await seedAuthUsers();
    await seedContent();
    console.log('\n✅ Listo. Los 13 empleados ya pueden iniciar sesión con su usuario y contraseña de siempre.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error durante el seed:', err);
    process.exit(1);
  }
})();
