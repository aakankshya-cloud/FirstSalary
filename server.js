import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { GoogleGenerativeAI } from '@google/generative-ai'
import 'dotenv/config'

if (!process.env.GEMINI_API_KEY) {
    console.error('Missing GEMINI_API_KEY in .env — server cannot start.')
    process.exit(1)
}

const app = express()

// Only allow your actual frontend to call this API — not literally anyone
// on the internet. Set ALLOWED_ORIGIN in .env once you deploy.
const allowedOrigins = (process.env.ALLOWED_ORIGIN || 'http://localhost:5173').split(',')
app.use(cors({ origin: allowedOrigins }))
app.use(express.json({ limit: '200kb' }))

// This endpoint calls a paid Gemini API — without a limit, anyone who finds
// the URL can hammer it and run up your bill. 20 requests / 15 min / IP.
const extractLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again in a few minutes.' },
})

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

app.get('/test', (req, res) => res.json({ ok: true }))

app.post('/extract-salary', extractLimiter, async (req, res) => {
    try {
        const { text } = req.body

        if (!text || typeof text !== 'string' || !text.trim()) {
            return res.status(400).json({ error: 'No offer letter text provided.' })
        }
        if (text.length > 20000) {
            return res.status(400).json({ error: 'That text is too long. Please shorten it and try again.' })
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

        const prompt = `Extract salary details from this offer letter and return ONLY a JSON object with these exact fields, no extra text, no markdown, no backticks:
        {
            "ctc": number,
            "basic_percent": number,
            "hra_percent": number,
            "pf": boolean,
            "gratuity": boolean
        }
        If a value is not mentioned use these defaults: basic_percent: 40, hra_percent: 50, pf: true, gratuity: true.

        Offer letter text:
        ${text}`

        const result = await model.generateContent(prompt)
        const responseText = result.response.text()

        // Gemini sometimes wraps JSON in ```json fences or adds stray text
        // even when told not to — pull out just the {...} block defensively.
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            return res.status(502).json({ error: 'Could not find salary details in this document.' })
        }

        let json
        try {
            json = JSON.parse(jsonMatch[0])
        } catch {
            return res.status(502).json({ error: 'Could not parse the extracted salary details.' })
        }

        if (typeof json.ctc !== 'number' || json.ctc <= 0) {
            return res.status(422).json({ error: 'Could not find a valid CTC in this document.' })
        }

        res.json(json)

    } catch (err) {
        console.error('Error extracting salary:', err.message)
        res.status(500).json({ error: 'Something went wrong while processing this document.' })
    }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))