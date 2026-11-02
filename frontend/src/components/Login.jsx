import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, UserCheck, Shield } from 'lucide-react';
import { API_URL } from '../config';
import DirectDemoCard from './DirectDemoCard';
import '../Style/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const url = API_URL;

  const [role, setRole] = useState('owner'); // 'owner' or 'driver'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const handleAutoFill = (demoEmail, demoPassword, demoRole) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setRole(demoRole);
    setStatusMessage({
      type: 'success',
      text: `Demo credentials auto-filled! Click "Log In as ${demoRole === 'owner' ? 'Truck Owner' : 'Driver'}" below or use instant launch buttons on the right.`
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setStatusMessage({ type: 'error', text: 'Please fill in both email and password' });
      return;
    }

    setLoading(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const data = await fetch(`${url}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Email: email,
          Password: password
        })
      });

      const ans = await data.json();

      if (data.ok) {
        const resolvedRole = ans.user?.role || role;
        localStorage.setItem('token', ans.Token);
        localStorage.setItem('role', resolvedRole);
        localStorage.setItem(
          'user',
          JSON.stringify({
            name: ans.user?.name || email.split('@')[0],
            email: ans.user?.email || email,
            role: resolvedRole
          })
        );
        setStatusMessage({
          type: 'success',
          text: `Welcome ${ans.user?.name || ''}! Logging in as ${resolvedRole === 'owner' ? 'Fleet Owner' : 'Driver'}...`
        });

        // Navigate directly to Dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 700);
      } else {
        setStatusMessage({ type: 'error', text: ans.message || 'Login failed' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setStatusMessage({
        type: 'error',
        text: `Unable to connect to backend server on ${url}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-content-grid">
        {/* Left Side: Standard Login Form */}
        <div className="login-container">
          <div className="auth-header">
            <h2 className="auth-brand">
              Track<span>X</span>
            </h2>
            <h3 className="auth-title">Welcome to TrackX</h3>
            <p className="auth-subtitle">Select your role to access your portal</p>
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

          <form onSubmit={handleLogin} className="auth-form">
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
                className="auth-input"
                placeholder="Enter your password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Authenticating...' : `Log In as ${role === 'owner' ? 'Truck Owner' : 'Driver'}`}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Sign up here</Link>
          </p>
        </div>

        {/* Right Side: Direct Demo Highlight Card */}
        <DirectDemoCard onFillCredentials={handleAutoFill} />
      </div>
    </div>
  );
};

export default Login;