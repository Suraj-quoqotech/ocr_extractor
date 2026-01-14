import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api/ocr";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/token/`, form, {
        headers: { "Content-Type": "application/json" },
      });

      // Expected { access, refresh }
      const { access, refresh } = res.data;
      if (access) {
        localStorage.setItem("access", access);
        localStorage.setItem("refresh", refresh);
        axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;
        // Reload the app so App's on-load logic picks up the token and fetches history
        window.location.href = '/';
      } else {
        setError("No access token in response");
      }
    } catch (err) {
      if (err.response && err.response.data) setError(JSON.stringify(err.response.data));
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#fff7ed,#eef2ff)' }}>
      <div style={{ width: 420, borderRadius: 12, boxShadow: '0 8px 24px rgba(16,24,40,0.06)', background: '#fff', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 10, background: '#5b7fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>Q</div>
          <div>
            <h2 style={{ margin: 0 }}>Welcome back</h2>
            <div style={{ fontSize: 13, color: '#666' }}>Sign in to continue to Quoqo-OCR</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Username</label>
            <input name="username" value={form.username} onChange={handleChange} placeholder="Username" required style={{ width: '95%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e6e9ef' }} />
          </div>

          <div style={{ marginBottom: 12, position: 'relative' }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Password</label>
            <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Password" required style={{ width: '90%', padding: '10px 40px 10px 12px', borderRadius: 8, border: '1px solid #e6e9ef' }} />
            <button type="button" onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: 8, top: 34, background: 'none', border: 'none', cursor: 'pointer', color: '#5b7fff' }}>{showPassword ? 'Hide' : 'Show'}</button>
          </div>

          {error && <div style={{ color: '#b00020', marginBottom: 8 }}>{error}</div>}

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px 14px', background: '#5b7fff', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: 14, textAlign: 'center' }}>
          <span style={{ fontSize: 14, color: '#666' }}>Don't have an account? </span>
          <button onClick={() => navigate('/signup')} style={{ background: 'none', border: 'none', color: '#5b7fff', cursor: 'pointer' }}>Sign up</button>
        </div>
      </div>
    </div>
  );
}
