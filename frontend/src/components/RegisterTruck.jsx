import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, User, ArrowLeft, Bell, ChevronDown, Plus } from 'lucide-react';
import { API_URL } from '../config';
import '../Style/RegisterTruck.css';

const RegisterTruck = () => {
  const navigate = useNavigate();

  // Logged-in user information
  const [userName, setUserName] = useState('Anuj Kumar');

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'driver') {
      navigate('/dashboard');
      return;
    }

    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.name || parsed.UserName) {
          setUserName(parsed.name || parsed.UserName);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [navigate]);

  // Form State
  const [formData, setFormData] = useState({
    // Truck Information
    Truck_num: '',
    Truck_brand: 'Tata',
    Truck_model: '',
    Manufacturing_year: '',
    Truck_type: '',
    Fuel_type: 'Diesel',
    Milage: '',
    Load_capacity: '',
    Owner_name: '',

    // Driver Information
    Driver_name: '',
    DOB: '',
    License_num: '',
    License_issue: '',
    License_expiry: '',
    Contact_num: ''
  });

  const [driverAge, setDriverAge] = useState('--');
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Auto-calculate driver age when DOB changes
  const handleDOBChange = (e) => {
    const dobValue = e.target.value;
    setFormData((prev) => ({ ...prev, DOB: dobValue }));

    if (dobValue) {
      const birthDate = new Date(dobValue);
      const today = new Date();
      if (!isNaN(birthDate.getTime())) {
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        setDriverAge(age > 0 ? `${age} yrs` : '--');
      } else {
        setDriverAge('--');
      }
    } else {
      setDriverAge('--');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });

    // Client-side quick validations
    if (
      !formData.Truck_num ||
      !formData.Truck_brand ||
      !formData.Truck_model ||
      !formData.Manufacturing_year ||
      !formData.Milage ||
      !formData.Driver_name ||
      !formData.DOB ||
      !formData.License_num ||
      !formData.License_expiry
    ) {
      setStatusMessage({
        type: 'error',
        text: 'Please fill in all required fields marked with *'
      });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setStatusMessage({
        type: 'error',
        text: 'Authentication token not found. Please log in first.'
      });
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          Truck_num: formData.Truck_num.toUpperCase().trim(),
          Truck_brand: formData.Truck_brand,
          Truck_model: formData.Truck_model,
          Manufacturing_year: formData.Manufacturing_year,
          Owner_name: formData.Owner_name || userName,
          Milage: formData.Milage,
          Driver_name: formData.Driver_name,
          DOB: formData.DOB,
          License_num: formData.License_num,
          License_expiry: formData.License_expiry,
          Truck_type: formData.Truck_type,
          Fuel_type: formData.Fuel_type,
          Load_capacity: formData.Load_capacity,
          Contact_num: formData.Contact_num
        })
      });

      const data = await response.json();

      if (response.ok) {
        const registeredTruck = data.truck || {
          Truck_num: formData.Truck_num.toUpperCase().trim(),
          Truck_brand: formData.Truck_brand,
          Truck_model: formData.Truck_model,
          Milage: formData.Milage,
          Driver_name: formData.Driver_name
        };
        localStorage.setItem('activeTruck', JSON.stringify(registeredTruck));

        setStatusMessage({
          type: 'success',
          text: data.message || 'Truck and Driver successfully registered! Heading to dashboard...'
        });
        setTimeout(() => {
          navigate('/dashboard');
        }, 900);
      } else {
        setStatusMessage({
          type: 'error',
          text: data.message || 'Registration failed. Please check your inputs.'
        });
      }
    } catch (err) {
      console.error('Registration submit error:', err);
      setStatusMessage({
        type: 'error',
        text: `Unable to connect to server. Ensure backend is running on ${API_URL}.`
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate Year options from current year down to 2000
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 27 }, (_, i) => currentYear - i);

  return (
    <div className="register-page">
      <div className="register-container">
        {/* Top Navbar */}
        <div className="register-topbar">
          <button
            type="button"
            className="back-link"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </button>

          <div className="topbar-right">
            <button className="bell-btn" title="Notifications" type="button">
              <Bell size={18} />
              <span className="bell-badge"></span>
            </button>

            <div
              className="user-profile-pill"
              onClick={() => navigate('/login')}
              title="Switch user or login"
            >
              <div className="avatar-badge">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span>{userName}</span>
              <ChevronDown size={15} color="#64748b" />
            </div>
          </div>
        </div>

        {/* Page Title & Subtitle */}
        <div className="page-title-section">
          <h1 className="page-title">Register Truck & Driver</h1>
          <p className="page-subtitle">
            Add your truck details and driver information to start using TrackX.
          </p>
        </div>

        {/* Toast / Status Alert */}
        {statusMessage.text && (
          <div className={`toast-banner toast-${statusMessage.type}`}>
            <span>{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage({ type: '', text: '' })}
              style={{ background: 'transparent', fontWeight: 'bold' }}
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Two Columns Grid */}
          <div className="form-grid-cards">
            {/* CARD 1: Truck Information (Blue Theme) */}
            <div className="info-card truck-card">
              <div className="card-header">
                <div className="card-icon-box truck-icon-box">
                  <Truck size={22} />
                </div>
                <div>
                  <h2 className="card-heading">Truck Information</h2>
                  <p className="card-subheading">Enter your truck details</p>
                </div>
              </div>

              <div className="form-body">
                {/* Truck Number */}
                <div className="form-group">
                  <label className="form-label">
                    Truck Number <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    name="Truck_num"
                    className="form-input"
                    placeholder="e.g. UP82AB1234"
                    value={formData.Truck_num}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Brand & Model */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Truck Brand <span className="required-star">*</span>
                    </label>
                    <select
                      name="Truck_brand"
                      className="form-select"
                      value={formData.Truck_brand}
                      onChange={handleChange}
                      required
                    >
                      <option value="Tata">Tata</option>
                      <option value="Ashok Leyland">Ashok Leyland</option>
                      <option value="BharatBenz">BharatBenz</option>
                      <option value="Eicher">Eicher</option>
                      <option value="Mahindra">Mahindra</option>
                      <option value="Volvo">Volvo</option>
                      <option value="Scania">Scania</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Truck Model <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      name="Truck_model"
                      className="form-input"
                      placeholder="e.g. Signa 4825"
                      value={formData.Truck_model}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Manufacturing Year & Truck Type */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Manufacturing Year <span className="required-star">*</span>
                    </label>
                    <select
                      name="Manufacturing_year"
                      className="form-select"
                      value={formData.Manufacturing_year}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select year</option>
                      {years.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Truck Type <span className="required-star">*</span>
                    </label>
                    <select
                      name="Truck_type"
                      className="form-select"
                      value={formData.Truck_type}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select type</option>
                      <option value="Multi-Axle">Multi-Axle</option>
                      <option value="Container">Container</option>
                      <option value="Trailer">Trailer</option>
                      <option value="Tipper">Tipper</option>
                      <option value="Open Body">Open Body</option>
                      <option value="Tanker">Tanker</option>
                      <option value="Mini Truck">Mini Truck</option>
                    </select>
                  </div>
                </div>

                {/* Fuel Type & Mileage */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Fuel Type <span className="required-star">*</span>
                    </label>
                    <select
                      name="Fuel_type"
                      className="form-select"
                      value={formData.Fuel_type}
                      onChange={handleChange}
                      required
                    >
                      <option value="Diesel">Diesel</option>
                      <option value="CNG">CNG</option>
                      <option value="LNG">LNG</option>
                      <option value="Electric">Electric</option>
                      <option value="Petrol">Petrol</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Mileage (km/litre) <span className="required-star">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="Milage"
                      className="form-input"
                      placeholder="e.g. 4"
                      value={formData.Milage}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Load Capacity */}
                <div className="form-group">
                  <label className="form-label">
                    Load Capacity (tonnes) <span className="required-star">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    name="Load_capacity"
                    className="form-input"
                    placeholder="e.g. 25"
                    value={formData.Load_capacity}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* CARD 2: Driver Information (Green Theme) */}
            <div className="info-card driver-card">
              <div className="card-header">
                <div className="card-icon-box driver-icon-box">
                  <User size={22} />
                </div>
                <div>
                  <h2 className="card-heading">Driver Information</h2>
                  <p className="card-subheading">Enter driver details</p>
                </div>
              </div>

              <div className="form-body">
                {/* Driver Name */}
                <div className="form-group">
                  <label className="form-label">
                    Driver Name <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    name="Driver_name"
                    className="form-input"
                    placeholder="e.g. Rajesh Kumar"
                    value={formData.Driver_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Date of Birth & Age (Auto) */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Date of Birth <span className="required-star">*</span>
                    </label>
                    <input
                      type="date"
                      name="DOB"
                      className="form-input"
                      value={formData.DOB}
                      onChange={handleDOBChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Age (auto)</label>
                    <input
                      type="text"
                      className="form-input disabled-input"
                      value={driverAge}
                      readOnly
                      placeholder="--"
                    />
                  </div>
                </div>

                {/* Driving Licence Number & Licence Issue Date */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Driving Licence Number <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      name="License_num"
                      className="form-input"
                      placeholder="e.g. UP14 20180001234"
                      value={formData.License_num}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Licence Issue Date</label>
                    <input
                      type="date"
                      name="License_issue"
                      className="form-input"
                      value={formData.License_issue}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Licence Expiry Date & Contact Number */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Licence Expiry Date <span className="required-star">*</span>
                    </label>
                    <input
                      type="date"
                      name="License_expiry"
                      className="form-input"
                      value={formData.License_expiry}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Number</label>
                    <input
                      type="tel"
                      name="Contact_num"
                      className="form-input"
                      placeholder="e.g. 9876543210"
                      value={formData.Contact_num}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="form-actions-bottom">
            <button
              type="submit"
              className="btn-primary-register"
              disabled={loading}
            >
              <Plus size={18} />
              {loading ? 'Registering...' : 'Register Truck & Driver'}
            </button>

            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterTruck;
