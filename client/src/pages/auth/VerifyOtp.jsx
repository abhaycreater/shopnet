import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../style/auth/verifyOtp.css";
import API_URL from '../../config/api.js'

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [timeLeft, setTimeLeft] = useState(600);

  /*
    If user directly opens /verify-otp
    without registering first.
  */
  useEffect(() => {
    if (!email) {
      navigate("/register", { replace: true });
    }
  }, [email, navigate]);

  /*
    OTP countdown
    10 minutes = 600 seconds
  */
  useEffect(() => {
    if (timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleOtpChange = (event) => {
    const value = event.target.value;

    /*
      Only allow numbers
      Maximum 6 digits
    */
    if (!/^\d*$/.test(value)) {
      return;
    }

    if (value.length > 6) {
      return;
    }

    setOtp(value);
    setError("");
  };

  const handleVerify = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    if (otp.length !== 6) {
      setError("OTP must contain 6 digits.");
      return;
    }

    if (timeLeft <= 0) {
      setError("OTP has expired. Please request a new OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "OTP verification failed."
        );
      }

      /*
        Your verifyOTP backend returns:
        {
          message,
          token
        }
      */

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      /*
        We don't receive name/email/role
        from verifyOTP.

        Store the email for now.
        The login page will later save the
        complete user information.
      */
      localStorage.setItem(
        "user",
        JSON.stringify({
          email,
          verified: true,
        })
      );

      setSuccess("Email verified successfully!");

      /*
        Send user to login after verification.
      */
      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            verified: true,
            email,
          },
        });
      }, 1000);
    } catch (error) {
      console.error("OTP verification error:", error);

      setError(
        error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setSuccess("");

    if (resendLoading) {
      return;
    }

    try {
      setResendLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/resend-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to resend OTP."
        );
      }

      /*
        Reset countdown to 10 minutes.
      */
      setTimeLeft(600);

      setOtp("");

      setSuccess(
        data.message || "New OTP sent successfully."
      );
    } catch (error) {
      console.error("Resend OTP error:", error);

      setError(
        error.message ||
          "Unable to resend OTP. Please try again."
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <main className="verify-otp-page">

      <div className="verify-otp-glow verify-glow-one"></div>
      <div className="verify-otp-glow verify-glow-two"></div>

      <section className="verify-otp-card">

        {/* Brand Section */}

        <div className="verify-otp-brand">

          <div className="verify-otp-logo">
            SHOP<span>NET</span>
          </div>

          <div className="verify-otp-icon">
            ✉
          </div>

          <h2>Check Your Email</h2>

          <p>
            We've sent a verification code to
          </p>

          <strong>{email}</strong>

          <div className="verify-orbit verify-orbit-one"></div>
          <div className="verify-orbit verify-orbit-two"></div>

        </div>

        {/* Form Section */}

        <div className="verify-otp-content">

          <div className="verify-otp-heading">

            <span>Email Verification</span>

            <h1>Verify Your Account</h1>

            <p>
              Enter the 6-digit OTP sent to your
              email address.
            </p>

          </div>

          {error && (
            <div className="verify-otp-message verify-error">
              {error}
            </div>
          )}

          {success && (
            <div className="verify-otp-message verify-success">
              {success}
            </div>
          )}

          <form onSubmit={handleVerify}>

            <div className="verify-otp-input-group">

              <label htmlFor="otp">
                Verification Code
              </label>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={handleOtpChange}
                placeholder="000000"
                maxLength={6}
                disabled={loading}
              />

            </div>

            <div
              className={
                timeLeft > 0
                  ? "verify-otp-timer"
                  : "verify-otp-timer expired"
              }
            >
              {timeLeft > 0
                ? `OTP expires in ${formatTime()}`
                : "OTP has expired"}
            </div>

            <button
              type="submit"
              className="verify-otp-button"
              disabled={
                loading ||
                otp.length !== 6 ||
                timeLeft <= 0
              }
            >
              {loading ? (
                <>
                  <span className="verify-spinner"></span>
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </button>

          </form>

          <div className="verify-resend-section">

            <span>
              Didn't receive the OTP?
            </span>

            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendLoading}
            >
              {resendLoading
                ? "Sending..."
                : "Resend OTP"}
            </button>

          </div>

          <Link
            to="/login"
            className="verify-login-link"
          >
            ← Back to Login
          </Link>

        </div>

      </section>
    </main>
  );
};

export default VerifyOTP;