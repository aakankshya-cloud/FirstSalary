// Requires: npm install jspdf
import jsPDF from "jspdf"

const inr = (n) => `Rs. ${Math.round(n).toLocaleString("en-IN")}`

export function downloadBreakdownPdf(data) {
    const {
        CTC,
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
        regime,
    } = data

    const doc = new jsPDF()
    let y = 20

    doc.setFontSize(18)
    doc.text("firstSalary — Breakdown", 14, y)
    y += 10

    doc.setFontSize(10)
    doc.text(`Regime: ${regime === "old" ? "Old regime" : "New regime"}`, 14, y)
    y += 6
    doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, y)
    y += 12

    doc.setFontSize(13)
    doc.text(`Annual CTC: ${inr(CTC)}`, 14, y)
    y += 12

    doc.setFontSize(12)
    doc.text("Components", 14, y)
    y += 7
    doc.setFontSize(10)
    ;[
        ["Basic", Basic],
        ["HRA", HRA],
        ["Special allowance", Special_Allowance],
        ["Employer PF", Employer_PF],
        ["Gratuity", Gratuity],
    ].forEach(([label, value]) => {
        doc.text(label, 14, y)
        doc.text(inr(value), 160, y, { align: "right" })
        y += 6
    })

    y += 6
    doc.setFontSize(12)
    doc.text("Deductions", 14, y)
    y += 7
    doc.setFontSize(10)
    ;[
        ["Employee PF", Employee_PF],
        ["Professional tax", prof_tax],
        ["Income tax", tax],
    ].forEach(([label, value]) => {
        doc.text(label, 14, y)
        doc.text(`- ${inr(value)}`, 160, y, { align: "right" })
        y += 6
    })

    y += 10
    doc.setFontSize(13)
    doc.text("Monthly take-home", 14, y)
    doc.text(inr(inhand_m), 160, y, { align: "right" })
    y += 8
    doc.text("Annual take-home", 14, y)
    doc.text(inr(inhand_y), 160, y, { align: "right" })

    doc.save("salary-breakdown.pdf")
}