import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Tractor, Landmark, ShieldCheck } from 'lucide-react';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Top Navigation */}
      <header className="landing-header">
        <div className="logo-container">
          <ShieldCheck size={28} className="logo-icon" color="#2c8e54" />
          <span className="logo-text">ArkaRisk</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="landing-main">
        {/* Left Side: Landscape Image */}
        <div className="hero-image-container">
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop" 
            alt="Lush green farm landscape" 
            className="hero-image"
          />
          <div className="hero-overlay"></div>
        </div>

        {/* Right Side: Options List */}
        <div className="options-container">
          
          {/* Card 1: Free Assessment */}
          <div className="option-card primary-card" onClick={() => navigate('/assessment/location')}>
            <div className="card-content">
              <Globe size={40} className="card-icon white-icon" />
              <div className="card-text">
                <h2>Start Free Assessment</h2>
                <p>Check your land's climate risk profile with no login required.</p>
              </div>
            </div>
            <button className="btn-primary-inverse">GET STARTED</button>
          </div>

          {/* Card 2: Farmer Login */}
          <div className="option-card secondary-card" onClick={() => navigate('/farmer/login')}>
            <div className="card-content">
              <Tractor size={40} className="card-icon green-icon" />
              <div className="card-text">
                <h2>Farmer Login</h2>
                <p>Access your personalized risk reports and manage farm data.</p>
              </div>
            </div>
            <button className="btn-primary">LOG IN</button>
          </div>

          {/* Card 3: Lender Login */}
          <div className="option-card secondary-card" onClick={() => navigate('/lender/login')}>
            <div className="card-content">
              <Landmark size={40} className="card-icon blue-icon" />
              <div className="card-text">
                <h2>Bank/Lender Login</h2>
                <p>Evaluate loan portfolios and monitor climate exposure.</p>
              </div>
            </div>
            <button className="btn-blue">LOG IN</button>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-copyright">
          © 2024 ArkaRisk. Climate-Smart Agriculture.
        </div>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Support</a>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
