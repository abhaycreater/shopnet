
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../style/pagesCss/productDetails.css";
import API_URL from '../config/api.js'

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add to cart animation
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/products/${id}`
        );

        if (!response.ok) {
          throw new Error("Product not found");
        }

        const data = await response.json();

        setProduct(data.product || data);
      } catch (error) {
        console.error("Product details error:", error);
        setError("Unable to load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // =========================
  // ADD TO CART
  // =========================
  const handleAddToCart = () => {
    // ---------------------------------
    // 1. Check whether user is logged in
    // ---------------------------------
    const token = localStorage.getItem("token");

    if (!token) {
    navigate("/login", {
      state: {
        from: `/products/${id}`,
      },
    });

    return;
  }

    // ---------------------------------
    // 2. Product validation
    // ---------------------------------
    if (!product || product.stock <= 0 || isAdded) {
      return;
    }

    // ---------------------------------
    // 3. Get existing cart
    // ---------------------------------
    const existingCart =
      JSON.parse(localStorage.getItem("cart")) || [];

    // ---------------------------------
    // 4. Check if product already exists
    // ---------------------------------
    const existingProduct = existingCart.find(
      (item) => item._id === product._id
    );

    let updatedCart;

    if (existingProduct) {
      // ---------------------------------
      // 5. Check stock limit
      // ---------------------------------
      if (existingProduct.quantity >= product.stock) {
        return;
      }

      updatedCart = existingCart.map((item) =>
        item._id === product._id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      );
    } else {
      // ---------------------------------
      // 6. Add new product
      // ---------------------------------
      updatedCart = [
        ...existingCart,
        {
          _id: product._id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          stock: product.stock,
          imageUrl: product.imageUrl,
          rating: product.rating,
          numReviews: product.numReviews,
          quantity: 1,
        },
      ];
    }

    // ---------------------------------
    // 7. Save cart
    // ---------------------------------
    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );

    // ---------------------------------
    // 8. Update Header cart count
    // ---------------------------------
    window.dispatchEvent(
      new Event("cartUpdated")
    );

    // ---------------------------------
    // 9. Start button animation
    // ---------------------------------
    setIsAdded(true);

    // ---------------------------------
    // 10. Return button to normal
    // ---------------------------------
    setTimeout(() => {
      setIsAdded(false);
    }, 1200);
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <main className="product-details-page">
        <div className="product-details-loading">
          <div className="product-loader"></div>
          <p>Loading product...</p>
        </div>
      </main>
    );
  }

  // =========================
  // ERROR
  // =========================
  if (error || !product) {
    return (
      <main className="product-details-page">
        <div className="product-details-error">
          <div className="error-icon">!</div>

          <h2>Product Not Found</h2>

          <p>
            We couldn't find this product. It may have been
            removed or is temporarily unavailable.
          </p>

          <button
            type="button"
            onClick={() => navigate("/products")}
          >
            ← Back to Products
          </button>
        </div>
      </main>
    );
  }

  const rating = Number(product.rating || 0);
  const reviews = Number(product.numReviews || 0);
  const price = Number(product.price || 0);
  const stock = Number(product.stock || 0);

  return (
    <main className="product-details-page">

      {/* Top Back Button */}
      <div className="product-details-container">
        <button
          type="button"
          className="back-products-button"
          onClick={() => navigate("/products")}
        >
          ← Back to Products
        </button>
      </div>

      {/* Product Details */}
      <section className="product-details-section">
        <div className="product-details-container">

          <div className="product-details-card">

            {/* Product Image */}
            <div className="product-details-image-wrapper">
              <div className="product-details-glow"></div>

              <img
                src={product.imageUrl}
                alt={product.name}
                className="product-details-image"
              />

              <span className="product-details-category">
                {product.category}
              </span>
            </div>

            {/* Product Information */}
            <div className="product-details-content">

              <span className="product-details-small-category">
                {product.category}
              </span>

              <h1>{product.name}</h1>

              <div className="product-details-rating">

                <div className="stars">
                  {"★".repeat(Math.round(rating))}
                  {"☆".repeat(5 - Math.round(rating))}
                </div>

                <strong>{rating.toFixed(1)}</strong>

                <span>
                  ({reviews}{" "}
                  {reviews === 1
                    ? "review"
                    : "reviews"})
                </span>

              </div>

              <div className="product-details-divider"></div>

              <p className="product-details-description">
                {product.description}
              </p>

              {/* Price */}
              <div className="product-details-price-box">
                <span className="price-label">
                  Price
                </span>

                <div className="product-details-price">
                  ₹{price.toLocaleString("en-IN")}
                </div>
              </div>

              {/* Stock */}
              <div
                className={
                  stock > 0
                    ? "product-details-stock in-stock"
                    : "product-details-stock out-stock"
                }
              >
                <span className="stock-dot"></span>

                {stock > 0
                  ? `${stock} units available`
                  : "Currently out of stock"}
              </div>

              {/* Actions */}
              <div className="product-details-actions">

                <button
                  type="button"
                  className={
                    isAdded
                      ? "add-cart-button cart-added"
                      : "add-cart-button"
                  }
                  onClick={handleAddToCart}
                  disabled={
                    stock <= 0 || isAdded
                  }
                >

                  {/* Spark Particles */}
                  {isAdded && (
                    <span className="cart-sparks">
                      <i className="spark spark-1"></i>
                      <i className="spark spark-2"></i>
                      <i className="spark spark-3"></i>
                      <i className="spark spark-4"></i>
                      <i className="spark spark-5"></i>
                      <i className="spark spark-6"></i>
                    </span>
                  )}

                  <span className="cart-button-icon">
                    {isAdded ? "✓" : "🛒"}
                  </span>

                  <span>
                    {stock > 0
                      ? isAdded
                        ? "Added to Cart"
                        : "Add to Cart"
                      : "Out of Stock"}
                  </span>

                </button>

                <button
                  type="button"
                  className="wishlist-details-button"
                >
                  ♡
                </button>

              </div>

              {/* Product Information */}
              <div className="product-info-list">

                <div className="product-info-item">
                  <span className="info-icon">
                    ✓
                  </span>

                  <div>
                    <strong>
                      Quality Product
                    </strong>

                    <p>
                      Carefully selected products
                      from SHOPNET
                    </p>
                  </div>
                </div>

                <div className="product-info-item">
                  <span className="info-icon">
                    🚚
                  </span>

                  <div>
                    <strong>
                      Fast Delivery
                    </strong>

                    <p>
                      Quick and reliable delivery
                      to your doorstep
                    </p>
                  </div>
                </div>

                <div className="product-info-item">
                  <span className="info-icon">
                    🔒
                  </span>

                  <div>
                    <strong>
                      Secure Payment
                    </strong>

                    <p>
                      Your payment information
                      is protected
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>
    </main>
  );
};

export default ProductDetails;