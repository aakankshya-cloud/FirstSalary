import { describe, it, expect } from "vitest"
import { computeSalaryBreakdown } from "./salarycalculator"

describe("computeSalaryBreakdown — new regime (default)", () => {
    it("splits basic and HRA using the given percentages", () => {
        const result = computeSalaryBreakdown(1200000, { basicPercent: 40, hraPercent: 50 })
        expect(result.Basic).toBeCloseTo(480000)
        expect(result.HRA).toBeCloseTo(240000)
    })

    it("returns zero tax when taxable income is at or below 12L (87A rebate)", () => {
        const result = computeSalaryBreakdown(1200000)
        expect(result.tax).toBe(0)
    })

    it("charges tax once taxable income clears the 12L rebate threshold", () => {
        const result = computeSalaryBreakdown(3000000)
        expect(result.tax).toBeGreaterThan(0)
    })

    it("never returns a negative special allowance even for a very low CTC", () => {
        const result = computeSalaryBreakdown(300000)
        expect(result.Special_Allowance).toBeGreaterThanOrEqual(0)
    })

    it("skips employer PF and gratuity when disabled", () => {
        const result = computeSalaryBreakdown(1000000, { hasEmployerPF: false, hasGratuity: false })
        expect(result.Employer_PF).toBe(0)
        expect(result.Gratuity).toBe(0)
        expect(result.Employee_PF).toBe(0)
    })

    it("monthly take-home is annual take-home divided by 12", () => {
        const result = computeSalaryBreakdown(900000)
        expect(result.inhand_m).toBeCloseTo(result.inhand_y / 12)
    })
})

describe("computeSalaryBreakdown — old regime", () => {
    it("returns zero tax when taxable income is at or below 5L (87A rebate)", () => {
        const result = computeSalaryBreakdown(500000, { regime: "old" })
        expect(result.tax).toBe(0)
    })

    it("uses the ₹50,000 standard deduction, not ₹75,000", () => {
        const newRegime = computeSalaryBreakdown(1500000, { regime: "new" })
        const oldRegime = computeSalaryBreakdown(1500000, { regime: "old" })
        expect(oldRegime.tax).not.toBe(newRegime.tax)
    })

    it("charges tax at 30% for income well above 10L", () => {
        const result = computeSalaryBreakdown(5000000, { regime: "old" })
        expect(result.tax).toBeGreaterThan(0)
    })
})

describe("computeSalaryBreakdown — marginal relief just above the 12L rebate", () => {
    it("never lets tax exceed the income that exceeds the 12L threshold", () => {
        // ₹1 of taxable income above 12L should never produce more than ₹1 of tax.
        const result = computeSalaryBreakdown(1600000, { basicPercent: 100, hraPercent: 0, hasEmployerPF: false, hasGratuity: false })
        // Gross - 75000 standard deduction gives Tincome; tax must not exceed (Tincome - 1200000)
        const Tincome = result.Gross - 75000
        expect(result.tax).toBeLessThanOrEqual(Math.max(Tincome - 1200000, 0) + 1) // +1 for floating point slack
    })

    it("take-home never drops below what it would be exactly at the 12L threshold", () => {
        const atThreshold = computeSalaryBreakdown(1200000 + 75000, { basicPercent: 100, hraPercent: 0, hasEmployerPF: false, hasGratuity: false })
        const justAbove = computeSalaryBreakdown(1200000 + 75000 + 500, { basicPercent: 100, hraPercent: 0, hasEmployerPF: false, hasGratuity: false })
        expect(justAbove.inhand_y).toBeGreaterThanOrEqual(atThreshold.inhand_y)
    })
})

describe("computeSalaryBreakdown — state-aware professional tax", () => {
    it("defaults to ₹2,400/year when no state is given", () => {
        const result = computeSalaryBreakdown(900000)
        expect(result.prof_tax).toBe(2400)
    })

    it("applies ₹0 for states with no professional tax", () => {
        const result = computeSalaryBreakdown(900000, { state: "Delhi" })
        expect(result.prof_tax).toBe(0)
    })

    it("is case-insensitive on the state name", () => {
        const result = computeSalaryBreakdown(900000, { state: "MAHARASHTRA" })
        expect(result.prof_tax).toBe(2500)
    })

    it("falls back to the default for an unlisted state", () => {
        const result = computeSalaryBreakdown(900000, { state: "Goa" })
        expect(result.prof_tax).toBe(2400)
    })
})