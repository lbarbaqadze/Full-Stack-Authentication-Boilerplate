# Express-2Auth-Api

A secure REST API for authentication built with Node.js and Express. Supports Email/Password registration with OTP verification and Google OAuth login.

## Features

- Email/Password registration with OTP email verification
- Google OAuth 2.0 login
- Change-Password & Forgot-Password
- JWT Access Token + Refresh Token with rotation
- httpOnly Cookie security (prevents XSS attacks)
- Rate Limiting (brute-force protection)
- Bcrypt password hashing
- Joi input validation
- MySQL transactions (atomic operations)
- Global error handling (development/production modes)

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL2
- **Authentication:** JWT, Passport.js, Google OAuth 2.0
- **Email:** Nodemailer + Mailtrap (development)
- **Validation:** Joi
- **Security:** Bcrypt, express-rate-limit, httpOnly cookies

## Project Structure

```
├── config/
│   ├── db.connect.js        # MySQL connection pool
│   └── passport.config.js   # Google OAuth strategy
├── controllers/
│   ├── auth.controller.js       # signup, signin, refresh, logout, forgotpassword, changepassword
│   └── google.auth.controller.js # Google OAuth callback
├── middlewares/
│   ├── auth.middleware.js   # protect (JWT verification)
│   ├── errorHandler.js      # global error handler
│   └── validate.js          # Joi validation middleware
├── models/
│   ├── auth.model.js        # DB queries for auth
│   └── google.auth.model.js # DB queries for Google OAuth
├── router/
│   ├── auth.router.js       # auth routes
│   └── google.auth.router.js # Google OAuth routes
├── utils/
│   ├── appError.js          # custom error class
│   ├── catchAsync.js        # async error wrapper
│   ├── generateToken.js     # token generation & cookie helpers
│   └── sendEmail.js         # nodemailer email sender
├── validation/
│   └── auth.validator.js    # Joi schemas
├── .env.example
├── .gitignore
├── dbSchema.sql
└── server.js
```

### Set up the database

Run `dbSchema.sql` in your MySQL client to create the required tables:

### Token Strategy

- **Access Token** — expires in 15 minutes, used for protected routes
- **Refresh Token** — expires in 7 days, stored in DB, rotated on every use
- Both tokens stored in **httpOnly cookies** (not accessible via JavaScript)

## Email Setup

This project uses **Mailtrap** for email testing in development.
OTP verification codes are sent to your Mailtrap inbox instead of real emails.

1. Create a free account at [Mailtrap.io](https://mailtrap.io)
2. Go to Email Testing → Inboxes → your inbox → SMTP Settings
3. Copy the credentials and add them to your `.env` file:

```env
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_mailtrap_user
EMAIL_PASSWORD=your_mailtrap_password
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:3001` to Authorized JavaScript origins
6. Add `http://localhost:3001/api/auth/google/callback` to Authorized redirect URIs
7. Copy Client ID and Client Secret to your `.env` file
