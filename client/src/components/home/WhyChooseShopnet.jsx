import React from "react";
import "../../style/componentsCss/home/whyChooseShopnet.css";

const features = [
  {
    id: 1,
    icon: "✦",
    title: "Quality Products",
    description:
      "Carefully selected products from trusted brands and sellers.",
  },

  {
    id: 2,
    icon: "🚚",
    title: "Fast Delivery",
    description:
      "Get your favorite products delivered quickly and safely to your doorstep.",
  },

  {
    id: 3,
    icon: "🔒",
    title: "Secure Payments",
    description:
      "Your transactions are protected with safe and secure payment technology.",
  },

  {
    id: 4,
    icon: "◈",
    title: "24/7 Support",
    description:
      "Our support team is always ready to help whenever you need us.",
  },
];

const WhyChooseShopnet = () => {
  return (
    <section className="why-shopnet-section">

      {/* Background Effects */}

      <div className="why-glow why-glow-one"></div>

      <div className="why-glow why-glow-two"></div>

      <div className="why-particle why-particle-one"></div>

      <div className="why-particle why-particle-two"></div>

      <div className="why-particle why-particle-three"></div>

      {/* Heading */}

      <div className="why-shopnet-heading">

        <span className="why-shopnet-label">
          THE SHOPNET DIFFERENCE
        </span>

        <h2>
          Why Choose <span>SHOPNET?</span>
        </h2>

        <p>
          More than just shopping. We create a simple,
          secure and enjoyable experience for every customer.
        </p>

      </div>

      {/* Main Content */}

      <div className="why-shopnet-container">

        {/* Left Features */}

        <div className="why-feature-column">

          {features.slice(0, 2).map((feature) => (
            <div
              className="why-feature-card"
              key={feature.id}
            >

              <div className="why-feature-icon">
                {feature.icon}
              </div>

              <div className="why-feature-content">

                <h3>
                  {feature.title}
                </h3>

                <p>
                  {feature.description}
                </p>

              </div>

              <span className="why-feature-number">
                0{feature.id}
              </span>

            </div>
          ))}

        </div>


        {/* Center */}

        <div className="why-shopnet-center">

          <div className="why-orbit orbit-outer"></div>

          <div className="why-orbit orbit-middle"></div>

          <div className="why-orbit orbit-inner"></div>

          <div className="why-center-glow"></div>

          <div className="why-center-logo">

            <span>
              SHOP
            </span>

            <strong>
              SHOPNET
            </strong>

            <small>
              SHOP • DISCOVER • ENJOY
            </small>

          </div>

        </div>


        {/* Right Features */}

        <div className="why-feature-column">

          {features.slice(2, 4).map((feature) => (
            <div
              className="why-feature-card"
              key={feature.id}
            >

              <div className="why-feature-icon">
                {feature.icon}
              </div>

              <div className="why-feature-content">

                <h3>
                  {feature.title}
                </h3>

                <p>
                  {feature.description}
                </p>

              </div>

              <span className="why-feature-number">
                0{feature.id}
              </span>

            </div>
          ))}

        </div>

      </div>


      {/* Bottom Statement */}

      <div className="why-bottom-line">

        <span></span>

        <p>
          BUILT FOR BETTER SHOPPING
        </p>

        <span></span>

      </div>

    </section>
  );
};

export default WhyChooseShopnet;