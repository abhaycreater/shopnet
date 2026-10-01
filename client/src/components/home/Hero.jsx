
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../style/componentsCss/home/hero.css";

const heroSlides = [
  {
    badge: "WELCOME OFFER",
    title: "Get 10% Off",
    highlight: "Your First Order.",
    coupon: "WELCOME10",
    button: "Shop Now",
    link: "/products",

    cardLabel: "WELCOME TO SHOPNET",
    cardTitle: "Start Your",
    cardHighlight: "Shopping.",
    cardDescription:
      "Enjoy an exclusive welcome offer on your first ShopNet order.",
    cardIcon: "🛍️",
    cardBadge: "10%",
  },

  {
    badge: "LIMITED TIME OFFER",
    title: "Save More.",
    highlight: "Shop More.",
    coupon: "SAVE20",
    button: "Explore Deals",
    link: "/products",

    cardLabel: "SPECIAL OFFER",
    cardTitle: "Big Savings",
    cardHighlight: "Await You.",
    cardDescription:
      "Use your exclusive coupon and save more on your favorite products.",
    cardIcon: "🎁",
    cardBadge: "20%",
  },

  {
    badge: "TECH DEALS",
    title: "Upgrade Your",
    highlight: "Tech Setup.",
    coupon: "TECH500",
    button: "Shop Electronics",
    link: "/products",

    cardLabel: "TECH COLLECTION",
    cardTitle: "Power Up",
    cardHighlight: "Your Setup.",
    cardDescription:
      "Discover electronics, accessories and smart gadgets made for you.",
    cardIcon: "⚡",
    cardBadge: "₹500",
  },

  {
    badge: "FASHION DEALS",
    title: "Find Your",
    highlight: "Perfect Style.",
    coupon: "STYLE20",
    button: "Shop Fashion",
    link: "/products",

    cardLabel: "FASHION STORE",
    cardTitle: "Your Style",
    cardHighlight: "Starts Here.",
    cardDescription:
      "Explore fresh styles and discover something that feels uniquely you.",
    cardIcon: "✨",
    cardBadge: "20%",
  },
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(
        (prev) => (prev + 1) % heroSlides.length
      );

      setCopied(false);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const slide = heroSlides[currentSlide];

  const handleCopyCoupon = async () => {
    try {
      await navigator.clipboard.writeText(slide.coupon);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Copy coupon error:", error);
    }
  };

  const handleDotClick = (index) => {
    setCurrentSlide(index);
    setCopied(false);
  };

  return (
    <main className="home-page">

      {/* ================= HERO SECTION ================= */}

      <section className="home-hero">

        {/* Background Glow */}
        <div className="hero-glow hero-glow-one"></div>
        <div className="hero-glow hero-glow-two"></div>

        {/* Floating Particles */}
        <span className="hero-particle hero-particle-one"></span>
        <span className="hero-particle hero-particle-two"></span>
        <span className="hero-particle hero-particle-three"></span>
        <span className="hero-particle hero-particle-four"></span>

        {/* ================= HERO CONTENT ================= */}

        <div className="hero-content">

          <div
            className="hero-slide-content"
            key={`content-${currentSlide}`}
          >

            <div className="hero-badge">
              <span></span>
              {slide.badge}
            </div>

            <h1>
              {slide.title}
              <br />
              <span>{slide.highlight}</span>
            </h1>

            <p>
              {slide.description}
            </p>

            {/* ================= COUPON ================= */}

            <div className="hero-coupon">

              <div className="hero-coupon-info">
                <span>USE COUPON CODE</span>

                <strong>
                  {slide.coupon}
                </strong>
              </div>

              <button
                type="button"
                onClick={handleCopyCoupon}
                className="hero-copy-coupon"
              >
                {copied ? "Copied ✓" : "Copy Code"}
              </button>

            </div>

            {/* ================= BUTTONS ================= */}

            <div className="hero-buttons">

              <Link
                to={slide.link}
                className="hero-primary-btn"
              >
                {slide.button}
                <span>→</span>
              </Link>

              <Link
                to="/categories"
                className="hero-secondary-btn"
              >
                Shop Categories
              </Link>

            </div>

          </div>

          {/* ================= SLIDER CONTROLS ================= */}

          <div className="hero-slider">

            {heroSlides.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`hero-slider-dot ${
                  currentSlide === index
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleDotClick(index)
                }
                aria-label={`Go to slide ${
                  index + 1
                }`}
              />
            ))}

            <span className="hero-slider-text">
              {currentSlide + 1} / {heroSlides.length}
            </span>

          </div>

          {/* ================= TRUST INFORMATION ================= */}

          <div className="hero-trust">

            <div className="trust-item">
              <strong>10K+</strong>
              <span>Products</span>
            </div>

            <div className="trust-divider"></div>

            <div className="trust-item">
              <strong>5K+</strong>
              <span>Customers</span>
            </div>

            <div className="trust-divider"></div>

            <div className="trust-item">
              <strong>24/7</strong>
              <span>Support</span>
            </div>

          </div>

        </div>

        {/* ================= HERO VISUAL ================= */}

        <div className="hero-visual">

          <div className="hero-orbit orbit-one"></div>
          <div className="hero-orbit orbit-two"></div>

          {/* 
            Separate wrapper for coin-toss animation.
            The card itself keeps its existing floating animation.
          */}

          <div
            className="hero-card-flip"
            key={`card-${currentSlide}`}
          >

            <div className="hero-shopping-card">

              <div className="shopping-card-glow"></div>

              <div className="shopping-icon">
                {slide.cardIcon}
              </div>

              <div className="shopping-card-content">

                <span>
                  {slide.cardLabel}
                </span>

                <h3>
                  {slide.cardTitle}
                  <br />
                  <span>
                    {slide.cardHighlight}
                  </span>
                </h3>

                <p>
                  {slide.cardDescription}
                </p>

              </div>

              <div className="shopping-card-badge">
                {slide.cardBadge}
              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
};

export default Hero;





// const heroSlides = [
//   {
//     badge: "WELCOME OFFER",
//     title: "Get 10% Off",
//     highlight: "Your First Order.",
//     coupon: "WELCOME10",
//     button: "Shop Now",
//     link: "/products",
//   },
//   {
//     badge: "LIMITED TIME OFFER",
//     title: "Save More.",
//     highlight: "Shop More.",
//     coupon: "SAVE20",
//     button: "Explore Deals",
//     link: "/products",
//   },
//   {
//     badge: "TECH DEALS",
//     title: "Upgrade Your",
//     highlight: "Tech Setup.",
//     coupon: "TECH500",
//     button: "Shop Electronics",
//     link: "/products",
//   },
// ];