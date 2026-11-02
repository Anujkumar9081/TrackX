import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Shield, Truck, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import '../Style/DirectDemoCard.css';

const DirectDemoCard = ({ onFillCredentials }) => {
  const navigate = useNavigate();

  const handleLaunchDemo = (demoRole) => {
    const isOwner = demoRole === 'owner';
    const demoUser = {
      name: isOwner ? 'Anuj Kumar (Fleet Owner)' : 'Rajesh Kumar (Driver)',
      email: isOwner ? 'owner@trackx.com' : 'driver@trackx.com',
      role: demoRole
    };

    localStorage.setItem('token', `demo_session_${demoRole}_${Date.now()}`);
    localStorage.setItem('role', demoRole);
    localStorage.setItem('user', JSON.stringify(demoUser));
    localStorage.setItem(
      'activeTruck',
      JSON.stringify({
        Truck_num: 'UP82AB1234',
        Truck_brand: 'Tata',
        Truck_model: 'Signa 4825',
        Manufacturing_year: '2023',
        Milage: 4.0,
        Owner_name: 'Anuj Kumar',
        Driver_name: 'Rajesh Kumar',
        kmSinceLastService: 8850,
        serviceDueAlert: false
      })
    );

    navigate('/dashboard');
  };

  return (
    <aside className="direct-demo-card" aria-label="Direct Portfolio Demo Preview">
      {/* Top Highlight Badge */}
      <div className="demo-badge-row">
        <span className="demo-live-badge">
          <span className="demo-pulse-dot"></span>
          <Sparkles size={13} />
          PORTFOLIO & RESUME DEMO
        </span>
        <span className="demo-free-tag">Instant Access</span>
      </div>

      <div className="demo-header-section">
        <h3 className="demo-main-title">
          Direct Demo Preview <span className="demo-title-accent">⚡</span>
        </h3>
        <p className="demo-subtitle">
          Reviewing this project for a resume or interview? Skip manual registration and test-drive the full working portal in one click.
        </p>
      </div>

      {/* One-Click Demo Launch Buttons */}
      <div className="demo-actions-group">
        <button
          type="button"
          className="demo-launch-btn demo-owner-btn"
          onClick={() => handleLaunchDemo('owner')}
        >
          <div className="demo-btn-icon-box owner-icon-box">
            <Shield size={20} />
          </div>
          <div className="demo-btn-text">
            <span className="demo-btn-heading">
              Explore as Fleet Owner
              <ArrowRight size={15} className="demo-btn-arrow" />
            </span>
            <span className="demo-btn-caption">Manage multi-truck fleet, reset 10k km service, trip budgets & vault</span>
          </div>
        </button>

        <button
          type="button"
          className="demo-launch-btn demo-driver-btn"
          onClick={() => handleLaunchDemo('driver')}
        >
          <div className="demo-btn-icon-box driver-icon-box">
            <Truck size={20} />
          </div>
          <div className="demo-btn-text">
            <span className="demo-btn-heading">
              Explore as Truck Driver
              <ArrowRight size={15} className="demo-btn-arrow" />
            </span>
            <span className="demo-btn-caption">Live corridor map, dhabas, diesel pumps & anti-theft fuel audit</span>
          </div>
        </button>
      </div>

      {/* Optional Form Auto-fill (if onFillCredentials provided) */}
      {onFillCredentials && (
        <div className="demo-autofill-box">
          <div className="demo-autofill-info">
            <Zap size={13} color="#f59e0b" />
            <span>Want to test the login form?</span>
          </div>
          <button
            type="button"
            className="demo-autofill-btn"
            onClick={() => onFillCredentials('owner@trackx.com', 'demo123', 'owner')}
          >
            Auto-fill Test Login
          </button>
        </div>
      )}

      {/* Feature Highlights Checklist */}
      <div className="demo-features-section">
        <div className="demo-features-title">What you'll test inside:</div>
        <ul className="demo-features-list">
          <li>
            <CheckCircle2 size={14} color="#059669" className="demo-check-icon" />
            <span><strong>Interactive Leaflet Map:</strong> Delhi ➔ Kanpur freight corridor with widescreen toggle</span>
          </li>
          <li>
            <CheckCircle2 size={14} color="#059669" className="demo-check-icon" />
            <span><strong>Highway Amenities:</strong> Roadside petrol pumps (₹/L) & highway dhabas with rest stops</span>
          </li>
          <li>
            <CheckCircle2 size={14} color="#059669" className="demo-check-icon" />
            <span><strong>Trip Cost Calculator:</strong> Real-time fuel, FASTag toll, food & incidental budget</span>
          </li>
          <li>
            <CheckCircle2 size={14} color="#059669" className="demo-check-icon" />
            <span><strong>Petrol Chori Engine:</strong> Fuel discrepancy & theft risk auditor upon trip end</span>
          </li>
          <li>
            <CheckCircle2 size={14} color="#059669" className="demo-check-icon" />
            <span><strong>Digital Document Vault:</strong> RC, Insurance & DL with in-browser PDF/image viewer</span>
          </li>
        </ul>
      </div>

      <div className="demo-footer-note">
        💡 Runs directly in your browser. Pre-loaded with live Indian freight route data.
      </div>
    </aside>
  );
};

export default DirectDemoCard;
