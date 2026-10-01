import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../style/auth/login.css";
import API_URL from '../../config/api.js'

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    setSuccess("");

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      /*
        Store authentication information
        so ProductDetails / Cart can check
        whether the user is logged in.
      */
      localStorage.setItem("token", data.token);

      localStorage.setItem(
        "user",
        JSON.stringify({
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
        })
      );

      // Tell Header that login status has changed
      window.dispatchEvent(new Event("authChanged"));

      setSuccess("Login successful!");

      /*
        If user came from a protected action,
        return them to that page.

        Example:
        /products/123
      */
      const redirectTo =
        location.state?.from || "/";

      setTimeout(() => {
        navigate(redirectTo, {
          replace: true,
        });
      }, 500);
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-background-glow login-glow-one"></div>
      <div className="login-background-glow login-glow-two"></div>

      <section className="login-card">

        {/* Left Side */}
        <div className="login-brand-section">
          <div className="login-brand-logo">
            SHOP<span>NET</span>
          </div>

          <p className="login-brand-tagline">
            Everything you need,
            <br />
            all in one place.
          </p>

          <div className="login-brand-circle circle-one"></div>
          <div className="login-brand-circle circle-two"></div>
          <div className="login-brand-circle circle-three"></div>
        </div>

        {/* Right Side */}
        <div className="login-form-section">

          <div className="login-heading">
            <span>Welcome Back</span>

            <h1>Login to ShopNet</h1>

            <p>
              Sign in to continue shopping with us.
            </p>
          </div>

          {error && (
            <div className="login-message login-error">
              {error}
            </div>
          )}

          {success && (
            <div className="login-message login-success">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div className="login-input-group">
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
            <div className="login-input-group">
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="login-submit-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="login-spinner"></span>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>

          </form>

          <div className="login-register-link">
            <span>Don't have an account?</span>

            <Link to="/register">
              Create Account
            </Link>
          </div>

          <button
            type="button"
            className="login-back-button"
            onClick={() => navigate("/")}
          >
            ← Back to Shop
          </button>

        </div>
      </section>
    </main>
  );
};

export default Login;