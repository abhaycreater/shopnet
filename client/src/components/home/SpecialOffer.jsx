import React from "react";
import { Link } from "react-router-dom";
import "../../style/componentsCss/home/specialOffer.css";

const SpecialOffer = () => {
  return (
    <section className="special-offer-section">

      {/* Background Effects */}
      <div className="offer-glow offer-glow-one"></div>
      <div className="offer-glow offer-glow-two"></div>

      <div className="offer-particle offer-particle-one"></div>
      <div className="offer-particle offer-particle-two"></div>
      <div className="offer-particle offer-particle-three"></div>
      <div className="offer-particle offer-particle-four"></div>

      {/* Main Offer Card */}
      <div className="special-offer-card">

        {/* Left Content */}
        <div className="offer-content">

          <span className="offer-label">
            ✦ LIMITED TIME OFFER
          </span>

          <h2>
            Upgrade Your
            <br />
            <span>Shopping Experience.</span>
          </h2>

          <p>
            Discover amazing products at special prices.
            Grab your favorites before this exclusive offer ends.
          </p>

          {/* Discount */}
          <div className="offer-discount">

            <strong>
              50%
            </strong>

            <div>
              <span>
                UP TO
              </span>

              <span>
                OFF
              </span>
            </div>

          </div>

          {/* Button */}
          <Link
            to="/products"
            className="offer-button"
          >
            Shop Now
            <span>→</span>
          </Link>

        </div>


        {/* Right Visual */}
        <div className="offer-visual">

          {/* Orbit Rings */}
          <div className="offer-ring offer-ring-one"></div>
          <div className="offer-ring offer-ring-two"></div>
          <div className="offer-ring offer-ring-three"></div>

          {/* Main Product */}
          <div className="offer-product">

            <div className="offer-product-glow"></div>

            <div className="offer-product-icon">
              🛍️
            </div>

            <span>
              SHOPNET
            </span>

            <strong>
              SPECIAL
              <br />
              DEAL
            </strong>

          </div>

          {/* Floating Cards */}
          <div className="offer-floating-card offer-card-top">
            <span>🔥</span>
            <div>
              <strong>Hot Deal</strong>
              <small>Today Only</small>
            </div>
          </div>

          <div className="offer-floating-card offer-card-bottom">
            <span>✦</span>
            <div>
              <strong>Best Price</strong>
              <small>Limited Stock</small>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
};

export default SpecialOffer;