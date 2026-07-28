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

_Pendiente — se documentará a medida que se agreguen las capas del proyecto._

## Flujo de emails

_Pendiente — se documentará al implementar el envío de emails._

## Uso de IA en este proyecto

_Pendiente — se documentará al finalizar el desarrollo. El detalle del proceso se registra en
`LOGS M4/uso-de-IA.md`, fuera de este repositorio._

## Deploy

_Pendiente — URL de producción se agregará al desplegar la aplicación._
