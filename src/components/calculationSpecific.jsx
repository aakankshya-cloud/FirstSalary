import { useState } from "react"
import { useNavigate } from "react-router-dom"
import * as pdfjsLib from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min?url'
import Calculation from "./calculations"
import '../pages/SpecificMode.css'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

// Never hardcode localhost in the code you deploy — this reads from
// an env var so it works locally AND once you deploy the backend.
// Set VITE_API_URL in a .env file (see .env.example).
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function Specific() {
    const [file, setFile] = useState(null)
    const [extractedText, setExtractedText] = useState('')
    const [salaryData, setSalaryData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    function handleFile(e) {
        const uploaded = e.target.files[0]
        setError('')
        setSalaryData(null)
        if (uploaded && uploaded.type === 'application/pdf') {
            setFile(uploaded)
            extractText(uploaded)
        } else {
            setError('Please upload a PDF file.')
        }
    }

    async function extractText(pdfFile) {
        try {
            const arrayBuffer = await pdfFile.arrayBuffer()
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
            let fullText = ''
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i)
                const content = await page.getTextContent()
                const pageText = content.items.map((item) => item.str).join(' ')
                fullText += pageText + '\n'
            }
            setExtractedText(fullText)
        } catch (err) {
            setError('Could not read this PDF. Try pasting the text instead.')
        }
    }

    async function handleCalculate() {
        if (!extractedText.trim()) {
            setError('Please upload a PDF or paste offer letter text first.')
            return
        }
        setLoading(true)
        setError('')
        setSalaryData(null)
        try {
            const response = await fetch(`${API_URL}/extract-salary`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: extractedText })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong extracting the salary details.')
            }

            setSalaryData(data)
        } catch (err) {
            setError(err.message || 'Could not reach the server. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="specific">

            <button className="specific-back" onClick={() => navigate('/')}>
                ← Back
            </button>

            <h1>Specific mode</h1>
            <p className="specific-sub">Upload your offer letter or paste the text — we'll extract your CTC and calculate accordingly.</p>

            <div className="specific-options">

                <div className="specific-card">
                    <p className="specific-card-label">Option 1 — Upload PDF</p>
                    <label className="specific-upload-area">
                        <span className="specific-upload-icon">↑</span>
                        <div className="specific-upload-text">
                            <p>Click to upload</p>
                            <p>PDF files only</p>
                        </div>
                        <input type="file" accept=".pdf" onChange={handleFile} />
                    </label>
                    {file && <p className="specific-file-name">✅ {file.name}</p>}
                </div>

                <div className="specific-divider">
                    <div className="specific-divider-line"></div>
                    <span>or</span>
                    <div className="specific-divider-line"></div>
                </div>

                <div className="specific-card">
                    <p className="specific-card-label">Option 2 — Paste text</p>
                    <textarea
                        className="specific-textarea"
                        rows={6}
                        placeholder="Paste your offer letter content here..."
                        value={extractedText}
                        onChange={(e) => setExtractedText(e.target.value)}
                    />
                </div>

            </div>

            {error && <p className="specific-error">{error}</p>}

            {extractedText && (
                <button className="btn-full" onClick={handleCalculate} disabled={loading}>
                    {loading ? 'Calculating…' : 'Calculate'}
                </button>
            )}

            {salaryData && (
                <Calculation
                    CTC={salaryData.ctc}
                    basicPercent={salaryData.basic_percent}
                    hraPercent={salaryData.hra_percent}
                    hasEmployerPF={salaryData.pf}
                    hasGratuity={salaryData.gratuity}
                />
            )}

        </div>
    )
}