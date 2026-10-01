
import React from "react";
import { Link } from "react-router-dom";
import "../style/componentsCss/footer.css";

const Footer = () => {
  return (
    <footer className="shopnet-footer">

      {/* Animated background */}
      <div className="footer-glow footer-glow-one"></div>
      <div className="footer-glow footer-glow-two"></div>

      {/* Animated particles */}
      <span className="footer-particle particle-one"></span>
      <span className="footer-particle particle-two"></span>
      <span className="footer-particle particle-three"></span>
      <span className="footer-particle particle-four"></span>

      <div className="footer-container">

        {/* Brand */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span>Shop</span>
            <strong>Net</strong>
          </Link>

          <p>
            Your trusted destination for quality products,
            great deals and a smooth shopping experience.
          </p>

          <div className="footer-socials">
            <button type="button" aria-label="Instagram">
              Instagram
            </button>

            <button type="button" aria-label="YouTube">
              YouTube
            </button>

            <button type="button" aria-label="Facebook">
              Facebook
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-column">
          <h3>Quick Links</h3>

          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/orders">My Orders</Link>
        </div>

        {/* Customer */}
        <div className="footer-column">
          <h3>Customer</h3>

          <Link to="/cart">My Cart</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Create Account</Link>
          <Link to="/contact">Contact Us</Link>
        </div>

        {/* Contact */}
        <div className="footer-column footer-contact">
          <h3>Get In Touch</h3>

          <p>📧 support@shopnet.com</p>
          <p>📞 +91 98765 43210</p>
          <p>📍 Mumbai, Maharashtra</p>
        </div>

      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} <span>ShopNet</span>. All rights reserved.
        </p>

        <div className="footer-bottom-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms & Conditions</Link>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
