// Pure calculation logic — no React, no UI.
// Extracted from calculations.jsx so it can be reused by CasualMode,
// Specific mode, and the Compare page, and so it can be unit tested
// on its own without rendering anything.

// --- Tax calculation, split out by regime ---

// New regime (default since FY 2023-24): flat slabs, no HRA/80C deductions,
// but taxable income up to 12L is effectively tax-free (87A rebate).
function computeNewRegimeTax(taxableIncome) {
    let tax = 0
    if (taxableIncome > 400000) tax += (Math.min(taxableIncome, 800000) - 400000) * 0.05
    if (taxableIncome > 800000) tax += (Math.min(taxableIncome, 1200000) - 800000) * 0.10
    if (taxableIncome > 1200000) tax += (Math.min(taxableIncome, 1600000) - 1200000) * 0.15
    if (taxableIncome > 1600000) tax += (Math.min(taxableIncome, 2000000) - 1600000) * 0.20
    if (taxableIncome > 2000000) tax += (Math.min(taxableIncome, 2400000) - 2000000) * 0.25
    if (taxableIncome > 2400000) tax += (taxableIncome - 2400000) * 0.30

    if (taxableIncome <= 1200000) tax = 0
    return tax
}

// Old regime: lower slabs but allows deductions (80C, HRA exemption, etc).
// This is a SIMPLIFIED version — it does not model HRA exemption or 80C
// investment deductions individually, only the flat ₹50,000 standard
// deduction. Real old-regime tax owed will usually be lower than this if
// the person claims HRA exemption or 80C. Good enough for a comparison
// estimate, not a substitute for a tax filing tool.
function computeOldRegimeTax(taxableIncome) {
    let tax = 0
    if (taxableIncome > 250000) tax += (Math.min(taxableIncome, 500000) - 250000) * 0.05
    if (taxableIncome > 500000) tax += (Math.min(taxableIncome, 1000000) - 500000) * 0.20
    if (taxableIncome > 1000000) tax += (taxableIncome - 1000000) * 0.30

    // Section 87A rebate — old regime, taxable income up to 5L is tax-free
    if (taxableIncome <= 500000) tax = 0
    return tax
}

export function computeSalaryBreakdown(ctc, options = {}) {
    const {
        basicPercent = 40,
        hraPercent = 50,
        hasEmployerPF = true,
        hasGratuity = true,
        regime = 'new', // 'new' | 'old'
    } = options

    const Basic = (basicPercent / 100) * ctc
    const HRA = (hraPercent / 100) * Basic
    const Employer_PF = hasEmployerPF ? (12 / 100) * Basic : 0
    const Gratuity = hasGratuity ? (4.81 / 100) * Basic : 0
    const balance = Basic + HRA + Employer_PF + Gratuity
    const Special_Allowance = Math.max(ctc - balance, 0)
    const Gross = Basic + HRA + Special_Allowance
    const Employee_PF = hasEmployerPF ? (12 / 100) * Basic : 0
    const prof_tax = 2400

    const standardDeduction = regime === 'old' ? 50000 : 75000
    const Tincome = Math.max(Gross - standardDeduction, 0)

    const tax = regime === 'old'
        ? computeOldRegimeTax(Tincome)
        : computeNewRegimeTax(Tincome)

    const inhand_y = Gross - Employee_PF - prof_tax - tax
    const inhand_m = inhand_y / 12

    return {
        Basic,
        HRA,
        Employer_PF,
        Gratuity,
        Special_Allowance,
        Gross,
        Employee_PF,
        prof_tax,
        tax,
        inhand_y,
        inhand_m,
        regime,
    }
}