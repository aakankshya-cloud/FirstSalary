import { computeSalaryBreakdown } from "../utils/salarycalculator"
import { downloadBreakdownPdf } from "../utils/downloadPdf"

function Calculation({ CTC, basicPercent, hraPercent, hasEmployerPF, hasGratuity, regime = 'new' }) {
    const breakdown = computeSalaryBreakdown(CTC, {
        basicPercent,
        hraPercent,
        hasEmployerPF,
        hasGratuity,
        regime,
    })

    const {
        Basic,
        HRA,
        Employer_PF,
        Gratuity,
        Special_Allowance,
        Employee_PF,
        prof_tax,
        tax,
        inhand_y,
        inhand_m,
    } = breakdown

    return (
        <div className="casual-divider">
            <p className="casual-section-label">Salary breakdown</p>

            <div className="casual-group">
                <p className="casual-group-label">Components</p>
                <div className="casual-rows">
                    <div className="casual-row">
                        <span>Basic</span>
                        <span>₹{Basic.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="casual-row">
                        <span>HRA</span>
                        <span>₹{HRA.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="casual-row">
                        <span>Special allowance</span>
                        <span>₹{Special_Allowance.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="casual-row">
                        <span>Employer PF</span>
                        <span>₹{Employer_PF.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="casual-row">
                        <span>Gratuity</span>
                        <span>₹{Gratuity.toLocaleString("en-IN")}</span>
                    </div>
                </div>
            </div>

            <div className="casual-group">
                <p className="casual-group-label">Deductions</p>
                <div className="casual-rows">
                    <div className="casual-row deduction">
                        <span>Employee PF</span>
                        <span>− ₹{Employee_PF.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="casual-row deduction">
                        <span>Professional tax</span>
                        <span>− ₹{prof_tax.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="casual-row deduction">
                        <span>Income tax ({regime === 'old' ? 'old regime' : 'new regime'})</span>
                        <span>− ₹{tax.toLocaleString("en-IN")}</span>
                    </div>
                </div>
            </div>

            <div className="casual-takehome">
                <div className="takehome-card">
                    <p>Monthly take-home</p>
                    <p>₹{Math.round(inhand_m).toLocaleString("en-IN")}</p>
                </div>
                <div className="takehome-card highlight">
                    <p>Annual take-home</p>
                    <p>₹{Math.round(inhand_y).toLocaleString("en-IN")}</p>
                </div>
            </div>

            <button
                className="btn-secondary casual-download-btn"
                onClick={() => downloadBreakdownPdf({ CTC, ...breakdown })}
            >
                ⬇ Download PDF
            </button>
        </div>
    )
}

export default Calculation