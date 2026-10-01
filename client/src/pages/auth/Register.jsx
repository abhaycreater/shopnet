import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../style/auth/register.css";
import API_URL from '../../config/api.js'

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const name = formData.name.trim();
    const email = formData.email.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed."
        );
      }

      /*
        Your backend sends OTP to the
        registered email.

        We pass the email to the OTP page
        using React Router state.
      */
      navigate("/verify-otp", {
        state: {
          email: data.email || email,
        },
      });

    } catch (error) {
      console.error("Registration error:", error);

      setError(
        error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">

      <div className="register-background-glow register-glow-one"></div>
      <div className="register-background-glow register-glow-two"></div>

      <section className="register-card">

        {/* Form Section */}
        <div className="register-form-section">

          <div className="register-heading">

            <span>Create Account</span>

            <h1>Join ShopNet</h1>

            <p>
              Create your account and start shopping
              with ShopNet.
            </p>

          </div>

          {error && (
            <div className="register-message register-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Name */}
            <div className="register-input-group">

              <label htmlFor="name">
                Full Name
              </label>

              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                autoComplete="name"
                disabled={loading}
              />

            </div>

            {/* Email */}
            <div className="register-input-group">

              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
                disabled={loading}
              />

            </div>

            {/* Password */}
            <div className="register-input-group">

              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                autoComplete="new-password"
                disabled={loading}
              />

            </div>

            {/* Confirm Password */}
            <div className="register-input-group">

              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                autoComplete="new-password"
                disabled={loading}
              />

            </div>

            <button
              type="submit"
              className="register-submit-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="register-spinner"></span>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>

          </form>

          <div className="register-login-link">

            <span>Already have an account?</span>

            <Link to="/login">
              Login
            </Link>

          </div>

          <button
            type="button"
            className="register-back-button"
            onClick={() => navigate("/")}
          >
            ← Back to Shop
          </button>

        </div>

        {/* Brand Section */}
        <div className="register-brand-section">

          <div className="register-brand-logo">
            SHOP<span>NET</span>
          </div>

          <p className="register-brand-tagline">
            Your shopping journey
            <br />
            starts here.
          </p>

          <div className="register-brand-circle register-circle-one"></div>
          <div className="register-brand-circle register-circle-two"></div>
          <div className="register-brand-circle register-circle-three"></div>

        </div>

      </section>
    </main>
  );
};

export default Register;