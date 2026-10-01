import { useState } from "react";

const Advertisement = ({ onContinue }) => {
  const [closing, setClosing] = useState(false);

  const handleContinue = () => {
    if (closing) return;

    setClosing(true);

    setTimeout(() => {
      onContinue();
    }, 800);
  };

  return (
    <div
      className={`advertisement-page ${
        closing ? "advertisement-close" : ""
      }`}
      onClick={handleContinue}
    >
      {/* Background glows */}
      <div className="ad-glow ad-glow-1"></div>
      <div className="ad-glow ad-glow-2"></div>
      <div className="ad-glow ad-glow-3"></div>

      {/* Animated particles */}
      <div className="particles">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Floating shopping elements */}
      <div className="floating-item item-1">🛍️</div>
      <div className="floating-item item-2">✨</div>
      <div className="floating-item item-3">🛒</div>
      <div className="floating-item item-4">✦</div>

      {/* Main content */}
      <div className="advertisement-content">

        <div className="ad-welcome">
          <span>WELCOME TO</span>
        </div>

        <h1 className="shopnet-title">
          SHOPNET
        </h1>

        <div className="title-line">
          <span></span>
          <p>YOUR SHOPPING DESTINATION</p>
          <span></span>
        </div>

        {/* Logo video */}
        <div className="logo-video-wrapper">

          <div className="video-ring ring-1"></div>
          <div className="video-ring ring-2"></div>

          <div className="logo-video-container">

            <video
              className="logo-video"
              src="/assets/logo-mp4.mp4"
              autoPlay
              loop
              muted
              playsInline
            />

          </div>

        </div>

        <p className="ad-description">
          Everything you need.
          <br />
          <span>All in one place.</span>
        </p>

        {/* Continue */}
        <div className="continue-area">

          <div className="continue-circle">
            <span>→</span>
          </div>

          <div className="continue-text">
            <p>CLICK ANYWHERE</p>
            <span>TO ENTER SHOPNET</span>
          </div>

        </div>

      </div>

      {/* Bottom branding */}
      <div className="ad-footer">

        <span>SHOP</span>
        <i>•</i>
        <span>DISCOVER</span>
        <i>•</i>
        <span>ENJOY</span>

      </div>

      {/* Top corner */}
      <div className="ad-corner top-left"></div>
      <div className="ad-corner top-right"></div>
      <div className="ad-corner bottom-left"></div>
      <div className="ad-corner bottom-right"></div>

    </div>
  );
};

export default Advertisement;