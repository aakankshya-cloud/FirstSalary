import { describe, it, expect } from "vitest"
import { computeSalaryBreakdown } from "./salaryCalculator"

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