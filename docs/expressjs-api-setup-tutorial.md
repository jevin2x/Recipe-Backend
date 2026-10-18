# Recipe Book API (Backend)

A TypeScript + Express 5 REST API for the Full-Stack Recipe Book application. It handles authentication, recipe management, database operations, and communication with the React + Vite frontend.

Authentication uses JWT access and refresh tokens stored in **HttpOnly cookies**, refresh-token rotation, and CSRF protection for browser requests. Data is stored in PostgreSQL using **Drizzle ORM**.

**Production API:** [https://recipe-backend-api-68ju.onrender.com](https://recipe-backend-api-68ju.onrender.com)

**Frontend:** [https://recipi-frontend-eta.vercel.app](https://recipi-frontend-eta.vercel.app)

## Stack

| **Layer** | **Choice** |
|---|---|
| Runtime | Node.js 22+ |
| Language | TypeScript |
| Server | Express 5 |
| Database | PostgreSQL (Neon in production) |
| ORM / Migrations | Drizzle ORM + Drizzle Kit |
| Authentication | `jsonwebtoken` + `bcrypt` + HttpOnly cookies |
| CSRF Protection | `csrf-csrf` |
| Validation | Zod |
| Production Build | `tsdown` |
| Development | `tsx` |
| Deployment | Render |

## Architecture

Requests flow through separate layers:

```text
Routes
  ↓
Controllers
  ↓
Services
  ↓
Repositories
  ↓
Drizzle ORM
  ↓
PostgreSQL (Neon)
```

- `src/routes` defines API endpoints and attaches middleware.
- `src/controllers` handles HTTP requests and responses.
- `src/services` contains business rules and permission checks.
- `src/repositories` contains database queries and ownership filters.
- `src/db/schema.ts` defines the database structure.

**Database workflow:** Update `src/db/schema.ts`, generate migrations, and apply them using the Drizzle migration commands. Avoid changing database tables manually.

## Local Setup

### 1. Clone the repository

```bash
git clone YOUR_BACKEND_REPOSITORY_URL
cd YOUR_BACKEND_FOLDER
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your environment file

PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS / Linux:

```bash
cp .env.example .env
```

### 4. Configure environment variables

Set the required values in `.env`, especially `DATABASE_URL`.

```env
APP_NAME=AppsDev API Tutorial
PORT=7000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
CSRF_SECRET=your_different_csrf_secret
BACKEND_URL=http://localhost:7000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=your_postgresql_connection_string
```

Use your actual PostgreSQL connection string and generate secure secrets. Do not commit `.env` to GitHub.

### 5. Create database tables

```bash
npm run db:migrate
```

### 6. Seed sample data (optional)

```bash
npm run db:seed
```

### 7. Start the development server

```bash
npm run dev
```

The API will normally run at [http://localhost:7000](http://localhost:7000).

Check the health endpoint:

```http
GET http://localhost:7000/api/health
```

A successful response should look like:

```json
{
  "status": "success"
}
```

## Environment Variables

| **Variable** | **Purpose** |
|---|---|
| `APP_NAME` | Application name used in logs and the root route. |
| `PORT` | Port used by the server. Render provides its own port. |
| `NODE_ENV` | Controls development or production behavior. |
| `JWT_SECRET` | Secret used to sign JWT access and refresh tokens. |
| `CSRF_SECRET` | Separate secret used for CSRF protection. |
| `BACKEND_URL` | Public URL of the deployed API. |
| `FRONTEND_URL` | Exact frontend origin allowed by CORS. |
| `DATABASE_URL` | PostgreSQL connection string. |

Generate a secure secret with Node.js:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Run it separately for `JWT_SECRET` and `CSRF_SECRET` so they have different values.

## Database Workflow (Drizzle)

Generate migrations from schema changes:

```bash
npm run db:plan
```

Apply pending migrations:

```bash
npm run db:migrate
```

Open Drizzle Studio:

```bash
npm run db:studio
```

Seed sample records:

```bash
npm run db:seed
```

Migration files are stored in `drizzle/` and should be committed to Git.

## API Endpoints

**Base URL:** `https://recipe-backend-api-68ju.onrender.com/api`

| **Method** | **Endpoint** | **Access** | **Purpose** |
|---|---|---|---|
| GET | `/health` | Public | Check API status. |
| GET | `/auth/v1/csrf-token` | Public | Retrieve a CSRF token. |
| POST | `/auth/v1/signup` | Public | Register a user. |
| POST | `/auth/v1/login` | Public | Sign in and set authentication cookies. |
| POST | `/auth/v1/refresh-token` | Cookie | Refresh and rotate tokens. |
| POST | `/auth/v1/logout` | Cookie | Log out and revoke the refresh token. |
| GET | `/auth/v1/session` | Authenticated | Retrieve the current user. |
| GET | `/recipes/v1/get-recipes` | USER | Retrieve the user's own recipes. |
| GET | `/recipes/v1/get-recipe/:id` | USER | Retrieve an owned recipe. |
| POST | `/recipes/v1/create-recipe` | USER | Create a recipe. |
| POST | `/recipes/v1/update-recipe/:id` | USER | Update an owned recipe. |
| POST | `/recipes/v1/delete-recipe/:id` | USER | Delete an owned recipe. |
| GET | `/recipes/v1/get-all-recipes` | ADMIN | Retrieve all recipes and their owners. |

Recipe routes require valid authentication. Browser requests that modify data must include the required CSRF token.

## Authentication and Security

1. The frontend requests a CSRF token.
2. The user submits login credentials.
3. The backend validates the credentials and sets authentication cookies.
4. The refresh endpoint rotates refresh tokens when required.
5. Protected endpoints verify authentication and user permissions.
6. CSRF protection validates applicable browser requests.

Access and refresh tokens are stored in HttpOnly cookies, preventing client-side JavaScript from reading their values directly.

## Production Build

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

Run ESLint:

```bash
npm run lint
```

The production build outputs `dist/server.mjs`.

## Deploy to Render

1. Push the backend repository to GitHub.
2. Create a Web Service in [Render](https://dashboard.render.com/).
3. Connect your backend repository.
4. Configure the build and start commands.

**Build command:**

```bash
npm ci --include=dev && npm run db:migrate && npm run build
```

**Start command:**

```bash
npm start
```

5. Configure the environment variables in Render.

### Production Environment

Set these values in your Render service, using your own secure secrets and database credentials.

```env
APP_NAME=AppsDev API Tutorial
NODE_ENV=production
BACKEND_URL=https://recipe-backend-api-68ju.onrender.com
FRONTEND_URL=https://recipi-frontend-eta.vercel.app
DATABASE_URL=your_neon_postgresql_connection_string
JWT_SECRET=your_secure_jwt_secret
CSRF_SECRET=your_different_secure_csrf_secret
```

Do not hardcode `PORT` unless your application requires it; your server should use the port provided by Render.

**Important:** `FRONTEND_URL` must match your deployed frontend's origin exactly. Use `https://recipi-frontend-eta.vercel.app`, not your Vercel dashboard URL.

See `DEPLOYMENT-GUIDE.md` for additional deployment instructions. If your repository includes `render.yaml`, review its settings before using the Blueprint deployment option.

## Deployment URLs

| **Service** | **URL** |
|---|---|
| Frontend | https://recipi-frontend-eta.vercel.app |
| Backend API | https://recipe-backend-api-68ju.onrender.com |
| Health Check | https://recipe-backend-api-68ju.onrender.com/api/health |
| Database | Neon PostgreSQL |

## Security Notes

- Never commit `.env` files or expose database credentials.
- Use separate, randomly generated JWT and CSRF secrets.
- Restrict CORS to trusted frontend origins.
- Keep authentication cookies HttpOnly and configure production cookie security correctly.
- Use CSRF protection for applicable browser requests.
- Enforce authentication and ownership checks on protected recipe endpoints.
