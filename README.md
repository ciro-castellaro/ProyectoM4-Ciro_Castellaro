# MateCode | Gestor de tareas

Aplicación web SPA de gestión de tareas para **MateCode**. Permite que empleados gestionen sus
tareas diarias de forma organizada, persistente y accesible desde cualquier dispositivo.

## Estado del proyecto

En desarrollo incremental, por etapas.

## Tecnologías

- Frontend: React + TypeScript (Vite)
- Backend as a Service: Firebase Authentication y Cloud Firestore
- Notificaciones por email: AWS SES, invocado desde una Vercel Function
- Deploy: Vercel
- Testing: Vitest y React Testing Library

## Instalación

```bash
git clone https://github.com/ciro-castellaro/ProyectoM4-Ciro_Castellaro.git
cd ProyectoM4-Ciro_Castellaro
npm install
cp .env.example .env
```

Completá el `.env` con tus propios valores (ver [Variables de entorno](#variables-de-entorno)).

## Scripts disponibles

| Script               | Descripción                                        |
| -------------------- | -------------------------------------------------- |
| `npm run dev`        | Levanta el servidor de desarrollo (Vite).          |
| `npm run build`      | Type-checks y genera el build de producción.       |
| `npm run preview`    | Sirve localmente el build de producción.           |
| `npm run lint`       | Corre el linter (`oxlint`).                        |
| `npm run test`       | Corre la suite de tests una sola vez.              |
| `npm run test:watch` | Corre los tests en modo interactivo (watch).       |
| `npm run test:ui`    | Abre la interfaz visual de Vitest en el navegador. |

## Variables de entorno

| Variable                            | Descripción                                                                                        |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| `VITE_FIREBASE_API_KEY`             | Config pública del cliente Firebase (consola de Firebase → Configuración del proyecto → Tus apps). |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Dominio de autenticación del proyecto Firebase.                                                    |
| `VITE_FIREBASE_PROJECT_ID`          | ID del proyecto Firebase.                                                                          |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Bucket de Storage del proyecto Firebase.                                                           |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID de Firebase Cloud Messaging.                                                             |
| `VITE_FIREBASE_APP_ID`              | ID de la app dentro del proyecto Firebase.                                                         |
| `FIREBASE_ADMIN_PROJECT_ID`         | Service account de Firebase (solo servidor), usada por la Vercel Function para verificar sesiones. |
| `FIREBASE_ADMIN_CLIENT_EMAIL`       | Email de la service account (consola de Firebase → Cuentas de servicio).                           |
| `FIREBASE_ADMIN_PRIVATE_KEY`        | Clave privada de la service account. Nunca lleva el prefijo `VITE_`: no debe llegar al cliente.     |
| `SES_REGION`                        | Región de AWS donde está habilitado SES (nombre propio, no `AWS_REGION`: ver nota abajo).          |
| `SES_ACCESS_KEY_ID`                  | Access key de un usuario IAM con permisos mínimos (solo enviar emails vía SES).                    |
| `SES_SECRET_ACCESS_KEY`              | Secret key del mismo usuario IAM. Nunca debe llegar al cliente.                                    |
| `SES_SENDER_EMAIL`                   | Identidad (email) verificada en SES desde la que se envía el resumen.                              |

> Nota: los valores de Firebase de arriba son configuración pública del cliente (quedan visibles
> en el bundle de JS), no secretos de servidor. Se mantienen en `.env` de todos modos como buena
> práctica y para no acoplar el código a un proyecto de Firebase específico. La protección real de
> los datos de cada usuario depende de las Reglas de Seguridad de Firestore, no de ocultar estos
> valores.

> Nota: las variables de SES usan nombres propios (`SES_REGION`, `SES_ACCESS_KEY_ID`,
> `SES_SECRET_ACCESS_KEY`) en vez de los nombres estándar de AWS (`AWS_REGION`,
> `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) a propósito: las Vercel Functions corren sobre AWS
> Lambda, que ya define esas variables reservadas con las credenciales del rol de ejecución de la
> plataforma. Usar los nombres estándar haría que el SDK de AWS tomara esas credenciales ajenas en
> vez de las de nuestro usuario IAM de SES.

## Arquitectura

El código se organiza en capas con responsabilidades separadas:

- `src/pages/` — pantallas completas (login, registro, tareas); arman la página a partir de
  componentes y hooks.
- `src/components/` — piezas de UI reutilizables con una única responsabilidad (formularios, lista
  de tareas, encabezado, modal de confirmación, resumen por email).
- `src/hooks/` — estado de dominio reutilizable entre componentes (`useAuth`, `useTasks`).
- `src/features/` — lógica de validación pura, sin dependencias de UI ni de red (`validateAuth`,
  `validateTask`, `buildTaskSummary`).
- `src/services/` — integraciones con servicios externos (Firebase Authentication, Cloud
  Firestore, el fetch al endpoint de email). Es la única capa que conoce los SDKs externos.
- `src/routes/` — configuración de React Router y protección de rutas privadas.
- `src/types/` — contratos de datos compartidos, incluido `Result<T>` (usado en todo el proyecto,
  frontend y backend, para modelar éxito/error de forma explícita en vez de con excepciones) y los
  tipos que comparten el frontend con la Vercel Function (`SendSummaryRequest`,
  `SendSummaryResponse`).
- `api/` — el único punto de entrada de las Vercel Functions. Se mantiene deliberadamente delgado:
  solo valida el método HTTP y orquesta las llamadas a `server/`.
- `server/` — lógica de servidor compartida (verificación del `idToken`, validación del body,
  armado del email, envío por SES). Vive fuera de `api/` a propósito: Vercel trata cada archivo
  dentro de `api/` como un endpoint público, así que separarla evita crear rutas HTTP
  involuntarias.

Todas las capas usan el mismo tipo `Result<T>` (`{ ok: true; value: T } | { ok: false; error:
string }`) para propagar errores de forma explícita y tipada: el compilador obliga a manejar el
caso de error en cada punto donde se consume un resultado.

## Flujo de emails

1. En `TasksPage`, el usuario hace clic en el botón de enviar resumen (`EmailSummary`).
2. El cliente arma el resumen (`buildTaskSummary`) a partir de las tareas ya cargadas y obtiene un
   `idToken` fresco de Firebase Authentication (`user.getIdToken()`).
3. Se hace un `POST /api/send-summary` con `{ idToken, summary }`.
4. La Vercel Function (`api/send-summary.ts`) delega en `server/`:
   - `verifyIdToken` verifica el token con `firebase-admin` (nunca se confía en un email que venga
     del cliente).
   - `validateSendSummaryRequest` valida la forma del body.
   - `buildEmailContent` arma el asunto y el cuerpo del email.
   - `sendEmailViaSes` lo envía con el SDK de AWS SES, usando **el email del usuario ya verificado
     por Firebase** como destinatario (nunca uno provisto por el cliente), lo que evita que el
     endpoint pueda usarse para mandar mail a direcciones arbitrarias.
5. Cualquier error (token inválido, SES caído, credenciales mal configuradas) se traduce a un
   mensaje genérico y seguro antes de llegar al cliente (`getSesErrorMessage`); el detalle real
   solo queda en los logs del servidor.

**Nota operativa:** mientras la cuenta de AWS SES esté en modo *sandbox*, solo se puede enviar a
direcciones verificadas manualmente en la consola de AWS (*Verified identities*). Para que
cualquier usuario registrado reciba su resumen sin verificación previa, hay que solicitar la
salida del sandbox (*production access*) en la consola de AWS.

## Uso de IA en este proyecto

El desarrollo se hizo con Claude Code como asistente, siguiendo estos principios:

- El proyecto se construyó en etapas pequeñas y secuenciales; cada una se implementó, se explicó y
  se confirmó antes de pasar a la siguiente.
- El código propuesto por la IA se revisó y se adaptó al proyecto — no se copiaron soluciones sin
  entenderlas.
- Los commits se hacen exclusivamente con la autoría de Ciro Castellaro; la IA nunca figura como
  colaboradora ni coautora.
- Nunca se subieron secretos al repositorio: las claves de Firebase, AWS y Vercel viven solo en
  `.env` (ignorado por Git) y en la configuración de entorno de Vercel.

El detalle etapa por etapa (qué se hizo, por qué se usó la IA en cada caso y qué se revisó) se
registra en `LOGS M4/uso-de-IA.md`, fuera de este repositorio.

## Deploy

_Pendiente — URL de producción se agregará al desplegar la aplicación._
