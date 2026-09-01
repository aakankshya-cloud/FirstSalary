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

    if (taxableIncome <= 1200000) {
        tax = 0
    } else {
        // Marginal relief (Section 87A): just above the 12L rebate threshold,
        // tax owed is capped at the amount of income that exceeds 12L, so a
        // rupee more income can never leave you worse off than earning
        // exactly 12L. Without this, tax jumps discontinuously at the
        // boundary instead of phasing in smoothly.
        const excessOverThreshold = taxableIncome - 1200000
        tax = Math.min(tax, excessOverThreshold)
    }
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

// Professional tax is levied by STATE governments, not the centre — it is
// not a single national number. This is a partial lookup covering a few
// major states; anything not listed falls back to the most common slab
// (₹2,400/year) as a reasonable estimate. This is still a simplification:
// some states use monthly slabs based on salary band rather than one flat
// annual figure. Good enough for a comparison estimate, not exact for
// every state.
const PROFESSIONAL_TAX_BY_STATE = {
    karnataka: 2400,
    maharashtra: 2500,
    'west bengal': 2400,
    'tamil nadu': 2400,
    telangana: 2400,
    'andhra pradesh': 2400,
    gujarat: 2400,
    delhi: 0,       // no professional tax levied
    haryana: 0,      // no professional tax levied
    up: 0,           // no professional tax levied
}
const DEFAULT_PROFESSIONAL_TAX = 2400

function getProfessionalTax(state) {
    if (!state) return DEFAULT_PROFESSIONAL_TAX
    const key = state.trim().toLowerCase()
    return key in PROFESSIONAL_TAX_BY_STATE
        ? PROFESSIONAL_TAX_BY_STATE[key]
        : DEFAULT_PROFESSIONAL_TAX
}

export function computeSalaryBreakdown(ctc, options = {}) {
    const {
        basicPercent = 40,
        hraPercent = 50,
        hasEmployerPF = true,
        hasGratuity = true,
        regime = 'new', // 'new' | 'old'
        state = null,   // optional — e.g. 'Karnataka'; falls back to a default estimate if omitted
    } = options

    const Basic = (basicPercent / 100) * ctc
    const HRA = (hraPercent / 100) * Basic
    const Employer_PF = hasEmployerPF ? (12 / 100) * Basic : 0
    const Gratuity = hasGratuity ? (4.81 / 100) * Basic : 0
    const balance = Basic + HRA + Employer_PF + Gratuity
    const Special_Allowance = Math.max(ctc - balance, 0)
    const Gross = Basic + HRA + Special_Allowance
    const Employee_PF = hasEmployerPF ? (12 / 100) * Basic : 0
    const prof_tax = getProfessionalTax(state)

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