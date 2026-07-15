# OroCash — Sistema de Gestión Comercial

Este repositorio contiene el mismo dashboard que ya conoces (`index.html`), con dos cambios de fondo respecto al archivo original:

1. **Login y usuarios seguros con Firebase Authentication.** Antes, las 13 contraseñas del equipo estaban escritas en texto plano dentro del HTML y cualquiera podía verlas abriendo el "Ver credenciales". Ahora el login usa Firebase Auth de verdad; nadie puede ver contraseñas ajenas.
2. **Contenido guardado en Firebase (Firestore).** Tareas, ventas, pauta, eventos, proyectos, rutas y visitas ya no viven solo en la memoria del navegador (se perdían al recargar la página): se guardan y se leen desde Firestore.

La interfaz, los flujos, el calendario, el kanban, las importaciones CSV, etc. **no se tocaron** — solo se conectaron los puntos donde antes se leían/escribían datos hardcodeados.

Además, hay dos endpoints reales (`/api/create-employee`, `/api/reset-password`) que corren como funciones serverless en Vercel, usados por un administrador para dar de alta empleados nuevos o resetear contraseñas sin tocar código.

## Estructura del proyecto

```
index.html              → el dashboard (idéntico visualmente al original)
api/
  create-employee.js    → función serverless (Vercel) — crear empleado
  reset-password.js     → función serverless (Vercel) — resetear contraseña
  health.js             → endpoint de prueba
  _lib/firebaseAdmin.js → helper compartido (Firebase Admin SDK)
scripts/seed.js         → carga inicial de usuarios y datos en Firebase (correr una sola vez)
firestore.rules         → reglas de seguridad de Firestore
vercel.json             → configuración de Vercel
package.json            → dependencias de las funciones /api
.env.example            → variables de entorno necesarias
extras/                 → plantillas .xlsx y script make_templates.py del proyecto original
```

## 1) Configurar Firebase

Ya tienes cuenta de Firebase, así que solo falta:

1. En tu proyecto de Firebase, ve a **Authentication → Sign-in method** y habilita **Correo electrónico/contraseña**.
2. Ve a **Firestore Database** y créala (modo producción).
3. En **Configuración del proyecto → Tus apps → Web app**, copia el objeto `firebaseConfig` y pégalo en `index.html`, reemplazando el bloque que dice:
   ```js
   const firebaseConfig = {
     apiKey: "TU_API_KEY",
     ...
   };
   ```
   Este objeto **no es secreto** (es normal que quede visible en el código de un sitio web con Firebase); la seguridad la dan las reglas de Firestore y Firebase Auth, no el ocultamiento de estas llaves.
4. En **Configuración del proyecto → Cuentas de servicio**, genera una nueva clave privada. Descarga el JSON y guárdalo en la raíz del proyecto como `serviceAccountKey.json` (ya está en `.gitignore`, nunca se sube a GitHub).
5. Instala Firebase CLI si no la tienes (`npm install -g firebase-tools`), haz `firebase login` y `firebase use --add` apuntando a tu proyecto, luego despliega las reglas:
   ```bash
   firebase deploy --only firestore:rules
   ```
   (o simplemente pega el contenido de `firestore.rules` en Firebase Console → Firestore → Reglas).

## 2) Cargar los datos iniciales (una sola vez)

```bash
npm install
node scripts/seed.js
```

Esto crea las 13 cuentas de los empleados en Firebase Authentication **con las mismas contraseñas que ya usan hoy** (nadie tiene que aprender nada nuevo) y sube tareas, ventas, pauta, eventos y proyectos actuales a Firestore.

## 3) Subir a GitHub (repositorio privado)

No tengo acceso a tu cuenta de GitHub, así que estos pasos los corres tú desde esta misma carpeta:

```bash
git init
git add .
git commit -m "OroCash dashboard con Firebase Auth + Firestore"
```

Luego crea un repositorio **privado** vacío en GitHub (sin README, sin licencia) y conéctalo:

```bash
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

## 4) Desplegar en Vercel

1. En Vercel, "Add New… → Project" e importa el repositorio de GitHub.
2. Framework Preset: **Other** (no hace falta build step, es HTML estático + funciones `/api`).
3. En **Environment Variables**, agrega (con los mismos valores del `serviceAccountKey.json`):
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY` (pega la clave completa; Vercel maneja bien los saltos de línea si la pegas tal cual, entre comillas si el editor lo pide)
4. Deploy. Vercel publicará `index.html` en la raíz y las funciones de `api/` como endpoints reales (`https://tu-proyecto.vercel.app/api/health` debería responder `{"ok":true}`).

## 5) Verificación

- Entra a la URL de Vercel, inicia sesión con cualquiera de los 13 usuarios y su contraseña de siempre.
- Crea una tarea, muévela en el kanban, recarga la página: debe seguir ahí (ahora persiste en Firestore).
- `GET /api/health` debe responder `{"ok":true}`.
- Para dar de alta un empleado nuevo sin tocar código: un admin (Omairo o David) puede llamar a `POST /api/create-employee` con su token de Firebase Auth en el header `Authorization: Bearer <idToken>`.

## Qué cambió exactamente (para que no te sorprenda nada)

- El modal **"Ver credenciales"** ya no muestra contraseñas (ahora se llama "Usuarios del sistema" y muestra nombre, cargo, usuario y email). Mostrar contraseñas en texto plano era exactamente lo inseguro que pediste corregir.
- Las contraseñas de Miguel Montoya y Jaqueline Jara (que no tenían email real, decían "—") ahora usan `mmontoya@orocash.ec` y `jjara@orocash.ec` internamente para poder crear su cuenta en Firebase Auth. Ellos siguen ingresando con el mismo usuario y contraseña de siempre; el email es un detalle interno que no ven.
- Todo lo demás — calendario, kanban, arrastrar y soltar, importación de CSV, reportes, perfiles, rutas, exhibidores — es el mismo código, solo con una línea agregada después de cada acción para guardar el cambio en Firestore.
