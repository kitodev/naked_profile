# Naked Profile Backend

This is the dedicated Next.js API backend for Naked Profile.

## Run

```bash
npm install
npm run dev
```

The API starts on:

```text
http://127.0.0.1:3001
```

## Environment

Copy `.env.example` to `.env.local` and set:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_APP_URL
AGEVERIF_CLIENT_ID
AGEVERIF_CLIENT_SECRET
AGEVERIF_STATE_SECRET
AGEVERIF_REDIRECT_URI
```

Do not expose `SUPABASE_SERVICE_ROLE_KEY` or `STRIPE_SECRET_KEY` in the frontend.

`AGEVERIF_REDIRECT_URI` is optional locally if `NEXT_PUBLIC_APP_URL` points to
the backend origin. By default the callback is:

```text
http://127.0.0.1:3001/api/creator-applications/verification/callback
```
