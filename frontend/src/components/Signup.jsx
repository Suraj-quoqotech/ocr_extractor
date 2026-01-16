import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api/ocr";

export default function Signup() {
  const [form, setForm] = useState({ 
    username: "", 
    email: "", 
    password: "", 
    confirm: "",
    security_answer_1: "",
    security_answer_2: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const passwordRules = pwd => {
    const hasLength = pwd && pwd.length >= 6;
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    const score = [hasLength, hasNumber, hasSpecial].reduce((s, v) => s + (v ? 1 : 0), 0);
    const labels = ["Weak", "Fair", "Good", "Strong"];
    return { hasLength, hasNumber, hasSpecial, score, label: labels[score] || "" };
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!form.username.trim()) return setError("Enter a username");
    if (!form.email.includes("@")) return setError("Enter a valid email");
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (!form.security_answer_1.trim()) return setError("Answer to question 1 is required");
    if (!form.security_answer_2.trim()) return setError("Answer to question 2 is required");
    
    const rules = passwordRules(form.password);
    if (!rules.hasLength || !rules.hasNumber || !rules.hasSpecial) return setError("Password must be at least 6 characters, include a number and a special character");

    setLoading(true);
    try {
      const payload = { 
        username: form.username, 
        email: form.email, 
        password: form.password,
        security_answer_1: form.security_answer_1,
        security_answer_2: form.security_answer_2
      };
      const res = await axios.post(`${API_BASE}/auth/register/`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 201 || res.status === 200) {
        setSuccess("Account created — redirecting to login...");
        setTimeout(() => navigate("/login"), 1200);
      } else {
        setError("Unexpected response from server");
      }
    } catch (err) {
      if (err.response && err.response.data) {
        // Handle backend validation errors
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          // Extract field-specific errors
          if (errorData.username) {
            setError(Array.isArray(errorData.username) ? errorData.username[0] : errorData.username);
          } else if (errorData.email) {
            setError(Array.isArray(errorData.email) ? errorData.email[0] : errorData.email);
          } else if (errorData.password) {
            setError(Array.isArray(errorData.password) ? errorData.password[0] : errorData.password);
          } else if (errorData.security_answer_1) {
            setError(Array.isArray(errorData.security_answer_1) ? errorData.security_answer_1[0] : errorData.security_answer_1);
          } else if (errorData.security_answer_2) {
            setError(Array.isArray(errorData.security_answer_2) ? errorData.security_answer_2[0] : errorData.security_answer_2);
          } else if (errorData.detail) {
            setError(errorData.detail);
          } else {
            setError(JSON.stringify(errorData));
          }
        } else {
          setError(JSON.stringify(errorData));
        }
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const strength = passwordRules(form.password);

  const strengthColor = (score) => {
    if (score <= 1) return '#dc2626'; // red - weak
    if (score === 2) return '#f59e0b'; // orange - medium
    return '#16a34a'; // green - strong
  };

  const strengthLabel = (score) => {
    if (score <= 1) return 'Weak';
    if (score === 2) return 'Medium';
    return 'Strong';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#f6f9ff,#eef6ff)' }}>
      <div style={{ width: 420, borderRadius: 12, boxShadow: '0 10px 30px rgba(16,24,40,0.08)', background: '#fff', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 20, background: '#5b7fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 500, fontSize: 20 }}>Q</div>
          <div>
            <h2 style={{ margin: 0 }}>Create your account</h2>
            <div style={{ fontSize: 13, color: '#666' }}>Start extracting documents with OCR </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Username</label>
            <input name="username" value={form.username} onChange={handleChange} placeholder="Choose a username" required style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e6e9ef' }} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@company.com" required style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e6e9ef' }} />
          </div>

          <div style={{ marginBottom: 12, position: 'relative' }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Password</label>
            <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Create a password" required style={{ width: '90%', padding: '10px 40px 10px 12px', borderRadius: 8, border: '1px solid #e6e9ef' }} />
            <button type="button" onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: 8, top: 34, background: 'none', border: 'none', cursor: 'pointer', color: '#5b7fff' }}>{showPassword ? 'Hide' : 'Show'}</button>
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 12, color: '#666' }}>{strengthLabel(strength.score)}</div>
                <div style={{ fontSize: 12, color: '#666' }}>Password rules</div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <div style={{ fontSize: 12, color: strength.hasLength ? '#16a34a' : '#b0b0b0' }}>{strength.hasLength ? '✓' : '✕'} At least 6 characters</div>
                <div style={{ fontSize: 12, color: strength.hasNumber ? '#16a34a' : '#b0b0b0' }}>{strength.hasNumber ? '✓' : '✕'} Contains a number</div>
                <div style={{ fontSize: 12, color: strength.hasSpecial ? '#16a34a' : '#b0b0b0' }}>{strength.hasSpecial ? '✓' : '✕'} Contains a special character</div>
              </div>

              <div style={{ height: 8, background: '#f1f5f9', borderRadius: 8, marginTop: 10 }}>
                <div style={{ width: `${(strength.score / 3) * 100}%`, height: '100%', background: strengthColor(strength.score), borderRadius: 8, transition: 'width 200ms ease, background 200ms ease' }} />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Confirm password</label>
            <input name="confirm" type={showPassword ? 'text' : 'password'} value={form.confirm} onChange={handleChange} placeholder="Repeat password" required style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e6e9ef' }} />
          </div>

          <div style={{ marginBottom: 12, padding: 12, background: '#f8f9fa', borderRadius: 8, border: '1px solid #e6e9ef' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 12, color: '#333' }}>Security Questions (for password recovery)</label>
            
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Which city would you like to live in?</label>
              <input 
                name="security_answer_1" 
                value={form.security_answer_1} 
                onChange={handleChange} 
                placeholder="Your answer" 
                required 
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e6e9ef' }} 
              />
            </div>

            <div style={{ marginBottom: 0 }}>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>What is your favorite movie?</label>
              <input 
                name="security_answer_2" 
                value={form.security_answer_2} 
                onChange={handleChange} 
                placeholder="Your answer" 
                required 
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e6e9ef' }} 
              />
            </div>
          </div>

          {error && <div style={{ color: '#b00020', marginBottom: 8 }}>{error}</div>}
          {success && <div style={{ color: '#155724', marginBottom: 8 }}>{success}</div>}

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px 14px', background: '#5b7fff', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div style={{ marginTop: 14, textAlign: 'center' }}>
          <span style={{ fontSize: 14, color: '#666' }}>Already have an account? </span>
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#5b7fff', cursor: 'pointer' }}>Log in</button>
        </div>
      </div>
    </div>
  );
}