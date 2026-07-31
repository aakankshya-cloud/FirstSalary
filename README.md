# firstSalary

**Your CTC, decoded.** A salary calculator for Indian job offers — enter your CTC (or upload your offer letter) and get a full breakdown of Basic, HRA, PF, gratuity, tax, and your actual monthly/annual take-home, under both the new and old tax regimes.

Built because CTC numbers on offer letters are almost never what actually lands in your bank account.

## Features

- **Quick calculate** — enter your CTC and instantly see the full breakdown
- **Upload offer letter** — paste your offer letter text and let Gemini (Google's LLM) auto-extract CTC, basic %, HRA %, PF, and gratuity, so you don't have to read the fine print yourself
- **Compare two offers** side-by-side by take-home pay, not headline CTC
- **New vs old tax regime** toggle, so you can see which one actually works out better for you
- **Download as PDF** — export your breakdown to keep or share
- **Rate-limited & defensive backend** — the AI extraction endpoint is capped (20 requests / 15 min / IP) since it calls a paid API, has a strict CORS allowlist, and retries/falls back across two Gemini models if one is overloaded

## Tech stack

**Frontend:** React 19 · Vite · React Router · Vitest
**Backend:** Express 5 · Google Generative AI (Gemini) SDK · express-rate-limit · CORS
**Other:** jsPDF (PDF export) · pdf.js (reading uploaded offer letters)

## How the numbers are calculated

The core logic lives in `src/utils/salarycalculator.js` (pure functions, unit tested, no UI dependencies):

- Basic = a % of CTC (default 40%, editable)
- HRA = a % of Basic (default 50%, editable)
- Employer PF = 12% of Basic (optional, toggle-able)
- Gratuity = 4.81% of Basic (optional, toggle-able)
- Special Allowance = whatever's left of CTC after the above
- Tax is computed per FY2023-24+ slabs for both the new regime (flat slabs, ₹75k standard deduction, no HRA/80C exemptions) and a simplified old regime (lower slabs, ₹50k standard deduction)

> Note: the old-regime calculation is intentionally simplified — it doesn't model HRA exemption or itemized 80C deductions individually, so real old-regime take-home is usually a bit higher than what's shown here if you actively claim those. Good for a quick comparison, not a substitute for filing your taxes.

## Project structure

```
firstSalary/
├── server.js                  # Express API — Gemini-powered offer letter extraction
├── src/
│   ├── pages/
│   │   ├── home.jsx            # Landing page
│   │   ├── CasualMode.jsx        # Quick CTC → breakdown
│   │   └── ComparePage.jsx        # Side-by-side offer comparison
│   ├── components/
│   │   ├── calculations.jsx        # Breakdown display component
│   │   └── calculationSpecific.jsx   # Offer letter upload + AI extraction flow
│   └── utils/
│       ├── salarycalculator.js         # Pure calculation logic (tested)
│       └── downloadPdf.js               # PDF export
```

## Getting started

### Prerequisites
- Node.js 18+
- A [Gemini API key](https://ai.google.dev/) (free tier is fine) for the offer-letter extraction feature

### Setup

```bash
git clone https://github.com/aakankshya-cloud/FirstSalary.git
cd FirstSalary
npm install
```

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key
ALLOWED_ORIGIN=http://localhost:5173
PORT=3001
```

Run the frontend and backend (in two terminals):

```bash
npm run dev        # frontend, http://localhost:5173
node server.js      # backend, http://localhost:3001
```

The "Quick calculate" and "Compare" modes work entirely client-side and don't need the backend. Only "Upload offer letter" calls the Gemini API via `server.js`.

### Running tests

```bash
npm test
```

Vitest unit tests cover the calculation logic in `src/utils/salarycalculator.test.js`.

### Building for production

```bash
npm run build
npm run preview
```

## Deploying

- **Frontend**: any static host (Vercel, Netlify) — just run `npm run build` and deploy `dist/`.
- **Backend**: any Node host (Render, Railway, Fly.io) — set `GEMINI_API_KEY` and `ALLOWED_ORIGIN` (your deployed frontend URL) as environment variables.

## License

MIT — see [LICENSE](./LICENSE).