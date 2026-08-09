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
- React.js 
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

## Screenshots
<img width="800"  alt="Screenshot 2026-08-10 013008" src="https://github.com/user-attachments/assets/29be726c-8385-4828-bda0-ed29af3f10cf" />
<img width="800"  alt="Screenshot 2026-08-10 013158" src="https://github.com/user-attachments/assets/314f69e3-e834-4042-89c7-b8f9dc42de8b" />
<img width="800"  alt="Screenshot 2026-08-10 013204" src="https://github.com/user-attachments/assets/65a1f8c8-b729-4585-bfc7-004843b143dc" />
<img width="800"  alt="Screenshot 2026-08-10 013253" src="https://github.com/user-attachments/assets/4af6b7be-09cc-420c-a85d-4ca21c95ce03" />
<img width="800"  alt="Screenshot 2026-08-10 013534" src="https://github.com/user-attachments/assets/27b07e05-3888-4d51-af1e-e1e1f850f6e2" />
<img width="800"  alt="Screenshot 2026-08-10 013542" src="https://github.com/user-attachments/assets/b03d620a-445e-43fd-9b36-d45fbfb9e33f" />
<img width="800" alt="Screenshot 2026-08-10 013607" src="https://github.com/user-attachments/assets/bd676d56-1528-4ca7-a3f3-63b6b47ed07c" />

