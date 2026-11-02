import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, Shield } from 'lucide-react';
import { API_URL } from '../config';
import DirectDemoCard from './DirectDemoCard';
import '../Style/Login.css';
import '../Style/Signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const url = API_URL;

  const [role, setRole] = useState('owner'); // 'owner' or 'driver'
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const handleAutoFill = (demoEmail, demoPassword, demoRole) => {
    setUserName(demoRole === 'owner' ? 'Anuj Kumar' : 'Rajesh Kumar');
    setEmail(demoEmail);
    setPassword(demoPassword);
    setRole(demoRole);
    setStatusMessage({
      type: 'success',
      text: `Demo credentials auto-filled! Click "Sign Up as ${demoRole === 'owner' ? 'Truck Owner' : 'Driver'}" below or use instant launch buttons on the right.`
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!userName || !email || !password) {
      setStatusMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }

    setLoading(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const data = await fetch(`${url}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          UserName: userName,
          Email: email,
          Password: password,
          role: role
        })
      });

      const ans = await data.json();

      if (data.ok) {
        setStatusMessage({
          type: 'success',
          text: `Account created successfully as ${role === 'owner' ? 'Fleet Owner' : 'Driver'}! Redirecting to login...`
        });
        setTimeout(() => {
          navigate('/login');
        }, 1200);
      } else {
        setStatusMessage({ type: 'error', text: ans.message || 'Signup failed' });
      }
    } catch (error) {
      console.error('Signup error:', error);
      setStatusMessage({
        type: 'error',
        text: `Unable to connect to the backend server on ${url}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-content-grid">
        {/* Left Side: Standard Signup Form */}
        <div className="signup-container">
          <div className="auth-header">
            <h2 className="auth-brand">
              Track<span>X</span>
            </h2>
            <h3 className="auth-title">Create Account</h3>
            <p className="auth-subtitle">Join TrackX to manage fleets & track journeys</p>
          </div>

          {/* Role Selector Tabs */}
          <div className="role-selector-container">
            <button
              type="button"
              className={`role-tab-btn ${role === 'owner' ? 'active-role' : ''}`}
              onClick={() => setRole('owner')}
            >
              <Shield size={18} />
              <div className="role-tab-text">
                <span className="role-tab-title">Truck Owner</span>
                <span className="role-tab-desc">Register & manage fleet</span>
              </div>
            </button>

            <button
              type="button"
              className={`role-tab-btn ${role === 'driver' ? 'active-role' : ''}`}
              onClick={() => setRole('driver')}
            >
              <Truck size={18} />
              <div className="role-tab-text">
                <span className="role-tab-title">Driver</span>
                <span className="role-tab-desc">Trips, map & dhabas</span>
              </div>
            </button>
          </div>

          {statusMessage.text && (
            <div className={`toast-banner toast-${statusMessage.type}`}>
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handleSignup} className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Full Name</label>
              <input
                type="text"
                className="auth-input"
                placeholder={role === 'owner' ? 'e.g. Ramesh Transport Owner' : 'e.g. Rajesh Driver'}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <input
                type="email"
                className="auth-input"
                placeholder={role === 'owner' ? 'owner@transport.com' : 'driver@trackx.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input
                type="password"
                className="auth-input"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Creating Account...' : `Sign Up as ${role === 'owner' ? 'Truck Owner' : 'Driver'}`}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in here</Link>
          </p>
        </div>

        {/* Right Side: Direct Demo Highlight Card */}
        <DirectDemoCard onFillCredentials={handleAutoFill} />
      </div>
    </div>
  );
};

export default Signup;