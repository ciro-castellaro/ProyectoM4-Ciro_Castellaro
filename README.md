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

| Script            | Descripción                                      |
| ------------------ | ------------------------------------------------- |
| `npm run dev`      | Levanta el servidor de desarrollo (Vite).          |
| `npm run build`    | Type-checks y genera el build de producción.       |
| `npm run preview`  | Sirve localmente el build de producción.           |
| `npm run lint`     | Corre el linter (`oxlint`).                        |
| `npm run test`     | Corre la suite de tests una sola vez.              |
| `npm run test:watch` | Corre los tests en modo interactivo (watch).      |
| `npm run test:ui`  | Abre la interfaz visual de Vitest en el navegador. |

## Variables de entorno

_Pendiente — se completará al configurar Firebase (Authentication y Firestore) y AWS SES /
Vercel Functions._ Ver `.env.example` para la plantilla actualizada.

## Arquitectura

_Pendiente — se documentará a medida que se agreguen las capas del proyecto._

## Flujo de emails

_Pendiente — se documentará al implementar el envío de emails._

## Uso de IA en este proyecto

_Pendiente — se documentará al finalizar el desarrollo. El detalle del proceso se registra en
`LOGS M4/uso-de-IA.md`, fuera de este repositorio._

## Deploy

_Pendiente — URL de producción se agregará al desplegar la aplicación._
