# Full-Stack Authentication Boilerplate

This is an authentication boilerplate for new applications. Copy it when you start a project. Registration, email verification, login, forgot password, change password, logout, and Google sign-in already work. You do not rebuild that flow.

Change the design, then keep building the rest of the app yourself. The auth pages are a finished slice: update their Tailwind markup and leave the `useAuthStore` calls as they are. Home and the navbar only show whether someone is signed in. Every other page — products, dashboard, settings, whatever the app needs — is yours to add on top.

The API lives in `server`. The Next.js client lives in `client`. The browser only talks to the Next app. Next forwards `/api` to the API, so the auth cookies stay on the client address. The browser never stores access or refresh tokens.

## Tech stack

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5-443E38)
![Axios](https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?logo=reacthookform&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-httpOnly_cookies-000000?logo=jsonwebtokens)

| Client | Server |
|---|---|
| Next.js 16, React 19, TypeScript | Express 5 |
| Tailwind CSS 4 | MySQL (`mysql2`) |
| Zustand | JWT access + httpOnly refresh cookie |
| Axios | bcrypt, Joi, Nodemailer |
| React Hook Form | Passport Google OAuth, express-rate-limit |

## Features

- JWT access token and an httpOnly refresh token. The browser never stores either token. Refresh tokens are saved in MySQL and rotated on each refresh.
- Email verification code, forgot password, and change password. Codes go out through Nodemailer (Mailtrap in development).
- Google sign-in. The account is created as already verified.
- Route protection on the API, and an Axios response interceptor that refreshes the session on 401 and retries the request.
- Auth state in Zustand (`useAuthStore`), including session check, sign-in, and logout.
- Client forms with React Hook Form. Request bodies are validated with Joi.
- Passwords hashed with bcrypt. OTP and sign-in attempts are rate limited.

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
http://localhost:3001/api/auth/google/callback
```

Put the client id, secret, and that callback URL in `.env`. The callback is the Next app, not the API port. Next forwards it to the API, and the browser stores the cookies on port 3001.

**3. Client (port 3001)**

```bash
cd client
npm install
npm run dev -- -p 3001
```

Open `http://localhost:3001`. The API stays on port 3000. Next cannot use 3000 at the same time. Requests to `/api` are proxied to `http://localhost:3000`. Set `API_URL` only if the API is somewhere else.

## Deploy on Vercel as two projects

Use one Git repository and two Vercel projects. The database stays on TiDB Cloud. Vercel does not run `server.listen()`, so `server/vercel.json` runs the Express app as a function.

## Using this in another project

Clone the repo and point `.env` at the new database and mail settings. Restyle the auth pages. Add your own routes next to them. The store, the API client, and the Express auth routes stay.

Do not commit `.env`. Both folders ignore it.

API-only details (token lifetimes, folder map, Mailtrap steps) are in `server/README.md`.
