import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ShieldCheck, Tractor, Phone, ChevronRight, FileText, Home, Sprout, Settings, Plus } from 'lucide-react';
import { sendFarmerOTP, verifyFarmerOTP, fetchFarmerProfile, fetchFarmerApplications, logout } from '../lib/api';
import './FarmerPortal.css';

const FarmerLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSendOTP = async () => {
    try {
      if (phone.length >= 10) {
        const res = await sendFarmerOTP(phone);
        if (res.otp) {
          setNotification({ otp: res.otp, phone });
        }
        setStep(2);
        setError('');
      } else {
        setError('Enter a valid 10-digit number');
      }
    } catch(err) {
      console.error(err);
      setError('Failed to send OTP');
    }
  };

  const handleVerify = async () => {
    try {
      if (otp.length === 4) {
        const res = await verifyFarmerOTP(phone, otp);
        if (res.token) {
           navigate('/farmer/dashboard');
        } else {
           setError('Verification failed');
        }
      } else {
        setError('OTP must be 4 digits');
      }
    } catch(err) {
      console.error(err);
      setError('Invalid OTP');
    }
  };

  return (
    <div className="farmer-login-wrapper">
      {notification && (
        <div className="mock-sms-toast">
          <div className="sms-header">
             <div className="sms-app-name">MESSAGES</div>
             <div className="sms-time">Now</div>
          </div>
          <div className="sms-body">
            <strong>ArkaRisk:</strong> Your Farmer Portal OTP is <span>{notification.otp}</span>. Do not share this with anyone.
          </div>
          <div className="sms-handle" />
        </div>
      )}

      <div className="farmer-login-card">
        <div className="login-icon-frame">
          <Tractor size={32} color="#2e6f40" />
        </div>
        <h2>Farmer Portal</h2>
        <p>Manage your farm risk profiles and loans</p>

        {error && <div style={{color: 'red', marginBottom: 16, fontSize: 14}}>{error}</div>}

        {step === 1 ? (
          <>
            <div className="input-group">
              <label className="input-label">Mobile Number</label>
              <input 
                type="tel" 
                className="phone-input" 
                placeholder="e.g. 9999999999"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
              <span style={{fontSize: 12, color: '#6b7280', marginTop: 8, display: 'block'}}>Please check the developer console for the OTP when testing locally!</span>
            </div>
            <button className="btn-login" onClick={handleSendOTP}>
              Send OTP
            </button>
          </>
        ) : (
          <>
            <div className="input-group">
              <label className="input-label">Enter OTP</label>
              <input 
                type="number" 
                className="phone-input" 
                placeholder="1234"
                value={otp}
                onChange={e => setOtp(e.target.value)}
              />
            </div>
            <button className="btn-login" onClick={handleVerify}>
              Verify & Login
            </button>
            <button 
              style={{background: 'none', border: 'none', color: '#6b7280', marginTop: 16, fontWeight: 600, cursor: 'pointer'}} 
              onClick={() => setStep(1)}
            >
              Change Number
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: 'Loading...', region: '' });
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const prof = await fetchFarmerProfile();
        setProfile(prof);
        const apps = await fetchFarmerApplications();
        setApplications(apps);
      } catch(err) {
        console.error(err);
        // If unauthorized
        navigate('/farmer/login');
      }
    };
    loadData();
  }, [navigate]);

  return (
    <div className="farmer-container">
      <header className="farmer-header">
        <div className="farmer-brand">
          <ShieldCheck size={24} color="#ffffff" />
          <span>ArkaRisk</span>
        </div>
        <div style={{width: 32, height: 32, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold'}}>
          {profile.name.charAt(0)}
        </div>
      </header>

      <main className="dashboard-content">
        <div className="welcome-banner">
          <h1>Welcome, {profile.name.split(' ')[0]}</h1>
          <p>{profile.region}</p>
        </div>

        <div className="dash-section">
          <div className="stat-grid">
            <div className="stat-card">
              <Sprout className="stat-icon" size={24} />
              <div className="stat-value">{applications.length}</div>
              <div className="stat-label">Active Farms</div>
            </div>
            <div className="stat-card">
              <FileText className="stat-icon" size={24} />
              <div className="stat-value">{applications.filter(a => a.status === 'Approved').length}</div>
              <div className="stat-label">Active Loan</div>
            </div>
          </div>
        </div>

        <div className="dash-section">
          <div className="dash-section-header">
            <h3>Recent Assessments ({applications.length})</h3>
            <a href="#">View All</a>
          </div>

          {applications.map(app => (
            <div className="assessment-card" key={app.id}>
              <div className="assessment-top">
                <div>
                  <div className="crop-name">{app.crop} - {app.region.split(',')[0]}</div>
                  <div className="assessment-date">ID: {app.app_id}</div>
                </div>
                <div className={`risk-badge ${app.score < 30 ? 'low' : 'moderate'}`}>Score: {app.score}</div>
              </div>
              
              <div className="loan-status" style={app.status === 'Review' ? {backgroundColor: '#f3f4f6'} : {}}>
                <div>
                  <div className="loan-status-text" style={app.status === 'Review' ? {color: '#4b5563'} : {}}>Loan {app.status}</div>
                  <div style={{fontSize: '0.75rem', color: app.status === 'Review' ? '#9ca3af' : '#60a5fa'}}>
                     {app.status === 'Review' ? 'Bank processing evaluation' : `${app.loan_amount} • Short-term Agric.`}
                  </div>
                </div>
                <ChevronRight color={app.status === 'Review' ? '#9ca3af' : '#3b82f6'} />
              </div>
            </div>
          ))}

          {applications.length === 0 && (
            <div style={{padding: '24px', textAlign: 'center', color: '#6b7280', background: 'white', borderRadius: 16}}>
              No assessments found. Run a new scan!
            </div>
          )}
        </div>

        <button className="btn-outline-green" onClick={() => navigate('/assessment/location')}>
          <Plus size={20} /> Request New Assessment
        </button>
        <button className="btn-outline-green" style={{marginTop: 12, border: 'none', color: '#ef4444'}} onClick={() => { logout(); navigate('/farmer/login'); }}>
           Logout
        </button>

      </main>

      <nav className="farmer-bottom-nav">
        <div className="nav-item active">
          <Home size={22} />
          <span>Home</span>
        </div>
        <div className="nav-item">
          <FileText size={22} />
          <span>Reports</span>
        </div>
        <div className="nav-item">
          <Phone size={22} />
          <span>Support</span>
        </div>
        <div className="nav-item">
          <Settings size={22} />
          <span>Settings</span>
        </div>
      </nav>
    </div>
  );
};

const FarmerPortal = () => {
  return (
    <Routes>
      <Route path="login" element={<FarmerLogin />} />
      <Route path="dashboard" element={<FarmerDashboard />} />
    </Routes>
  );
};

export default FarmerPortal;
