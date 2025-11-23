# Production Deployment Guide (Backend & Database)

This guide provides the steps to take the code in the `server/` folder and deploy it to a live production environment.

## 1. Environment Variables (.env)

In production, you never hardcode secrets. You must set these variables in your deployment platform (e.g., Railway, Heroku, Vercel):

```bash
PORT=3000
NODE_ENV=production
DATABASE_URL=postgres://user:password@host:port/database_name?sslmode=require
JWT_SECRET=super_long_random_secure_string_here
FRONTEND_URL=https://your-frontend-app.vercel.app
```

## 2. Database Setup (PostgreSQL)

You need a hosted PostgreSQL database.
**Recommended Free/Cheap Providers:**
- **Neon.tech** (Serverless Postgres, easy setup)
- **Supabase** (Includes GUI)
- **Railway** (Has built-in Postgres plugin)

**Steps:**
1. Create a database instance on one of the providers above.
2. Get the **Connection String** (looks like `postgres://...`).
3. Run the SQL script found in `server/database.sql` to create your tables. You can use a tool like **pgAdmin** or **DBeaver** to connect to your remote DB and run the script.

## 3. Deploying the Backend (Node.js)

**Recommended Provider: Railway or Render** (Easiest for Node.js + Postgres)

**Deploying to Railway:**
1. Push your code to GitHub.
2. Go to Railway.app -> New Project -> Deploy from GitHub.
3. Select your repo.
4. **Important**: Go to Settings -> Root Directory and set it to `/server` (since the backend code is in a subfolder).
5. Go to Variables and add the Environment Variables from Step 1.
6. Railway will automatically detect `package.json`, install dependencies, and run `npm start`.

## 4. Connecting Frontend to Backend

1. **Update Frontend Service**: In your frontend code, open `services/api.ts`.
2. **Switch Logic**: Currently, the app uses `mockBackend.ts`. You need to search/replace all imports in your `pages/*.tsx` files:
   - *From:* `import { ... } from '../services/mockBackend';`
   - *To:* `import { ... } from '../services/api';`
3. **Set API URL**: In your Vercel/Netlify frontend project settings, add an Environment Variable:
   ```bash
   REACT_APP_API_URL=https://your-backend-app.up.railway.app/api
   ```
   *Note: If using Vite, use `VITE_API_URL`.*

## 5. Final Security Checklist

- [ ] **SSL/TLS**: Ensure your backend URL starts with `https://`.
- [ ] **CORS**: Ensure `FRONTEND_URL` matches exactly where your React app is hosted.
- [ ] **Database SSL**: Ensure your DB connection string handles SSL (handled in `server/db.js`).
- [ ] **JWT Secret**: Make sure this is a strong, generated string (use `openssl rand -base64 32` to generate one).

## 6. How to Run Locally (Full Stack)

1. **Start Database**: Ensure you have Postgres running locally.
2. **Start Backend**:
   ```bash
   cd server
   npm install
   # Create a .env file based on the guide above
   npm start
   ```
3. **Start Frontend**:
   ```bash
   # In root folder
   npm start
   ```
