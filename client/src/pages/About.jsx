import React from "react";
import { Link } from "react-router-dom";
import "../style/pagesCss/about.css";

const About = () => {
  return (
    <main className="about-page">

      {/* ================= HERO ================= */}
      <section className="about-hero">

        <div className="about-glow about-glow-one"></div>
        <div className="about-glow about-glow-two"></div>

        <span className="about-particle particle-one"></span>
        <span className="about-particle particle-two"></span>
        <span className="about-particle particle-three"></span>
        <span className="about-particle particle-four"></span>

        <div className="about-hero-content">

          <div className="about-badge">
            <span></span>
            ABOUT SHOPNET
          </div>

          <h1>
            Shopping should feel
            <br />
            <span>simple &amp; exciting.</span>
          </h1>

          <p>
            ShopNet brings products, great deals and a smooth
            shopping experience together in one modern platform.
          </p>

          <div className="about-hero-buttons">

            <Link
              to="/products"
              className="about-primary-btn"
            >
              Explore Products
              <span>→</span>
            </Link>

            <Link
              to="/"
              className="about-secondary-btn"
            >
              Back to Home
            </Link>

          </div>

        </div>
      </section>


      {/* ================= STATS ================= */}
      <section className="about-stats">

        <div className="stat-item">
          <strong>01</strong>
          <span>Simple Experience</span>
        </div>

        <div className="stat-line"></div>

        <div className="stat-item">
          <strong>02</strong>
          <span>Quality Products</span>
        </div>

        <div className="stat-line"></div>

        <div className="stat-item">
          <strong>03</strong>
          <span>Easy Shopping</span>
        </div>

        <div className="stat-line"></div>

        <div className="stat-item">
          <strong>04</strong>
          <span>Secure Platform</span>
        </div>

      </section>


      {/* ================= INTRO ================= */}
      <section className="about-intro">

        <div className="about-intro-label">
          <span></span>
          WHO WE ARE
        </div>

        <div className="about-intro-content">

          <h2>
            A better way to
            <span> shop online.</span>
          </h2>

          <p>
            ShopNet is a modern e-commerce platform designed
            to make online shopping simple, convenient and
            enjoyable. From discovering products to managing
            your orders, everything is designed around a
            smooth customer experience.
          </p>

        </div>

      </section>


      {/* ================= FEATURES ================= */}
      <section className="about-features">

        <div className="about-feature-card">

          <div className="feature-icon">
            ✦
          </div>

          <div className="feature-number">
            01
          </div>

          <h3>
            Simple Experience
          </h3>

          <p>
            Browse products, explore categories and manage
            your shopping experience through a clean and
            intuitive interface.
          </p>

          <div className="feature-line"></div>

        </div>


        <div className="about-feature-card featured-card">

          <div className="feature-icon">
            ◈
          </div>

          <div className="feature-number">
            02
          </div>

          <h3>
            Built for You
          </h3>

          <p>
            ShopNet focuses on creating a convenient
            experience where finding and purchasing
            products feels simple.
          </p>

          <div className="feature-line"></div>

        </div>


        <div className="about-feature-card">

          <div className="feature-icon">
            ◆
          </div>

          <div className="feature-number">
            03
          </div>

          <h3>
            Always Improving
          </h3>

          <p>
            We continue improving the platform with
            features that make shopping faster, easier
            and more enjoyable.
          </p>

          <div className="feature-line"></div>

        </div>

      </section>


      {/* ================= CTA ================= */}
      <section className="about-cta">

        <div className="cta-glow"></div>

        <div className="cta-content">

          <span>
            READY TO SHOP?
          </span>

          <h2>
            Find something
            <br />
            <strong>you'll love.</strong>
          </h2>

          <Link
            to="/products"
            className="cta-button"
          >
            Start Shopping
            <span>→</span>
          </Link>

        </div>

      </section>

    </main>
  );
};

export default About;
