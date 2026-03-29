# Gen Z AI Resume Maker

A full-stack resume maker built with Next.js that includes:

- Form-based resume input
- Real-time editable preview
- AI resume optimization endpoint
- Inbuilt ATS scoring endpoint
- Skill-to-link integration (skill hub links)

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## AI Setup (Optional)

Add an OpenAI key in `.env.local`:

```bash
OPENAI_API_KEY=your_key_here
```

If no key is provided, the app uses a heuristic optimizer fallback.

## Scripts

- `npm run dev` - start local dev server
- `npm run lint` - run ESLint
- `npm run build` - create production build
- `npm run start` - run production server
