import { useNavigate } from "react-router-dom"
import './home.css'

export default function Home() {
    const navigate = useNavigate()
    return (
        <div className="home">

            <div className="home-logo">
                <div className="home-logo-box">₹</div>
                <span>firstSalary</span>
            </div>

            <h1 className="home-headline">Your CTC, decoded.</h1>
            <p className="home-sub">Enter your CTC and get a full salary breakdown — basic, HRA, PF, tax, and your actual take-home. No guesswork.</p>

            <div className="home-buttons">
                <button className="btn-primary" onClick={() => navigate('/CasualMode')}>Quick calculate</button>
                <button className="btn-secondary" onClick={() => navigate('/calculationSpecific')}>Upload offer letter</button>
                <button className="btn-secondary" onClick={() => navigate('/compare')}>Compare two offers</button>
            </div>

            <div className="home-divider">
                <p className="home-section-label">What you get</p>
                <div className="home-cards">
                    <div className="home-card">
                        <span className="home-card-icon">🏦</span>
                        <h3>Salary components</h3>
                        <p>Basic, HRA, special allowance</p>
                    </div>
                    <div className="home-card">
                        <span className="home-card-icon">🧾</span>
                        <h3>Deductions</h3>
                        <p>PF, professional tax, TDS</p>
                    </div>
                    <div className="home-card">
                        <span className="home-card-icon">👛</span>
                        <h3>Take-home</h3>
                        <p>Monthly and annual in-hand</p>
                    </div>
                </div>
            </div>

            <p className="home-quote">"Your current salary reflects where you are today. Your potential reflects where you can be tomorrow."</p>

        </div>
    )
}