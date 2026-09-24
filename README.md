# Nutri-Receipt AI (Clean Rebuild)

This project is a clean, understandable rebuild of the Nutri-Receipt AI experience. It keeps the same MVP flow as the reference app:

- choose preferences
- create or upload a basket
- review receipt lines
- get deterministic healthy swap recommendations
- apply or dismiss recommendations
- capture anonymous feedback

## Local run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open http://localhost:3000.

## API routes

- POST /api/health
- POST /api/session
- POST /api/catalog-match
- POST /api/receipt
- POST /api/optimize
- POST /api/explain
- POST /api/feedback

## Required environment variables

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
OPENAI_VISION_MODEL=gpt-4o-mini
NEXT_PUBLIC_APP_CURRENCY=USD
APP_SESSION_SECRET=development-secret
```

The app works without a live OpenAI key because the server falls back to deterministic explanations and manual receipt entry. The API key is still kept in environment variables, as requested.
