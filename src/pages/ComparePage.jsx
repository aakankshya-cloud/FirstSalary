import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { computeSalaryBreakdown } from "../utils/salarycalculator"
import './ComparePage.css'

function OfferCard({ label, value, onChange, result }) {
    return (
        <div className="compare-card">
            <p className="compare-card-label">{label}</p>
            <input
                type="number"
                value={value}
                onChange={onChange}
                placeholder="e.g. 800000"
            />
            {result && (
                <div className="compare-result">
                    <div className="compare-row">
                        <span>Monthly take-home</span>
                        <span>₹{Math.round(result.inhand_m).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="compare-row">
                        <span>Annual take-home</span>
                        <span>₹{Math.round(result.inhand_y).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="compare-row">
                        <span>Total tax</span>
                        <span>₹{Math.round(result.tax).toLocaleString("en-IN")}</span>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function ComparePage() {
    const [ctcA, setCtcA] = useState("")
    const [ctcB, setCtcB] = useState("")
    const navigate = useNavigate()

    const resultA = ctcA > 0 ? computeSalaryBreakdown(Number(ctcA)) : null
    const resultB = ctcB > 0 ? computeSalaryBreakdown(Number(ctcB)) : null

    const diff = resultA && resultB ? resultB.inhand_y - resultA.inhand_y : null

    return (
        <div className="compare">
            <button className="casual-back" onClick={() => navigate('/')}>
                ← Back
            </button>

            <h1>Compare two offers</h1>
            <p className="compare-sub">See exactly how much more (or less) you'd actually take home.</p>

            <div className="compare-grid">
                <OfferCard label="Offer A" value={ctcA} onChange={(e) => setCtcA(e.target.value)} result={resultA} />
                <OfferCard label="Offer B" value={ctcB} onChange={(e) => setCtcB(e.target.value)} result={resultB} />
            </div>

            {diff !== null && (
                <div className={diff >= 0 ? "compare-verdict positive" : "compare-verdict negative"}>
                    {diff >= 0
                        ? `Offer B pays ₹${Math.round(diff).toLocaleString("en-IN")} more per year in-hand.`
                        : `Offer B pays ₹${Math.round(Math.abs(diff)).toLocaleString("en-IN")} less per year in-hand.`}
                </div>
            )}
        </div>
    )
}