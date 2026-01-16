import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api/ocr";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // Step 1: Username, Step 2: Security Questions, Step 3: New Password
  const [form, setForm] = useState({
    username: "",
    security_answer_1: "",
    security_answer_2: "",
    new_password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Step 1: Get username and fetch security questions
  const handleStep1 = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // For now, we'll just move to step 2 with the username
      // In a real app, you might verify the user exists
      if (!form.username.trim()) {
        setError("Please enter your username");
        setLoading(false);
        return;
      }
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit security answers and new password
  const handleStep2 = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (!form.security_answer_1.trim() || !form.security_answer_2.trim()) {
        setError("Please answer both security questions");
        setLoading(false);
        return;
      }

      if (form.new_password !== form.confirm_password) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      if (form.new_password.length < 8) {
        setError("Password must be at least 8 characters");
        setLoading(false);
        return;
      }

      const res = await axios.post(`${API_BASE}/auth/forgot-password/`, {
        username: form.username,
        security_answer_1: form.security_answer_1,
        security_answer_2: form.security_answer_2,
        new_password: form.new_password,
      });

      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        if (typeof errorData === "object") {
          const errorMessages = Object.values(errorData).flat();
          setError(errorMessages.join(", "));
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

  const handleReset = () => {
    setStep(1);
    setForm({
      username: "",
      security_answer_1: "",
      security_answer_2: "",
      new_password: "",
      confirm_password: "",
    });
    setError(null);
    setSuccess(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg,#fff7ed,#eef2ff)",
      }}
    >
      <div
        style={{
          width: 420,
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(16,24,40,0.06)",
          background: "#fff",
          padding: "2rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div
            style={{
              width: 48,
              height: 45,
              borderRadius: 10,
              background: "#5b7fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            Q
          </div>
          <div>
            <h2 style={{ margin: 0 }}>Reset Password</h2>
            <div style={{ fontSize: 13, color: "#666" }}>
              {step === 1
                ? "Enter your username to get started"
                : "Answer your security questions"}
            </div>
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={handleStep1}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
                Username
              </label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter your username"
                required
                style={{
                  width: "95.7%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #e6e9ef",
                }}
              />
            </div>

            {error && (
              <div style={{ color: "#b00020", marginBottom: 8, fontSize: 13 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                display: "block",
                width: 180,
                margin: "12px auto 0",
                padding: "10px 14px",
                background: "#5b7fff",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                textAlign: "center",
              }}
            >
              {loading ? "Verifying..." : "Continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleStep2}>
            {/* Security Question 1 */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 13, marginBottom: 6, fontWeight: 500 }}>
                Which city would you like to live in?
              </label>
              <input
                name="security_answer_1"
                value={form.security_answer_1}
                onChange={handleChange}
                placeholder="Your answer"
                required
                style={{
                  width: "95.7%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #e6e9ef",
                }}
              />
            </div>

            {/* Security Question 2 */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 13, marginBottom: 6, fontWeight: 500 }}>
                What is your favorite movie?
              </label>
              <input
                name="security_answer_2"
                value={form.security_answer_2}
                onChange={handleChange}
                placeholder="Your answer"
                required
                style={{
                  width: "95.7%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #e6e9ef",
                }}
              />
            </div>

            {/* New Password */}
            <div style={{ marginBottom: 12, position: "relative" }}>
              <label style={{ display: "block", fontSize: 13, marginBottom: 6, fontWeight: 500 }}>
                New Password
              </label>
              <input
                name="new_password"
                type={showPassword ? "text" : "password"}
                value={form.new_password}
                onChange={handleChange}
                placeholder="Min 8 characters"
                required
                style={{
                  width: "90%",
                  padding: "10px 40px 10px 12px",
                  borderRadius: 8,
                  border: "1px solid #e6e9ef",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                style={{
                  position: "absolute",
                  right: 8,
                  top: 34,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#5b7fff",
                  fontSize: 12,
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: 12, position: "relative" }}>
              <label style={{ display: "block", fontSize: 13, marginBottom: 6, fontWeight: 500 }}>
                Confirm Password
              </label>
              <input
                name="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirm_password}
                onChange={handleChange}
                placeholder="Re-enter password"
                required
                style={{
                  width: "90%",
                  padding: "10px 40px 10px 12px",
                  borderRadius: 8,
                  border: "1px solid #e6e9ef",
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((s) => !s)}
                style={{
                  position: "absolute",
                  right: 8,
                  top: 34,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#5b7fff",
                  fontSize: 12,
                }}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>

            {error && (
              <div style={{ color: "#b00020", marginBottom: 8, fontSize: 13 }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ color: "#28a745", marginBottom: 8, fontSize: 13 }}>
                {success}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  background: "#f0f0f0",
                  color: "#333",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  background: "#5b7fff",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        )}

        <div style={{ marginTop: 14, textAlign: "center" }}>
          <button
            onClick={() => navigate("/login")}
            style={{
              background: "none",
              border: "none",
              color: "#5b7fff",
              cursor: "pointer",
              fontSize: 14,
              textDecoration: "underline",
            }}
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
}