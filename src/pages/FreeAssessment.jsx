import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { ShieldCheck, Crosshair, MapPin, Map, FileText, Phone, Settings, CloudRain, Sun, Cloud, Flame, Droplet, AlertTriangle } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto'; // Required for chartjs
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { indianStates } from '../data/indianStates';
import { majorCropsData } from '../data/majorCrops';
import './FreeAssessment.css';

// Fix leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom || map.getZoom());
  return null;
}

const LocationStep = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const districts = (selectedState && indianStates[selectedState]) ? indianStates[selectedState] : [];
  
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // India center
  const [markerPos, setMarkerPos] = useState(null);
  const [mapZoom, setMapZoom] = useState(5);

  const debounceRef = useRef(null);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&countrycodes=in&addressdetails=1`);
        const data = await res.json();
        setSuggestions(data.slice(0, 5));
        setShowSuggestions(true);
      } catch(err) {
        console.error("Geocoding err:", err);
      }
    }, 500);
  };

  const handleSelectLocation = (loc) => {
    setQuery(loc.display_name);
    setShowSuggestions(false);
    
    const lat = parseFloat(loc.lat);
    const lon = parseFloat(loc.lon);
    setMapCenter([lat, lon]);
    setMarkerPos([lat, lon]);
    setMapZoom(12);

    if (loc.address && loc.address.state) {
      const st = loc.address.state;
      if (Object.keys(indianStates).includes(st)) {
         setSelectedState(st);
         setSelectedDistrict('');
      }
    }
  };

  const hasLocation = query.length > 0 || selectedState.length > 0;

  const handleProceed = () => {
    if (!hasLocation) return;
    navigate('/assessment/climate', {
       state: {
          lat: mapCenter[0],
          lon: mapCenter[1],
          locationName: query.split(',')[0] || selectedDistrict || 'Custom Location',
          fullRegion: `${selectedDistrict ? selectedDistrict+', ' : ''}${selectedState || 'India'}`,
          stateName: selectedState
       }
    });
  };

  return (
    <div className="step1-container">
      <div className="step1-top-bar">
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
           <ShieldCheck size={28} color="#2e6f40" />
           <span style={{fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.5px'}}>ArkaRisk</span>
        </div>
      </div>

      <div className="step1-header">
        <div>
          <h1 style={{fontSize: 20, fontWeight: 700, color: '#111827', margin: 0}}>ArkaRisk - Free Assessment</h1>
          <h2 style={{fontSize: 16, fontWeight: 400, color: '#111827', margin: '4px 0 0 0'}}>Step 1: Location Identification</h2>
        </div>
        
        <div className="chevron-progress">
          <div className="chevron-step active" style={{borderTopLeftRadius: 24, borderBottomLeftRadius: 24}}>
             1. Location
             <div className="chevron-tail chevron-tail-active"></div>
          </div>
          <div className="chevron-step inactive">
             <div className="chevron-head"></div>
             2. Climate Profile
             <div className="chevron-tail chevron-tail-inactive"></div>
          </div>
          <div className="chevron-step inactive" style={{borderTopRightRadius: 24, borderBottomRightRadius: 24, paddingRight: 32}}>
             <div className="chevron-head"></div>
             3. Risk Summary
          </div>
        </div>
      </div>

      <div className="step1-content-wrapper">
         <div className="step1-map-container" style={{backgroundColor: '#e5e7eb'}}>
            <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '600px', width: '100%', zIndex: 0 }}>
              <ChangeView center={mapCenter} zoom={mapZoom} />
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {markerPos && <Marker position={markerPos}></Marker>}
            </MapContainer>
            
            <div className="step1-floating-card" style={{zIndex: 10}}>
               <h3 style={{fontSize: 18, fontWeight: 600, marginBottom: 16, marginTop: 0}}>Search</h3>
               <div style={{position: 'relative', marginBottom: 12}}>
                  <input 
                    type="text" 
                    placeholder="Enter Village, City or Coordinates" 
                    className="step1-input" 
                    value={query}
                    onChange={handleSearchChange}
                  />
                  <span style={{position:'absolute', right: 12, top: 10, color: '#9ca3af', fontSize: 16}}>🔍</span>
                  
                  {showSuggestions && suggestions.length > 0 && (
                    <div style={{position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: 6, marginTop: 4, zIndex: 20, maxHeight: 200, overflowY: 'auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}}>
                      {suggestions.map((loc, idx) => (
                        <div 
                           key={idx} 
                           onClick={() => handleSelectLocation(loc)}
                           style={{padding: '8px 12px', fontSize: 12, borderBottom: '1px solid #f3f4f6', cursor: 'pointer'}}
                        >
                          {loc.display_name}
                        </div>
                      ))}
                    </div>
                  )}
               </div>
               
               <button className="step1-btn-outline" onClick={() => {
                 setMapCenter([28.6139, 77.2090]); setMapZoom(10); 
               }}>
                  <MapPin size={16} /> Use My Current Location
               </button>

               <div style={{marginTop: 16}}>
                 <label className="step1-label">State</label>
                 <select className="step1-input" value={selectedState} onChange={(e) => { setSelectedState(e.target.value); setSelectedDistrict(''); }}>
                    <option value="">Select State</option>
                    {Object.keys(indianStates).map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                 </select>
               </div>

               <div style={{marginTop: 12}}>
                 <label className="step1-label">District</label>
                 <select className="step1-input" value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
                    <option value="">Select District</option>
                    {districts.map(dt => (
                      <option key={dt} value={dt}>{dt}</option>
                    ))}
                 </select>
               </div>

               <p style={{fontSize: 13, color: '#374151', margin: '24px 0 0 0', lineHeight: 1.4}}>
                 Pinpoint your farmland for accurate soil and<br />weather analysis
               </p>
            </div>

            <div className="step1-bottom-banner" style={{zIndex: 10}}>
               <button 
                 onClick={handleProceed} 
                 disabled={!hasLocation}
                 className="btn-green-next" 
                 style={{
                   borderRadius: 20, 
                   padding: '8px 24px', 
                   backgroundColor: hasLocation ? '#2e6f40' : '#9ca3af', 
                   cursor: hasLocation ? 'pointer' : 'not-allowed',
                   zIndex: 10
                 }}
               >
                 Continue to Analysis
               </button>
            </div>
         </div>
      </div>

      <div className="step1-footer">
         <div style={{color: '#111827', fontWeight: 500}}>© 2024 ArkaRisk. Climate-Smart Agriculture.</div>
         <div style={{display: 'flex', gap: 24}}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact Support</a>
         </div>
      </div>
    </div>
  );
};

const ClimateProfileStep = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateData = location.state || { lat: 28.6139, lon: 77.2090, locationName: "New Delhi", fullRegion: "Delhi, India", stateName: "Delhi" };
  
  const [weather, setWeather] = useState({ temp: '--', humidity: '--', moisture: '--' });
  const [forecast, setForecast] = useState([]);
  const [soilType, setSoilType] = useState('Loading...');
  
  const [selectedCrop, setSelectedCrop] = useState('');
  const [otherCrop, setOtherCrop] = useState('');
  const [userYield, setUserYield] = useState(''); // User Input Yield
  
  const stateKey = majorCropsData[stateData.stateName] ? stateData.stateName : 'Delhi';
  const availableCrops = majorCropsData[stateKey] || ["Wheat"];

  useEffect(() => {
    // Open-Meteo fully dynamic fetch
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${stateData.lat}&longitude=${stateData.lon}&current_weather=true&hourly=relativehumidity_2m,soil_moisture_0_to_7cm&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&timezone=auto`)
      .then(r => r.json())
      .then(d => {
         if(d && d.current_weather && d.daily) {
            
            let soilM = 65;
            if (d.hourly && d.hourly.soil_moisture_0_to_7cm) {
               const smValid = d.hourly.soil_moisture_0_to_7cm.filter(x => x !== null);
               if (smValid.length > 0) {
                 soilM = Math.floor(smValid[0] * 100); 
               }
            }
            
            setWeather({
               temp: Math.round(d.current_weather.temperature),
               humidity: d.hourly && d.hourly.relativehumidity_2m ? d.hourly.relativehumidity_2m[0] : 65,
               moisture: soilM
            });

            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const fcast = d.daily.time.map((timeStr, i) => ({
              day: days[new Date(timeStr).getDay()],
              maxTemp: Math.round(d.daily.temperature_2m_max[i]),
              minTemp: Math.round(d.daily.temperature_2m_min[i]),
              precipProb: d.daily.precipitation_probability_max[i],
              precipSum: d.daily.precipitation_sum[i]
            }));
            setForecast(fcast);
         }
      })
      .catch(e => console.error(e));

    // Kaegro Soil API fetch
    fetch(`https://www.kaegro.com/farms/api/soil?lat=${stateData.lat}&lon=${stateData.lon}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
         if (d) {
            setSoilType(d.texture || d.classification || d.soil_type || 'Assessed Locality Map');
         } else {
            setSoilType('Loam (Estimated)');
         }
      })
      .catch(() => setSoilType('Loam (Estimated)'));
  }, [stateData.lat, stateData.lon]);

  const handleNext = () => {
    const finalCrop = selectedCrop === 'Other...' ? otherCrop : selectedCrop;
    navigate('/assessment/report', { 
       state: { ...stateData, crop: finalCrop || availableCrops[0], weather, expectedYieldInput: Number(userYield), forecast } 
    });
  };

  const chartLabels = forecast.map(f => f.day);
  const chartPrecipParams = forecast.map(f => f.precipSum);

  const barData = {
    labels: chartLabels.length > 0 ? chartLabels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      { 
        label: 'Forecast Precipitation (mm)', 
        backgroundColor: '#3b82f6', 
        data: chartPrecipParams.length > 0 ? chartPrecipParams : [0, 0, 0, 0, 0, 0, 0],
        borderRadius: 4
      }
    ]
  };

  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } },
    scales: {
      y: { beginAtZero: true, suggestedMax: 50, ticks: { font: {size: 10} } },
      x: { grid: { display: false }, ticks: { font: {size: 10} } }
    }
  };

  return (
    <div className="assessment-container">
      <div className="top-navbar">
        <ShieldCheck size={32} color="#047857" className="logo-icon-sm" />
        <div className="logo-text">AgriRisk<span>Assessments</span></div>
      </div>

      <div className="assessment-header-banner green-banner">
        <h1>Free Assessment</h1>
        <div className="breadcrumbs">Home &gt; Free Assessment &gt; Step 2: Climate Profile</div>
      </div>

      <div className="assessment-layout">
        <div className="sidebar">
          <div className="location-summary">
            <div className="location-summary-header">Location Summary</div>
            <div className="location-summary-content">
              <div className="loc-item">
                <Crosshair size={16} />
                <div><strong>Coordinates:</strong> {stateData.lat.toFixed(4)}° N, {stateData.lon.toFixed(4)}° E</div>
              </div>
              <div className="loc-item">
                <MapPin size={16} />
                <div><strong>Village:</strong> {stateData.locationName}</div>
              </div>
              <div className="loc-item">
                <Map size={16} />
                <div><strong>Region:</strong> {stateData.fullRegion}</div>
              </div>
              <div className="loc-item">
                <Settings size={16} />
                <div><strong>Soil Type:</strong> {soilType}</div>
              </div>
            </div>
          </div>

          <div className="sidebar-nav">
            <div className="nav-item active"><CloudRain size={18} /> Climate Profile</div>
            <div className="nav-item" onClick={handleNext}><FileText size={18} /> Risk Summary</div>
            <div className="nav-item"><ShieldCheck size={18} /> Recommendations</div>
            <div className="nav-item"><Phone size={18} /> Contact Us</div>
          </div>
        </div>

        <div className="main-content">
          <div className="cards-grid">
            
            <div className="metric-card">
              <div className="metric-header">Soil Moisture Volume</div>
              <div className="metric-body" style={{alignItems: 'center', justifyContent: 'center'}}>
                <div className="soil-moisture-chart" style={{margin: '0 auto'}}>
                  <span className="soil-moisture-val">{weather.moisture}%</span>
                </div>
              </div>
              <div className="metric-footer">Current Status: {weather.moisture > 40 ? 'Moist (Optimal)' : 'Dry (Requires Water)'}</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">Rainfall & Precipitation</div>
              <div className="metric-body" style={{flexDirection: 'column', padding: '8px 16px'}}>
                <span style={{fontSize: 12, color: '#475569'}}>7-Day Expected Precipitation (mm)</span>
                <div style={{width: '100%', height: '140px', marginTop: 10}}>
                  <Bar data={barData} options={barOptions} />
                </div>
              </div>
              <div className="metric-footer">Live Data from Open-Meteo</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">Temperature & Humidity</div>
              <div className="metric-body">
                
                <div className="gauge-container">
                  <div className="gauge">
                    <div className="gauge-fill-temp"></div>
                    <div className="gauge-center"><span className="gauge-val">{weather.temp}°C</span></div>
                    <div className="dial" style={{transform: `translateX(-50%) rotate(${weather.temp === '--' ? 0 : (weather.temp > 50 ? 90 : (weather.temp/50)*180 - 90)}deg)`}}></div>
                    <span style={{position:'absolute', bottom:2, left:8, fontSize:10, fontWeight:600}}>0</span>
                    <span style={{position:'absolute', bottom:2, right:8, fontSize:10, fontWeight:600}}>50°C</span>
                  </div>
                  <div className="gauge-label">Temperature</div>
                </div>

                <div className="gauge-container">
                  <div className="gauge gauge-hum">
                    <div className="gauge-fill-hum"></div>
                    <div className="gauge-center"><span className="gauge-val">{weather.humidity}%</span></div>
                    <div className="dial" style={{transform: `translateX(-50%) rotate(${weather.humidity === '--' ? 0 : (weather.humidity > 100 ? 90 : (weather.humidity/100)*180 - 90)}deg)`}}></div>
                    <span style={{position:'absolute', bottom:2, left:8, fontSize:10, fontWeight:600}}>0</span>
                    <span style={{position:'absolute', bottom:2, right:5, fontSize:10, fontWeight:600}}>100%</span>
                  </div>
                  <div className="gauge-label">Humidity</div>
                </div>

              </div>
              <div className="metric-footer">Condition: {weather.temp > 30 ? 'Hot' : 'Warm'} & {weather.humidity > 60 ? 'Humid' : 'Dry'}</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">7-Day Weather Forecast</div>
              <div className="metric-body" style={{padding: '8px 16px', alignItems: 'flex-start'}}>
                <table className="weather-table">
                  <thead>
                    <tr><th style={{textAlign: 'left'}}></th><th></th><th>High / Low</th><th>Precipitation Probability</th></tr>
                  </thead>
                  <tbody>
                    {forecast.map((f, i) => (
                      <tr key={i}>
                         <td>{f.day}</td>
                         <td>
                           {f.precipProb > 50 ? <CloudRain size={14} color="#3b82f6" /> : (f.precipProb > 20 ? <Cloud size={14} color="#94a3b8" /> : <Sun size={14} color="#eab308" />)}
                         </td>
                         <td>{f.maxTemp}°C / {f.minTemp}°C</td>
                         <td>{f.precipProb}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="metric-footer">Live Data from Open-Meteo Forecast.</div>
            </div>

          </div>

          <div className="bottom-action-bar">
            <span style={{fontSize: 14, color: '#334155'}}>Expected Yield:</span>
            <input type="number" className="specify-input" style={{width: '120px'}} placeholder="e.g. 50" value={userYield} onChange={e => setUserYield(e.target.value)} />
            
            <span style={{fontSize: 14, color: '#334155', marginLeft: 16}}>Select Crop:</span>
            <select className="crop-dropdown" value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)}>
              <option value="">Select Crop...</option>
              {availableCrops.map(c => <option key={c} value={c}>{c}</option>)}
              <option value="Other...">Other...</option>
            </select>
            {selectedCrop === 'Other...' && (
               <input type="text" className="specify-input" placeholder="Specify other crop" value={otherCrop} onChange={e => setOtherCrop(e.target.value)} />
            )}
            <button className="btn-green-next" onClick={handleNext}>Next: Risk Summary</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportStep = () => {
  const location = useLocation();
  const reportRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const stateData = location.state || { locationName: 'Mock City', fullRegion: 'Mock Region, IN', crop: 'Wheat', weather: { temp: 25, moisture: 60 }, forecast: [], expectedYieldInput: 60 };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
      const data = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ArkaRisk_Report_${stateData.crop}.pdf`);
    } catch (err) {
      console.error(err);
    }
    setDownloading(false);
  };

  // Calculate probabilities (0-1) from forecast mapping
  let Ph = 0, Pf = 0, Pd = 0;
  if (stateData.forecast && stateData.forecast.length > 0) {
     const hotDays = stateData.forecast.filter(f => f.maxTemp > 35).length;
     Ph = hotDays / stateData.forecast.length;
     const heavyRain = stateData.forecast.filter(f => f.precipSum > 15).length;
     Pf = heavyRain / stateData.forecast.length;
     const dryDays = stateData.forecast.filter(f => f.precipSum < 1).length;
     Pd = dryDays / stateData.forecast.length;
  } else {
     // Mock defaults if arriving straight here
     Ph = stateData.weather.temp > 35 ? 0.8 : 0.2;
     Pf = 0.2;
     Pd = stateData.weather.moisture < 40 ? 0.6 : 0.2;
  }

  // Soil Moisture vs Optimal
  const cropMoistureReq = { "Rice": 80, "Wheat": 50, "Cotton": 45, "Sugarcane": 75, "Maize": 60, "default": 60 };
  const SM_opt = cropMoistureReq[stateData.crop] || cropMoistureReq["default"];
  const SM_act = stateData.weather.moisture !== '--' ? stateData.weather.moisture : 50;

  // Expected Yield vs Historical
  const cropHistYield = { "Rice": 60, "Wheat": 40, "Cotton": 30, "Sugarcane": 85, "Maize": 55, "default": 50 };
  const Y_hist = cropHistYield[stateData.crop] || cropHistYield["default"];
  const Y_exp = stateData.expectedYieldInput || Y_hist;

  // Water Security Index (0-1)
  const WS = 0.5; // Base assumption: Medium security without complex geospatial pipeline.

  // --- MASTER EQUATION EXECUTED ---
  // W = max(Ph, Pf, Pd) * 100
  const W = Math.max(Ph, Pf, Pd) * 100;
  // S = min( | (SM_act - SM_opt) / SM_opt | * 100 , 100)
  const S = Math.min(Math.abs((SM_act - SM_opt) / SM_opt) * 100, 100);
  // V = (Y_exp > Y_hist) ? ((Y_exp - Y_hist) / Y_hist) * 100 : 0
  const V = (Y_exp > Y_hist) ? ((Y_exp - Y_hist) / Y_hist) * 100 : 0;
  
  // Total Risk = (0.4 * W) + (0.3 * S) + (0.2 * V) - (0.1 * (WS * 100))
  const R_total_raw = (0.4 * W) + (0.3 * S) + (0.2 * V) - (0.1 * (WS * 100));
  const SCORE = Math.round(Math.max(0, Math.min(100, R_total_raw)));

  const statusColor = SCORE < 30 ? '#10b981' : (SCORE < 65 ? '#eab308' : '#ef4444');

  return (
    <div className="report-container" ref={reportRef} style={{backgroundColor: '#f8fafc', paddingBottom: 40}}>
      <div className="report-header-banner">
        <h1>Comprehensive Risk Summary Report</h1>
      </div>

      <div className="report-content-wrapper">
        
        <div className="composite-card">
          <div className="composite-card-top">
            <div className="gauge" style={{width: 240, height: 120, borderTopLeftRadius: 240, borderTopRightRadius: 240}}>
              <div className="gauge-fill-temp" style={{background: 'conic-gradient(from 180deg at 50% 100%, #10b981 0deg, #eab308 90deg, #ef4444 180deg)'}}></div>
              <div className="gauge-center" style={{width: 200, height: 100, borderTopLeftRadius: 200, borderTopRightRadius: 200}}>
                <span className="gauge-val" style={{fontSize: 42, marginBottom: -10}}>{SCORE}<span style={{fontSize: 18, color: '#64748b', fontWeight: 500}}>/100</span></span>
              </div>
              <div className="dial" style={{height: 100, transform: `translateX(-50%) rotate(${(SCORE/100)*180 - 90}deg)`}}></div>
            </div>

            <div className="composite-score-details">
              <h2>Composite Risk Score</h2>
              <h3 style={{color: statusColor}}>{SCORE < 30 ? 'Low Risk - Highly Favorable' : (SCORE < 65 ? 'Moderate Risk - Standard Conditions' : 'High Risk - Lending Caution')}</h3>
            </div>
          </div>
          <div className="composite-card-bottom">
            <strong>Location:</strong> {stateData.locationName}, {stateData.fullRegion} | <strong>Selected Crop:</strong> {stateData.crop}
          </div>
        </div>

        <div className="report-grid">
          
          <div className="report-metric-card">
            <div className="report-metric-header">Water Security Index</div>
            <div className="report-metric-sub">Soil Moisture vs. Crop Requirements</div>
            <div className="report-metric-body" style={{border: '1px solid #e2e8f0', padding: 8}}>
              <div style={{fontSize: 8, display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 8}}>
                <span style={{color: '#3b82f6'}}>▬ Available ({SM_act}%)</span>
                <span style={{color: '#10b981'}}>▬ Ideal ({SM_opt}%)</span>
              </div>
              <svg viewBox="0 0 100 50" style={{width: '100%', height: '80px', overflow: 'visible'}}>
                {/* Available */}
                <polyline fill="none" stroke="#3b82f6" strokeWidth="1.5" points={`0,20 15,30 30,25 45,10 60,35 75,40 100,${100-SM_act}`} />
                {/* Required */}
                <polyline fill="none" stroke="#10b981" strokeWidth="1.5" points={`0,35 15,35 30,32 45,30 60,38 75,45 100,${100-SM_opt}`} />
              </svg>
            </div>
            <div className="report-metric-footer">
              <strong style={{color: '#1e293b'}}>Stress Delta:</strong> {S.toFixed(1)}% variance from biological ideal.
            </div>
          </div>

          <div className="report-metric-card">
             <div className="report-metric-header">Extreme Weather Probability</div>
             <div className="report-metric-body">
               <div className="risk-row">
                 <div className="icon-bg red"><Flame size={16} /></div>
                 <div>Heatwave Risk: <span style={{color: '#ef4444'}}>{(Ph*100).toFixed(0)}%</span></div>
               </div>
               <div className="risk-row">
                 <div className="icon-bg green"><Droplet size={16} /></div>
                 <div>Flood Risk: <span style={{color: '#10b981'}}>{(Pf*100).toFixed(0)}%</span></div>
               </div>
               <div className="risk-row">
                 <div className="icon-bg yellow"><AlertTriangle size={16} /></div>
                 <div>Drought Risk: <span style={{color: '#eab308'}}>{(Pd*100).toFixed(0)}%</span></div>
               </div>
             </div>
             <div className="report-metric-footer">
               <strong style={{color: '#1e293b'}}>Hazard Multiplier:</strong> W-Score = {W.toFixed(1)}%. Primary risk drives outcome.
             </div>
           </div>

          <div className="report-metric-card">
            <div className="report-metric-header">Yield Prediction ({stateData.crop})</div>
            <div className="report-metric-sub">Expected Output vs. Historical Averages</div>
            <div className="report-metric-body">
               <div style={{display: 'flex', height: '100px', alignItems: 'flex-end', justifyContent: 'center', gap: '32px', borderLeft: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1', padding: '16px', position: 'relative'}}>
                  <div style={{position: 'absolute', left: -20, bottom: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: 8, color: '#64748b'}}>
                    <span>80</span><span>60</span><span>40</span><span>20</span><span>0</span>
                  </div>

                  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <span style={{fontSize: 9, marginBottom: 4}}>{Y_exp}</span>
                    <div style={{width: 48, height: `${Math.min(100, Y_exp)}px`, backgroundColor: '#eab308'}}></div>
                    <span style={{fontSize: 9, marginTop: 4}}>Expected</span>
                  </div>
                  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <span style={{fontSize: 9, marginBottom: 4}}>{Y_hist}</span>
                    <div style={{width: 48, height: `${Y_hist}px`, backgroundColor: '#94a3b8'}}></div>
                    <span style={{fontSize: 9, marginTop: 4}}>Historical</span>
                  </div>
               </div>
            </div>
            <div className="report-metric-footer">
               <strong style={{color: '#1e293b'}}>Over-Optimism Penalty:</strong> V-Score = {V.toFixed(1)}%.
            </div>
          </div>

          <div className="report-metric-card">
             <div className="report-metric-header">Banking Intelligence</div>
             <div className="report-metric-body" style={{justifyContent: 'flex-start', marginTop: 16}}>
               <div className="banking-rec" style={{backgroundColor: SCORE < 50 ? '#dcfce7' : '#fef9c3', borderColor: SCORE < 50 ? '#86efac' : '#fde047', color: SCORE < 50 ? '#166534' : '#854d0e'}}>
                 <strong>Recommendation:</strong> {SCORE < 50 ? 'Prime candidate for micro-finance.' : 'Strong candidate with climate resilience conditions.'}
               </div>
               <ul className="banking-bullets">
                 <li style={{marginBottom: 8}}><strong>Loan type:</strong> Short-term agricultural loan recommended.</li>
                 <li style={{marginBottom: 8}}><strong>Risk Mitigation:</strong> {SCORE < 50 ? 'Standard agricultural practices suffice.' : 'Require tolerant seed variety and irrigation plan.'}</li>
                 <li><strong>Water Security Adjustment:</strong> Offset ~10 points globally.</li>
               </ul>
             </div>
           </div>

        </div>

        <div className="report-actions" style={{display: 'flex', justifyContent: 'center', marginTop: 32}}>
           <button className="btn-pdf" onClick={handleDownloadPDF} disabled={downloading} style={{cursor: downloading ? 'not-allowed' : 'pointer', opacity: downloading ? 0.7 : 1}}>
             {downloading ? 'Compiling PDF...' : 'Download Full Master Report (PDF)'}
           </button>
        </div>

      </div>

      <div className="bottom-cta-banner">
        Ready to move forward? Sign Up to Apply for a Loan
        <button className="btn-white">Create Account</button>
      </div>

    </div>
  );
};

const FreeAssessment = () => {
  return (
    <Routes>
      <Route path="location" element={<LocationStep />} />
      <Route path="climate" element={<ClimateProfileStep />} />
      <Route path="report" element={<ReportStep />} />
    </Routes>
  );
};

export default FreeAssessment;
