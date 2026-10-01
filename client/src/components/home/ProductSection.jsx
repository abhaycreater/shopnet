
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/componentsCss/home/productSection.css";
import API_URL from '../../config/api.js'

const ProductSection = () => {
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/api/products`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        console.log("Products API:", data);

        // Your API returns { products: [...] }
        setProducts(data.products || []);
      } catch (error) {
        console.error("Fetch products error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Automatically change 4 products every 5 seconds
  useEffect(() => {
    if (products.length <= 4) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 4;

        if (nextIndex >= products.length) {
          return 0;
        }

        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [products.length]);

  // Get current 4 products
  const visibleProducts = products.slice(
    currentIndex,
    currentIndex + 4
  );

  const handleProductClick = (product) => {
    setSelectedProduct(product);

    setTimeout(() => {
      navigate(`/products/${product._id}`);
    }, 1400);
  };

  // Loading
  if (loading) {
    return (
      <section className="product-section">
        <div className="product-section-heading">
          <span className="product-section-label">
            SHOPNET COLLECTION
          </span>

          <h2>
            Featured <span>Products</span>
          </h2>

          <p>
            Discover some of our most popular products,
            carefully selected for you.
          </p>
        </div>

        <div className="product-grid">
          {[1, 2, 3, 4].map((item) => (
            <article
              className="product-card"
              key={item}
            >
              <div className="product-image-container">
                <div className="product-image-placeholder">
                  <span>✦</span>
                  <p>Loading...</p>
                </div>
              </div>

              <div className="product-info">
                <span className="product-category">
                  Loading...
                </span>

                <h3>Loading product...</h3>

                <div className="product-rating">
                  <span className="rating-star">
                    ★
                  </span>

                  <strong>0</strong>

                  <span className="product-reviews">
                    (0)
                  </span>
                </div>

                <div className="product-price-row">
                  <div className="product-price">
                    <strong>₹0</strong>
                  </div>

                  <button
                    className="add-cart-button"
                    type="button"
                  >
                    <span>+</span>
                    Cart
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  // No products
  if (products.length === 0) {
    return (
      <section className="product-section">
        <div className="product-section-heading">
          <span className="product-section-label">
            SHOPNET COLLECTION
          </span>

          <h2>
            Featured <span>Products</span>
          </h2>

          <p>
            No products available right now.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`product-section ${
        selectedProduct
          ? "product-is-opening"
          : ""
      }`}
    >
      {/* Product Heading */}

      <div className="product-section-heading">
        <span className="product-section-label">
          SHOPNET COLLECTION
        </span>

        <h2>
          Featured <span>Products</span>
        </h2>

        <p>
          Discover some of our most popular products,
          carefully selected for you.
        </p>
      </div>

      {/* Product Grid */}

      <div className="product-grid">
        {visibleProducts.map((product) => {
          const isActive =
            selectedProduct?._id === product._id;

          return (
            <article
              className={`product-card ${
                isActive
                  ? "product-card-active"
                  : ""
              }`}
              key={product._id}
              onClick={() =>
                handleProductClick(product)
              }
            >
              {/* Product Image */}

              <div className="product-image-container">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="product-image"
                  />
                ) : (
                  <div className="product-image-placeholder">
                    <span>✦</span>

                    <p>Product Image</p>
                  </div>
                )}

                {/* Discount */}

                {product.oldPrice &&
                  product.oldPrice > product.price && (
                    <span className="product-discount">
                      {Math.round(
                        ((product.oldPrice -
                          product.price) /
                          product.oldPrice) *
                          100
                      )}
                      % OFF
                    </span>
                  )}

                {/* Wishlist */}

                <button
                  className="product-wishlist"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                  aria-label={`Add ${product.name} to wishlist`}
                >
                  ♡
                </button>

                <div className="product-image-shine"></div>
              </div>

              {/* Product Information */}

              <div className="product-info">
                <span className="product-category">
                  {product.category}
                </span>

                <h3>{product.name}</h3>

                {/* Rating */}

                <div className="product-rating">
                  <span className="rating-star">
                    ★
                  </span>

                  <strong>
                    {Number(product.rating || 0).toFixed(
                      1
                    )}
                  </strong>

                  <span className="product-reviews">
                    ({product.numReviews || 0})
                  </span>
                </div>

                {/* Price */}

                <div className="product-price-row">
                  <div className="product-price">
                    <strong>
                      ₹
                      {Number(
                        product.price || 0
                      ).toLocaleString("en-IN")}
                    </strong>

                    {product.oldPrice && (
                      <del>
                        ₹
                        {Number(
                          product.oldPrice
                        ).toLocaleString("en-IN")}
                      </del>
                    )}
                  </div>

                  <button
                    className="add-cart-button"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    <span>+</span>
                    Cart
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Slider Indicators */}

      {products.length > 4 && (
        <div className="product-slider-indicators">
          {Array.from({
            length: Math.ceil(
              products.length / 4
            ),
          }).map((_, index) => (
            <span
              key={index}
              className={`product-slider-dot ${
                currentIndex / 4 === index
                  ? "active"
                  : ""
              }`}
            ></span>
          ))}
        </div>
      )}

      {/* Product Transition */}

      {selectedProduct && (
        <div className="product-transition">
          <div className="product-space-stars">
            {Array.from({ length: 35 }).map(
              (_, index) => (
                <span
                  key={index}
                  className={`product-star product-star-${
                    index + 1
                  }`}
                ></span>
              )
            )}
          </div>

          <div className="product-transition-glow product-transition-glow-one"></div>

          <div className="product-transition-glow product-transition-glow-two"></div>

          <div className="product-transition-ring product-transition-ring-one"></div>

          <div className="product-transition-ring product-transition-ring-two"></div>

          <div className="product-transition-content">
            <span>
              EXPLORE PRODUCT
            </span>

            <h1>
              {selectedProduct.name}
            </h1>

            <div className="product-transition-line"></div>

            <p>
              Discover something extraordinary
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductSection;
