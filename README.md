# NyayaSetu Frontend

This repository contains the NyayaSetu frontend intended for smooth production hosting on Vercel, with the backend served separately from Hugging Face Spaces.

Recommended deployment split:

- Frontend: Vercel
- Backend API: Hugging Face Space
- Frontend custom domain: `[Link(https://nyaya-lens.vercel.app/)`
- Backend API URL: `https://abhishek785-nyaya-setu.hf.space/api/v1`

## Environment variables

Create a local `.env` file or add these in Vercel:


```bash
VITE_API_BASE_URL=https://abhishek785-nyaya-setu.hf.space/api/v1
VITE_SWAGGER_URL=https://abhishek785-nyaya-setu.hf.space/docs
```

If you later move the backend to a branded API subdomain, update the same variables.

## Local development

```sh
npm i
npm run dev
```

## Production deployment on Vercel

1. Import this repository into Vercel.
2. Framework preset: `Vite`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Add the environment variables from `.env.example`.
6. Add your custom domain in Vercel after the first deploy.

This repository already includes a `vercel.json` SPA rewrite so direct route refreshes work in production.

## Custom domain pattern

Recommended setup:

- `www.yourdomain.com` -> Vercel frontend
- `api` stays on Hugging Face initially, or later moves to a branded backend domain

If you use a frontend custom domain, make sure the backend CORS configuration allows that frontend origin.

## Stack

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
