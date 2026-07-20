import Home from "./pages/home";
import Specific from "./components/calculationSpecific";
import { Routes, Route } from "react-router-dom";
import Casual from "./pages/CasualMode";
import ComparePage from "./pages/ComparePage";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/CasualMode" element={<Casual />} />
            <Route path="/calculationSpecific" element={<Specific />} />
            <Route path="/compare" element={<ComparePage />} />
        </Routes>
    )
}
export default App;