// Pure calculation logic — no React, no UI.
// Updated for Tax Year / FY 2026-27 (AY 2027-28) under the Income-tax Act, 2025
// (effective 1 April 2026). Slabs, rebate and standard deduction are unchanged
// from FY 2025-26; the new Act only renumbered sections
// (new regime: s.115BAC -> s.202, rebate: s.87A -> s.156, employer NPS: 80CCD(2) -> s.124/125).

const CESS_RATE = 0.04                 // Health & Education Cess, on tax after rebate
const EMPLOYER_NPS_CAP_NEW = 0.14      // of Basic (+DA), new regime, all employers
const EMPLOYER_NPS_CAP_OLD = 0.10      // of Basic (+DA), old regime, private employers
const EMPLOYER_FUND_LIMIT = 750000     // employer PF + NPS (+ superannuation) above this is taxable

// --- Tax calculation, split out by regime (returns tax BEFORE cess) ---

// New regime (default): 0/5/10/15/20/25/30% slabs, rebate makes taxable
// income up to 12L tax-free, with marginal relief just above 12L.
function computeNewRegimeTax(taxableIncome) {
    let tax = 0
    if (taxableIncome > 400000) tax += (Math.min(taxableIncome, 800000) - 400000) * 0.05
    if (taxableIncome > 800000) tax += (Math.min(taxableIncome, 1200000) - 800000) * 0.10
    if (taxableIncome > 1200000) tax += (Math.min(taxableIncome, 1600000) - 1200000) * 0.15
    if (taxableIncome > 1600000) tax += (Math.min(taxableIncome, 2000000) - 1600000) * 0.20
    if (taxableIncome > 2000000) tax += (Math.min(taxableIncome, 2400000) - 2000000) * 0.25
    if (taxableIncome > 2400000) tax += (taxableIncome - 2400000) * 0.30

    if (taxableIncome <= 1200000) return 0
    // Marginal relief: tax can't exceed the income above 12L
    return Math.min(tax, taxableIncome - 1200000)
}

// Old regime: 2.5L/5L/10L slabs, rebate up to 5L taxable income.
// SIMPLIFIED: HRA exemption, 80C, 80D, home-loan interest etc. are not modelled;
// only standard deduction, professional tax and employer NPS (10%).
function computeOldRegimeTax(taxableIncome) {
    let tax = 0
    if (taxableIncome > 250000) tax += (Math.min(taxableIncome, 500000) - 250000) * 0.05
    if (taxableIncome > 500000) tax += (Math.min(taxableIncome, 1000000) - 500000) * 0.20
    if (taxableIncome > 1000000) tax += (taxableIncome - 1000000) * 0.30

    if (taxableIncome <= 500000) tax = 0
    return tax
}

// Professional tax is a STATE levy; partial lookup, default ₹2,400/yr.
const PROFESSIONAL_TAX_BY_STATE = {
    karnataka: 2400,
    maharashtra: 2500,
    'west bengal': 2400,
    'tamil nadu': 2400,
    telangana: 2400,
    'andhra pradesh': 2400,
    gujarat: 2400,
    delhi: 0,
    haryana: 0,
    up: 0,
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
        employerNPSPercent = 0, // % of Basic put into employer NPS (0 = none)
        regime = 'new',         // 'new' | 'old'
        state = null,
    } = options

    const isOld = regime === 'old'

    const Basic = (basicPercent / 100) * ctc
    const HRA = (hraPercent / 100) * Basic
    const Employer_PF = hasEmployerPF ? (12 / 100) * Basic : 0
    const Gratuity = hasGratuity ? (4.81 / 100) * Basic : 0

    // Employer NPS is part of CTC (not paid in hand). Only the portion up to the
    // regime cap is deductible; anything above stays taxable.
    const Employer_NPS = (employerNPSPercent / 100) * Basic
    const npsCap = (isOld ? EMPLOYER_NPS_CAP_OLD : EMPLOYER_NPS_CAP_NEW) * Basic
    const npsDeductible = Math.min(Employer_NPS, npsCap)

    const balance = Basic + HRA + Employer_PF + Gratuity + Employer_NPS
    const Special_Allowance = Math.max(ctc - balance, 0)
    const Gross = Basic + HRA + Special_Allowance
    const Employee_PF = hasEmployerPF ? (12 / 100) * Basic : 0
    const prof_tax = getProfessionalTax(state)

    // Employer PF + NPS above ₹7.5L a year is taxable as a perquisite
    const excessEmployerFunds = Math.max(Employer_PF + Employer_NPS - EMPLOYER_FUND_LIMIT, 0)

    const standardDeduction = isOld ? 50000 : 75000
    // Professional tax is deductible from salary only in the old regime
    const ptDeduction = isOld ? prof_tax : 0

    const Tincome = Math.max(
        Gross + excessEmployerFunds - standardDeduction - ptDeduction - npsDeductible,
        0
    )

    const taxBeforeCess = isOld
        ? computeOldRegimeTax(Tincome)
        : computeNewRegimeTax(Tincome)
    const cess = taxBeforeCess * CESS_RATE
    const tax = taxBeforeCess + cess

    const inhand_y = Gross - Employee_PF - prof_tax - tax
    const inhand_m = inhand_y / 12

    return {
        Basic,
        HRA,
        Employer_PF,
        Employer_NPS,
        Gratuity,
        Special_Allowance,
        Gross,
        Employee_PF,
        prof_tax,
        taxableIncome: Tincome,
        taxBeforeCess,
        cess,
        tax,
        inhand_y,
        inhand_m,
        regime,
    }
}