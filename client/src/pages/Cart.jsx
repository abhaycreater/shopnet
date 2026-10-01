import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/pagesCss/cart.css";
import API_URL from "../config/api.js"

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);

  // --------------------------------
  // Coupon State
  // --------------------------------
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponError, setCouponError] = useState("");

  const navigate = useNavigate();

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(savedCart);
  };

  useEffect(() => {
    loadCart();

    const handleCartUpdated = () => {
      loadCart();
    };

    window.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, []);

  // --------------------------------
  // Update Quantity
  // --------------------------------
  const updateQuantity = (id, change) => {
    const updatedCart = cartItems
      .map((item) => {
        if (item._id === id) {
          const newQuantity = item.quantity + change;

          if (newQuantity <= 0) {
            return null;
          }

          if (newQuantity > item.stock) {
            return item;
          }

          return {
            ...item,
            quantity: newQuantity,
          };
        }

        return item;
      })
      .filter(Boolean);

    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    window.dispatchEvent(new Event("cartUpdated"));

    // Revalidate coupon after quantity change
    if (appliedCoupon) {
      const newSubtotal = updatedCart.reduce(
        (total, item) =>
          total +
          Number(item.price) * Number(item.quantity),
        0
      );

      revalidateCoupon(
        appliedCoupon.couponCode,
        newSubtotal
      );
    }
  };

  // --------------------------------
  // Remove Item
  // --------------------------------
  const removeItem = (id) => {
    const updatedCart = cartItems.filter(
      (item) => item._id !== id
    );

    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    window.dispatchEvent(new Event("cartUpdated"));

    // Revalidate coupon after removing item
    if (appliedCoupon) {
      const newSubtotal = updatedCart.reduce(
        (total, item) =>
          total +
          Number(item.price) * Number(item.quantity),
        0
      );

      if (newSubtotal <= 0) {
        setAppliedCoupon(null);
        setCouponCode("");
        setCouponMessage("");
        setCouponError("");
      } else {
        revalidateCoupon(
          appliedCoupon.couponCode,
          newSubtotal
        );
      }
    }
  };

  // --------------------------------
  // Clear Cart
  // --------------------------------
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");

    // Remove applied coupon too
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponMessage("");
    setCouponError("");

    window.dispatchEvent(new Event("cartUpdated"));
  };

  // --------------------------------
  // Calculate Subtotal
  // --------------------------------
  const subtotal = cartItems.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.quantity),
    0
  );

  // --------------------------------
  // Shipping Fee
  // --------------------------------
  const shippingFee = 50;

  // --------------------------------
  // Tax
  // --------------------------------
  const tax = 0;

  // --------------------------------
  // Discount
  // --------------------------------
  const discount = appliedCoupon
    ? Number(appliedCoupon.discount)
    : 0;

  // --------------------------------
  // Final Total Amount
  // --------------------------------
  const totalAmount =
    subtotal +
    shippingFee +
    tax -
    discount;

  // --------------------------------
  // Apply Coupon
  // --------------------------------
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code.");
      setCouponMessage("");
      return;
    }

    if (subtotal <= 0) {
      setCouponError("Your cart is empty.");
      setCouponMessage("");
      return;
    }

    setCouponLoading(true);
    setCouponError("");
    setCouponMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/coupons/apply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: couponCode.trim(),
            cartTotal: subtotal,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setCouponError(
          data.message || "Unable to apply coupon."
        );
        setAppliedCoupon(null);
        return;
      }

      setAppliedCoupon(data);

      setCouponCode(data.couponCode);

      setCouponMessage(
        `Coupon ${data.couponCode} applied successfully!`
      );

      setCouponError("");
    } catch (error) {
      console.error("Apply coupon error:", error);

      setCouponError(
        "Unable to connect to server. Please try again."
      );

      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  // --------------------------------
// Revalidate Applied Coupon
// --------------------------------
const revalidateCoupon = async (code, newSubtotal) => {
  if (!code || newSubtotal <= 0) {
    setAppliedCoupon(null);
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/api/coupons/apply`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          cartTotal: newSubtotal,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setAppliedCoupon(null);
      setCouponMessage("");
      setCouponError(
        data.message || "Coupon is no longer valid."
      );
      return;
    }

    setAppliedCoupon(data);

    setCouponMessage(
      `Coupon ${data.couponCode} updated successfully!`
    );

    setCouponError("");
  } catch (error) {
    console.error("Coupon revalidation error:", error);

    setAppliedCoupon(null);

    setCouponMessage("");

    setCouponError(
      "Unable to revalidate coupon."
    );
  }
};

  // --------------------------------
  // Remove Coupon
  // --------------------------------
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponMessage("");
    setCouponError("");
  };

  // --------------------------------
  // Total Items
  // --------------------------------
  const totalItems = cartItems.reduce(
    (total, item) =>
      total + Number(item.quantity),
    0
  );

  // --------------------------------
  // Empty Cart
  // --------------------------------
  if (cartItems.length === 0) {
    return (
      <main className="cart-page">
        <section className="cart-empty">

          <div className="cart-empty-icon">
            🛒
          </div>

          <span>SHOPNET CART</span>

          <h1>Your Cart is Empty</h1>

          <p>
            Looks like you haven't added anything to your cart yet.
          </p>

          <button
            type="button"
            onClick={() => navigate("/products")}
          >
            Continue Shopping →
          </button>

        </section>
      </main>
    );
  }

  // --------------------------------
  // Cart Page
  // --------------------------------
  return (
    <main className="cart-page">

      {/* Hero */}
      <section className="cart-hero">

        <div className="cart-glow cart-glow-one"></div>
        <div className="cart-glow cart-glow-two"></div>

        <div className="cart-hero-content">

          <span>SHOPNET CART</span>

          <h1>
            Your <strong>Shopping Cart</strong>
          </h1>

          <p>
            Review your selected products before checkout.
          </p>

        </div>
      </section>

      {/* Cart */}
      <section className="cart-container">

        {/* Heading */}
        <div className="cart-heading">

          <div>

            <span>YOUR SELECTION</span>

            <h2>
              Cart <strong>Items</strong>
            </h2>

          </div>

          <div className="cart-item-count">
            {totalItems}{" "}
            {totalItems === 1 ? "Item" : "Items"}
          </div>

        </div>

        <div className="cart-layout">

          {/* Products */}
          <div className="cart-products">

            {cartItems.map((item) => (
              <article
                className="cart-product"
                key={item._id}
              >

                {/* Product Image */}
                <div className="cart-product-image">

                  <img
                    src={item.imageUrl}
                    alt={item.name}
                  />

                </div>

                {/* Product Info */}
                <div className="cart-product-info">

                  <span className="cart-product-category">
                    {item.category}
                  </span>

                  <h3>{item.name}</h3>

                  <p>
                    ₹
                    {Number(item.price).toLocaleString(
                      "en-IN"
                    )}
                  </p>

                  <div className="cart-product-actions">

                    {/* Quantity */}
                    <div className="quantity-control">

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item._id, -1)
                        }
                      >
                        −
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item._id, 1)
                        }
                        disabled={
                          item.quantity >= item.stock
                        }
                      >
                        +
                      </button>

                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      className="cart-remove"
                      onClick={() =>
                        removeItem(item._id)
                      }
                    >
                      Remove
                    </button>

                  </div>

                </div>

                {/* Product Total */}
                <div className="cart-product-total">

                  <span>Total</span>

                  <strong>
                    ₹
                    {(
                      Number(item.price) *
                      Number(item.quantity)
                    ).toLocaleString("en-IN")}
                  </strong>

                </div>

              </article>
            ))}

            {/* Bottom Actions */}
            <div className="cart-bottom-actions">

              <button
                type="button"
                className="continue-shopping"
                onClick={() =>
                  navigate("/products")
                }
              >
                ← Continue Shopping
              </button>

              <button
                type="button"
                className="clear-cart"
                onClick={clearCart}
              >
                Clear Cart
              </button>

            </div>

          </div>

          {/* Order Summary */}
          <aside className="cart-summary">

            <span>ORDER SUMMARY</span>

            <h2>
              Cart <strong>Total</strong>
            </h2>

            {/* Items */}
            <div className="summary-row">

              <span>Items</span>

              <strong>
                {totalItems}
              </strong>

            </div>

            {/* Subtotal */}
            <div className="summary-row">

              <span>Subtotal</span>

              <strong>
                ₹
                {subtotal.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

            {/* Coupon */}
            <div className="coupon-section">

              <span className="coupon-label">
                HAVE A COUPON?
              </span>

              <div className="coupon-input-row">

                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(
                      e.target.value.toUpperCase()
                    );
                    setCouponError("");
                    setCouponMessage("");
                  }}
                  disabled={couponLoading}
                />

                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading}
                >
                  {couponLoading ? "Applying..." : "Apply"}
                </button>

              </div>

              {/* Success Message */}
              {couponMessage && (
                <div className="coupon-success">
                  {couponMessage}
                </div>
              )}

              {/* Error Message */}
              {couponError && (
                <div className="coupon-error">
                  {couponError}
                </div>
              )}

              {/* Applied Coupon */}
              {appliedCoupon && (
                <div className="applied-coupon">

                  <div>
                    <span>
                      Applied:
                    </span>

                    <strong>
                      {appliedCoupon.couponCode}
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                  >
                    Remove
                  </button>

                </div>
              )}

            </div>

            {/* Shipping */}
            <div className="summary-row">

              <span>Shipping Fee</span>

              <strong>
                {shippingFee === 0
                  ? "FREE"
                  : `₹${shippingFee.toLocaleString(
                      "en-IN"
                    )}`}
              </strong>

            </div>

            {/* Tax */}
            <div className="summary-row">

              <span>Tax</span>

              <strong>
                ₹
                {tax.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

            {/* Discount */}
            <div className="summary-row">

              <span>Discount</span>

              <strong className="discount-value">

                {discount > 0
                  ? `-₹${discount.toLocaleString(
                      "en-IN"
                    )}`
                  : "₹0"}

              </strong>

            </div>

            <div className="summary-line"></div>

            {/* Total */}
            <div className="summary-total">

              <span>Total Amount</span>

              <strong>
                ₹
                {totalAmount.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

            {/* Checkout */}
            <button
              type="button"
              className="checkout-button"
              onClick={() => {
                navigate("/checkout", {
                  state: {
                    cartItems,
                    subtotal,
                    shippingFee,
                    tax,
                    discount,
                    totalAmount,
                    couponCode:
                      appliedCoupon?.couponCode || null,
                  },
                });
              }}
            >
              Proceed to Checkout →
            </button>

          </aside>

        </div>

      </section>

    </main>
  );
};

export default Cart;