# Full-Stack Authentication Boilerplate

This is an authentication boilerplate for new applications. Copy it when you start a project. Registration, email verification, login, forgot password, change password, logout, and Google sign-in already work. You do not rebuild that flow.

Change the design, then keep building the rest of the app yourself. The auth pages are a finished slice: update their Tailwind markup and leave the `useAuthStore` calls as they are. Home and the navbar only show whether someone is signed in. Every other page — products, dashboard, settings, whatever the app needs — is yours to add on top.

The API lives in `server`. The Next.js client lives in `client`. Sessions use httpOnly cookies. The browser never stores access or refresh tokens.

## Pages

| Page | What it does | API |
|---|---|---|
| `/register` | name, surname, email, password | `POST /api/auth/sign-up` |
| `/verify-email` | 6-digit code from email | `POST /api/auth/verify-email` |
| `/login` | email and password | `POST /api/auth/sign-in` |
| `/forgot-password` | email, then code and a new password | `POST /api/auth/forgot-password` |
| `/change-password` | signed-in user only. Sends a code, then sets a new password and signs the user out | `POST /api/auth/change-password` |
| `/` | shows the session. Logout and Change Password when signed in | `POST /api/auth/logout` |

Google buttons on login and register send the browser to `GET /api/auth/google`. After Google redirects back, the API sets the cookies and sends the browser to the client home page.

Sign-up does not log the user in. Sign-in rejects accounts that are not verified yet. A Google account is created as already verified.

Password rules: 8–20 characters, with an uppercase letter, a lowercase letter, a number, and one of `@ $ ! % * ? &`. Name is 2–12 characters. Surname is 5–15 characters.

OTP and login attempts are rate limited: 5 code requests and 10 sign-in attempts per 15 minutes.

## Run it

You need Node.js and MySQL. Use two terminals.

**1. Database**

Create a database, then run `server/dbSchema.sql`. 

**2. API (port 3000)**

```bash
cd server
npm install
cp .env.example .env
npx nodemon server.js
```

Fill in `.env` from the example. `CLIENT_URL` must be the exact browser origin of the Next app (`http://localhost:3001`), because CORS allows cookies only from that origin.

For development email, use a [Mailtrap](https://mailtrap.io) inbox and put its SMTP settings in `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, and `EMAIL_PASSWORD`. Codes show up in the Mailtrap inbox, not in a real mailbox.

For Google, create an OAuth client in [Google Cloud Console](https://console.cloud.google.com). Authorized redirect URI:

```text
http://localhost:3000/api/auth/google/callback
```

Put the client id, secret, and that callback URL in `.env`.

**3. Client (port 3001)**

```bash
cd client
npm install
```

Create `client/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

```bash
npm run dev -- -p 3001
```

Open `http://localhost:3001`. The API stays on port 3000. Next cannot use 3000 at the same time.

## Deploy on Vercel as two projects

Use one Git repository and two Vercel projects. The database stays on TiDB Cloud. Vercel does not run `server.listen()`, so `server/vercel.json` runs the Express app as a function. In production the auth cookies are `SameSite=None` and `Secure`, because the client and the API are different sites.

**API project**

- Root Directory: `server`
- Environment variables: everything in `server/.env`, plus the live values below
- `CLIENT_URL` = the client URL, for example `https://your-app.vercel.app`
- `GOOGLE_CALLBACK_URL` = `https://your-api.vercel.app/api/auth/google/callback`
- Add that same callback in Google Cloud Console

**Client project**

- Root Directory: `client`
- Framework: Next.js
- `NEXT_PUBLIC_API_URL` = the API URL with no trailing slash, for example `https://your-api.vercel.app`

Set `NEXT_PUBLIC_API_URL` before the client build. Next bakes it into the browser bundle.

## Using this in another project

Clone the repo and point `.env` at the new database and mail settings. Restyle the auth pages. Add your own routes next to them. The store, the API client, and the Express auth routes stay.

Do not commit `.env`. Both folders ignore it.

API-only details (token lifetimes, folder map, Mailtrap steps) are in `server/README.md`.
