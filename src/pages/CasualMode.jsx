import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Calculation from "../components/calculations"
import './CausalMode.css'

export default function Casual() {
    const [ctc, setCtc] = useState(null)
    const [input, setInput] = useState("")
    const [regime, setRegime] = useState('new')
    const navigate = useNavigate()

    return (
        <div className="casual">

            <button className="casual-back" onClick={() => navigate('/')}>
                ← Back
            </button>

            <h1>Quick calculate</h1>
            <p className="casual-sub">Enter your annual CTC to see the full breakdown.</p>

            <div className="casual-input-row">
                <input
                    type="number"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g. 800000"
                />
                <button className="btn-primary" onClick={() => setCtc(Number(input))}>Calculate</button>
            </div>

            <div className="regime-toggle">
                <span className="regime-label">Tax regime</span>
                <div className="regime-switch">
                    <button
                        className={regime === 'new' ? 'regime-option active' : 'regime-option'}
                        onClick={() => setRegime('new')}
                    >
                        New
                    </button>
                    <button
                        className={regime === 'old' ? 'regime-option active' : 'regime-option'}
                        onClick={() => setRegime('old')}
                    >
                        Old
                    </button>
                </div>
            </div>
            {regime === 'old' && (
                <p className="regime-note">
                    Old regime here uses only the flat ₹50,000 standard deduction — it doesn't
                    factor in HRA exemption or 80C investments, so your actual old-regime tax
                    could be lower than shown.
                </p>
            )}

            {ctc > 0 && <Calculation CTC={ctc} regime={regime} />}

        </div>
    )
}