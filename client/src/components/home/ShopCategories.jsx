import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BrandOrbit from "./BrandOrbit";
import "../../style/componentsCss/home/shopCategories.css";



const categories = [
  "Electronics",
  "Fashion",
  "Gaming",
  "Beauty",
  "Sports",
  "Home & Living",
  "Mobiles",
  "Accessories",
];

const icons = [
  "✦",
  "◆",
  "◈",
  "✧",
  "◇",
  "✦",
  "◈",
  "◆",
];

/*
  Category images

  You can replace these URLs later with your own images.

  Example:
  "/images/categories/electronics.jpg"
  or
  imported local images.
*/
const categoryImages = [
  "/assets/home/ShopCategories/electronic.jpeg",
  "/assets/home/ShopCategories/fashion.jpeg",
  "/assets/home/ShopCategories/gaming.jpeg",
  "/assets/home/ShopCategories/beauty.jpeg",
  "/assets/home/ShopCategories/sport.jpeg",
  "/assets/home/ShopCategories/home&living.jpeg",
  "/assets/home/ShopCategories/phone.jpeg",
  "/assets/home/ShopCategories/Accessories.jpeg",
];

const ShopCategories = () => {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeCardId, setActiveCardId] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const navigationTimer = useRef(null);

  // ----------------------------------
  // Cleanup navigation timer
  // ----------------------------------
  useEffect(() => {
    return () => {
      if (navigationTimer.current) {
        clearTimeout(navigationTimer.current);
      }
    };
  }, []);

  // ----------------------------------
  // Add / remove body scroll lock
  // ----------------------------------
  useEffect(() => {
    if (isTransitioning) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isTransitioning]);

  // ----------------------------------
  // Category click
  // ----------------------------------
  const handleCategoryClick = (category, cardId) => {
    if (isTransitioning) {
      return;
    }

    setSelectedCategory(category);
    setActiveCardId(cardId);
    setIsTransitioning(true);

    navigationTimer.current = setTimeout(() => {
      navigate(
        `/categories?type=${encodeURIComponent(category)}`
      );
    }, 1350);
  };

  // ----------------------------------
  // Keyboard accessibility
  // ----------------------------------
  const handleCardKeyDown = (
    event,
    category,
    cardId
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      handleCategoryClick(category, cardId);
    }
  };

  // ----------------------------------
  // Create stars
  // ----------------------------------
  const stars = Array.from(
    { length: 60 },
    (_, index) => ({
      id: index,

      x: (index * 37) % 100,

      y: (index * 61) % 100,

      delay: (index % 12) * 0.06,

      duration: 1.8 + (index % 5) * 0.2,

      size:
        index % 7 === 0
          ? 4
          : index % 3 === 0
          ? 3
          : 2,
    })
  );

  // ----------------------------------
  // Render category card
  // ----------------------------------
  const renderCategoryCard = (
    category,
    index,
    carouselId
  ) => {
    const cardId = `${carouselId}-${index}`;

    const isActive =
      activeCardId === cardId;

    return (
      <div
        key={cardId}
        className={`category-card ${
          isActive
            ? "category-card-active"
            : ""
        }`}
        onClick={() =>
          handleCategoryClick(
            category,
            cardId
          )
        }
        onKeyDown={(event) =>
          handleCardKeyDown(
            event,
            category,
            cardId
          )
        }
        role="button"
        tabIndex={0}
        aria-label={`Explore ${category}`}
      >
        {/* Card glow */}
        <div className="category-card-glow"></div>

        {/* Category image */}
        <div className="category-card-image-wrapper">
          <img
            src={categoryImages[index]}
            alt={category}
            className="category-card-image"
            loading="lazy"
          />

          <div className="category-image-overlay"></div>
        </div>

        {/* Shine effect */}
        <div className="category-card-shine"></div>

        {/* Number */}
        <div className="category-number">
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* Icon */}
        <div className="category-icon">
          {icons[index]}
        </div>

        {/* Content */}
        <div className="category-card-content">
          <span className="category-mini-label">
            SHOPNET
          </span>

          <h3>{category}</h3>

          <p>
            Explore collection
          </p>
        </div>

        {/* Arrow */}
        <span className="category-arrow">
          →
        </span>

        {/* Bottom line */}
        <div className="category-card-bottom-line"></div>
      </div>
    );
  };

  // ----------------------------------
  // Selected category index
  // ----------------------------------
  const selectedCategoryIndex =
    categories.indexOf(selectedCategory);

  return (
    <section className="shop-category-section">

      {/* =====================================
          BACKGROUND
      ====================================== */}

      <div className="category-bg-glow category-bg-glow-one"></div>

      <div className="category-bg-glow category-bg-glow-two"></div>

      <div className="category-bg-grid"></div>


      {/* =====================================
          HEADING
      ====================================== */}

      <div className="shop-category-heading">

        <span className="category-label">
          EXPLORE SHOPNET
        </span>

        <h2>
          Shop{" "}
          <span>by Category</span>
        </h2>

        <p>
          Discover products from categories made
          for every kind of shopper.
        </p>

      </div>


      {/* =====================================
          CATEGORY CAROUSEL
      ====================================== */}

      <div
        className={`category-carousel ${
          isTransitioning
            ? "category-carousel-paused"
            : ""
        }`}
      >

        <div className="category-track">

          {/* First set */}
          {categories.map(
            (category, index) =>
              renderCategoryCard(
                category,
                index,
                "first"
              )
          )}

          {/* Duplicate set for infinite loop */}
          {categories.map(
            (category, index) =>
              renderCategoryCard(
                category,
                index,
                "second"
              )
          )}

        </div>

      </div>


      {/* =====================================
          BRAND ORBIT
      ====================================== */}

      <BrandOrbit />


      {/* =====================================
          FULL SCREEN TRANSITION
      ====================================== */}

      {isTransitioning && (
        <div className="category-transition">

          {/* =================================
              BACKGROUND STARS
          ================================== */}

          <div className="transition-stars">

            {stars.map((star) => (
              <span
                key={star.id}
                className="transition-star"
                style={{
                  "--star-x": `${star.x}%`,
                  "--star-y": `${star.y}%`,
                  "--star-delay": `${star.delay}s`,
                  "--star-duration": `${star.duration}s`,
                  "--star-size": `${star.size}px`,
                }}
              />
            ))}

          </div>


          {/* =================================
              LARGE SPACE GLOW
          ================================== */}

          <div className="transition-space-glow"></div>


          {/* =================================
              LIGHT BEAMS
          ================================== */}

          <div className="transition-light transition-light-one"></div>

          <div className="transition-light transition-light-two"></div>

          <div className="transition-light transition-light-three"></div>


          {/* =================================
              EXPANDING RINGS
          ================================== */}

          <div className="transition-ring transition-ring-one"></div>

          <div className="transition-ring transition-ring-two"></div>

          <div className="transition-ring transition-ring-three"></div>


          {/* =================================
              CENTER ENERGY
          ================================== */}

          <div className="transition-energy"></div>


          {/* =================================
              EXPANDING CATEGORY CARD
          ================================== */}

          <div className="transition-category-card">

            <div className="transition-card-glow"></div>

            <div className="transition-card-border"></div>


            {/* Selected category image */}

            {selectedCategoryIndex >= 0 && (
              <div className="transition-category-image-wrapper">

                <img
                  src={
                    categoryImages[
                      selectedCategoryIndex
                    ]
                  }
                  alt={selectedCategory}
                  className="transition-category-image"
                />

                <div className="transition-category-image-overlay"></div>

              </div>
            )}


            {/* Category content */}

            <div className="transition-card-content">

              <div className="transition-card-icon">
                {selectedCategoryIndex >= 0
                  ? icons[selectedCategoryIndex]
                  : "✦"}
              </div>

              <span className="transition-card-label">
                OPENING CATEGORY
              </span>

              <h1>
                {selectedCategory}
              </h1>

              <div className="transition-card-line"></div>

              <p>
                Discover something extraordinary
              </p>

            </div>

          </div>


          {/* =================================
              WHITE FLASH AT THE END
          ================================== */}

          <div className="transition-final-flash"></div>

        </div>
      )}

    </section>
  );
};

export default ShopCategories;