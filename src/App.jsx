import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import FreeAssessment from './pages/FreeAssessment';
import FarmerPortal from './pages/FarmerPortal';
import LenderPortal from './pages/LenderPortal';

function App() {
  return (
    <Router basename="/ArkaRisk">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/assessment/*" element={<FreeAssessment />} />
        <Route path="/farmer/*" element={<FarmerPortal />} />
        <Route path="/lender/*" element={<LenderPortal />} />
      </Routes>
    </Router>
  );
}

export default App;
