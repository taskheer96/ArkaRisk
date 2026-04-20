import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ShieldCheck, Landmark, LayoutDashboard, Users, FileBarChart, Settings, Search, X, Download } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import { loginLender, fetchAllApplications, logout } from '../lib/api';
import './LenderPortal.css';

const LenderLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const res = await loginLender(email, password);
      if (res.token) {
         navigate('/lender/dashboard');
      } else {
         setError('Invalid credentials');
      }
    } catch(err) {
      console.error(err);
      setError('Login failed');
    }
  };

  return (
    <div className="lender-login-wrapper">
      <div className="lender-login-left">
        <div className="lender-hero-content">
          <ShieldCheck size={48} color="#2563eb" style={{marginBottom: 24}} />
          <h1>De-risk your agricultural lending portfolio.</h1>
          <p>ArkaRisk provides institutional lenders with hyper-local climate intelligence, reducing NPA probabilities by up to 30%.</p>
        </div>
      </div>
      
      <div className="lender-login-right">
        <div className="lender-login-card">
          <div className="corporate-logo">
            <Landmark size={28} color="#2563eb" />
            ArkaRisk Enterprise
          </div>
          
          <h2>Partner Login</h2>
          <p>Access your lending dashboard</p>

          {error && <div style={{color: 'red', marginBottom: 16, fontSize: 14}}>{error}</div>}

          <div className="corp-input-group">
            <label className="corp-input-label">Corporate Email</label>
            <input type="email" className="corp-input" placeholder="e.g. hdfc@bank.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="corp-input-group">
            <label className="corp-input-label">Password</label>
            <input type="password" className="corp-input" placeholder="Any password works for demo" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <button className="btn-corporate" onClick={handleLogin}>
            Sign In to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

const LenderDashboard = () => {
  const navigate = useNavigate();
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const loadApps = async () => {
      try {
        const data = await fetchAllApplications();
        setApplications(data);
      } catch(err) {
        console.error(err);
        navigate('/lender/login');
      }
    };
    loadApps();
  }, [navigate]);

  const riskData = {
    labels: ['Low Risk', 'Moderate Risk', 'High Risk'],
    datasets: [{
      data: [
        applications.filter(a => a.score < 30).length || 1, 
        applications.filter(a => a.score >= 30 && a.score < 65).length || 1, 
        applications.filter(a => a.score >= 65).length || 1
      ],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 0
    }]
  };

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      cutout: '75%'
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/lender/login');
  };

  return (
    <div className="lender-container">
      <div className="lender-sidebar">
        <div className="sidebar-logo">
          <ShieldCheck size={24} color="#3b82f6" />
          ArkaRisk
        </div>
        
        <div className="sidebar-nav">
          <div className="sidebar-nav-item active"><LayoutDashboard size={18} /> Portfolio Overview</div>
          <div className="sidebar-nav-item"><Users size={18} /> Applications</div>
          <div className="sidebar-nav-item"><FileBarChart size={18} /> Climate Reports</div>
          <div className="sidebar-nav-item"><Settings size={18} /> System Settings</div>
          <div className="sidebar-nav-item" style={{color: '#ef4444', marginTop: 40}} onClick={handleLogout}><X size={18} /> Logout</div>
        </div>
      </div>

      <div className="lender-main">
        <div className="lender-header">
          <div className="lender-title">
            <h1>Portfolio Overview</h1>
            <p>Real-time climate risk exposure across your agricultural book.</p>
          </div>
          <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
            <span style={{fontSize: '0.875rem', color: '#64748b'}}>Branch: <strong>West India</strong></span>
            <div style={{width: 40, height: 40, borderRadius: '50%', background: '#cbd5e1'}}></div>
          </div>
        </div>

        <div className="kpi-row">
          <div className="kpi-card">
            <div className="kpi-card-header">Total Portfolio Exposure</div>
            <div className="kpi-value">₹ 42.5 Cr</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-card-header">Active Applications</div>
            <div className="kpi-value">{applications.length}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-card-header">Avg. Climate Score</div>
            <div className="kpi-value" style={{color: '#10b981'}}>{applications.length ? Math.round(applications.reduce((a,b) => a + b.score, 0) / applications.length) : 0} / 100</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-card-header">NPA Probability</div>
            <div className="kpi-value">3.2%</div>
          </div>
        </div>

        <div className="charts-row">
          <div className="chart-card">
            <h3>Geospatial Risk Distribution</h3>
            <div style={{height: 280, backgroundColor: '#f8fafc', borderRadius: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8'}}>
              Map Visualization Integration
            </div>
          </div>
          <div className="chart-card">
            <h3>Risk Tranches</h3>
            <div style={{height: 280}}>
              <Doughnut data={riskData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="data-table-card">
          <div className="data-table-header">
            <h3>Recent Loan Applications</h3>
            <div className="corp-input" style={{width: 300, display: 'flex', gap: 8, alignItems: 'center', padding: '8px 12px'}}>
              <Search size={16} color="#94a3b8" />
              <input type="text" placeholder="Search applicant..." style={{border: 'none', outline: 'none', background: 'transparent'}} />
            </div>
          </div>
          
          <table className="corp-table">
            <thead>
              <tr>
                <th>App ID</th>
                <th>Applicant Name</th>
                <th>Region</th>
                <th>Target Crop</th>
                <th>Requested Amount</th>
                <th>ArkaRisk Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id} onClick={() => setSelectedFarmer(app)}>
                  <td><strong>{app.app_id}</strong></td>
                  <td>{app.name}</td>
                  <td>{app.region}</td>
                  <td>{app.crop}</td>
                  <td>{app.loan_amount}</td>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                      <div style={{width: 40, height: 6, borderRadius: 3, background: '#e2e8f0', overflow: 'hidden'}}>
                         <div style={{height: '100%', width: `${app.score}%`, background: app.score < 30 ? '#10b981' : (app.score < 65 ? '#f59e0b' : '#ef4444')}}></div>
                      </div>
                      <span style={{fontSize: '0.75rem', fontWeight: 600}}>{app.score}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`corp-badge ${app.status === 'Review' ? 'neutral' : (app.status === 'Approved' ? 'success' : 'danger')}`}>
                       {app.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedFarmer && (
        <div className="detail-drawer-overlay">
          <div className="detail-drawer">
            <div className="drawer-header">
              <h2>Application Detail</h2>
              <button onClick={() => setSelectedFarmer(null)} style={{background: 'none', border: 'none', cursor: 'pointer'}}>
                <X size={24} color="#64748b" />
              </button>
            </div>
            
            <div className="drawer-content">
              <div className="drawer-section">
                <h4>Applicant Information</h4>
                <div className="detail-grid">
                  <div className="detail-item"><label>Name</label><div>{selectedFarmer.name}</div></div>
                  <div className="detail-item"><label>Application ID</label><div>{selectedFarmer.app_id}</div></div>
                  <div className="detail-item"><label>Region</label><div>{selectedFarmer.region}</div></div>
                  <div className="detail-item"><label>Loan Amount</label><div>{selectedFarmer.loan_amount}</div></div>
                </div>
              </div>

              <div className="drawer-section">
                <h4>Climate Risk Assessment</h4>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 24, border: '1px solid #e2e8f0', borderRadius: 12, marginBottom: 16}}>
                   <div>
                     <div style={{fontSize: '0.875rem', color: '#64748b'}}>Composite Risk Score</div>
                     <div style={{fontSize: '2.5rem', fontWeight: 800, color: selectedFarmer.score < 30 ? '#10b981' : (selectedFarmer.score < 65 ? '#f59e0b' : '#ef4444')}}>{selectedFarmer.score} <span style={{fontSize: '1rem', color: '#94a3b8'}}>/100</span></div>
                   </div>
                   <button className="corp-input" style={{width: 'auto', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'white'}}>
                     <Download size={16} /> Download Full PDF
                   </button>
                </div>
                
                <div className="detail-grid">
                  <div className="detail-item"><label>Crop</label><div>{selectedFarmer.crop}</div></div>
                  <div className="detail-item"><label>Historical Yield</label><div>Medium-High</div></div>
                  <div className="detail-item"><label>Water Security</label><div>Stable (75%)</div></div>
                  <div className="detail-item"><label>7-Day Threat</label><div>Low</div></div>
                </div>
              </div>

            </div>

            <div className="drawer-footer">
              <button className="btn-reject" onClick={() => setSelectedFarmer(null)}>Reject</button>
              <button className="btn-approve" onClick={() => setSelectedFarmer(null)}>Approve Application</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const LenderPortal = () => {
  return (
    <Routes>
      <Route path="login" element={<LenderLogin />} />
      <Route path="dashboard" element={<LenderDashboard />} />
    </Routes>
  );
};

export default LenderPortal;
