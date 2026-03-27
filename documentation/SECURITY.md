# Security Notes - GROQ API Integration

## ✅ API Key is Already Secure

The GROQ API key is **properly secured** and **not exposed to users**:

### Server-Side Only
- **Location**: `.env.local` (never committed to git)
- **Usage**: Only in `/app/api/generate-roadmap/route.ts` (server-side API route)
- **Access**: `process.env.GROQ_API_KEY` (Node.js environment, not browser)

### What Users See
- ❌ **NOT exposed**: API key never sent to browser
- ✅ **Frontend**: Only calls `/api/generate-roadmap` endpoint
- ✅ **Network**: No API key in requests/responses

### Scripts Folder
The `scripts/` folder is:
- **Development tool only** (not part of Next.js build)
- **Not served** to users (not in `public/` or `app/`)
- **Optional** (Python script for CLI testing, not required for production)

## How It Works

```
User Browser → Next.js API Route → GROQ API
            (no API key)      (API key here)
```

1. User types prompt in browser
2. Frontend sends prompt to `/api/generate-roadmap`
3. **Server-side** route.ts calls GROQ with API key
4. Returns JSON roadmap to user

## Best Practices ✅

- [x] API key in `.env.local` (gitignored)
- [x] Server-side API route only
- [x] No client-side GROQ calls
- [x] Scripts folder not web-accessible
- [x] Rate limiting (TODO: add if needed)

## Setup Checklist

1. Add to `.env.local` (not `.env`):
   ```
   GROQ_API_KEY=gsk_...
   ```
2. Never commit `.env.local` to git
3. Use same key in production env vars

Your API key is safe! 🔒
