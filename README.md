# Archangels Guild API

Minimal Next.js API-only project deployed on Vercel.
Handles image upload and deletion to Google Drive.

## Environment Variables (set in Vercel dashboard)

```
GOOGLE_APPS_SCRIPT_URL=
GOOGLE_APPS_SCRIPT_API_KEY=
GOOGLE_DRIVE_FOLDER_ID=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Endpoints

- `POST /api/upload` — Upload image to Google Drive
- `POST /api/delete-image` — Delete image from Google Drive
