
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../style/pagesCss/checkout.css";
import API_URL from '../config/api.js'

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const checkoutData = location.state || {};

  const cartItems = checkoutData.cartItems || [];

  const subtotal = Number(checkoutData.subtotal || 0);
  const shippingFee = Number(checkoutData.shippingFee ?? 50);
  const tax = Number(checkoutData.tax || 0);
  const discount = Number(checkoutData.discount || 0);

  const totalAmount =
    subtotal + shippingFee + tax - discount;

  const [currentStep, setCurrentStep] = useState(1);

  const [paymentMethod, setPaymentMethod] =
    useState("COD");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    country: "India",
    postalCode: "",
  });

  // ==========================================
  // ADDRESS INPUT
  // ==========================================

  const handleAddressChange = (e) => {
    const { name, value } = e.target;

    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // LOAD RAZORPAY SCRIPT
  // ==========================================

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => {
        resolve(true);
      };

      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };

  // ==========================================
  // ADDRESS VALIDATION
  // ==========================================

  const validateAddress = () => {
    const requiredFields = [
      "fullName",
      "phone",
      "street",
      "city",
      "state",
      "country",
      "postalCode",
    ];

    for (const field of requiredFields) {
      if (!address[field].trim()) {
        setError(
          `${field
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (char) =>
              char.toUpperCase()
            )} is required`
        );

        return false;
      }
    }

    if (!/^[0-9]{10}$/.test(address.phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return false;
    }

    if (!/^[0-9]{6}$/.test(address.postalCode)) {
      setError("Please enter a valid 6-digit postal code.");
      return false;
    }

    return true;
  };

  // ==========================================
  // GO TO PAYMENT
  // ==========================================

  const handleAddressContinue = () => {
    setError("");

    if (!validateAddress()) {
      return;
    }

    setCurrentStep(2);
  };

  // ==========================================
  // GO TO REVIEW
  // ==========================================

  const handlePaymentContinue = () => {
    setError("");
    setCurrentStep(3);
  };

  // ==========================================
  // CREATE SHOPNET ORDER
  // ==========================================

  const createShopNetOrder = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login before placing an order.");
      navigate("/login");
      return null;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return null;
    }

    const orderData = {
      items: cartItems.map((item) => ({
        product: item._id,
        quantity: Number(item.quantity),
      })),

      address,

      paymentMethod,

      shippingFee,

      tax,

      discount,
    };

    const response = await fetch(
      `${API_URL}/api/orders`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(orderData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to create order"
      );
    }

    return data.order;
  };

  // ==========================================
  // CREATE RAZORPAY ORDER
  // ==========================================

  const createRazorpayOrder = async (orderId) => {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_URL}/api/payments/create`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          orderId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to create Razorpay order"
      );
    }

    return data;
  };

  // ==========================================
  // VERIFY RAZORPAY PAYMENT
  // ==========================================

  const verifyPayment = async ({
    orderId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  }) => {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_URL}/api/payments/verify`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          orderId,
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Payment verification failed"
      );
    }

    return data;
  };

  // ==========================================
  // CLEAR CART
  // ==========================================

  const clearCart = () => {
    localStorage.removeItem("cart");

    window.dispatchEvent(
      new Event("cartUpdated")
    );
  };

  // ==========================================
  // COD ORDER
  // ==========================================

  const handleCODOrder = async (order) => {
    clearCart();

    alert(
      `Order placed successfully!\n\nOrder Number: ${order.orderNumber}`
    );

    navigate("/products");
  };

  // ==========================================
  // RAZORPAY PAYMENT
  // ==========================================

  const handleRazorpayPayment = async (order) => {
    // Load Razorpay Checkout
    const razorpayLoaded =
      await loadRazorpayScript();

    if (!razorpayLoaded) {
      throw new Error(
        "Razorpay Checkout failed to load. Please check your internet connection."
      );
    }

    // Create Razorpay order
    const razorpayData =
      await createRazorpayOrder(order._id);

    const options = {
      key: razorpayData.key,

      amount: razorpayData.amount,

      currency: razorpayData.currency,

      name: "ShopNet",

      description: `Payment for order ${order.orderNumber}`,

      order_id:
        razorpayData.razorpayOrderId,

      prefill: {
        name: address.fullName,

        contact: address.phone,
      },

      notes: {
        shopnetOrderId: order._id,
        orderNumber: order.orderNumber,
      },

      theme: {
        color: "#7c3aed",
      },

      handler: async function (response) {
        try {
          setLoading(true);
          setError("");

          await verifyPayment({
            orderId: order._id,

            razorpay_order_id:
              response.razorpay_order_id,

            razorpay_payment_id:
              response.razorpay_payment_id,

            razorpay_signature:
              response.razorpay_signature,
          });

          clearCart();

          alert(
            `Payment successful!\n\nOrder Number: ${order.orderNumber}`
          );

          navigate("/products");
        } catch (error) {
          console.error(
            "Payment verification error:",
            error
          );

          setError(
            error.message ||
              "Payment verification failed."
          );
        } finally {
          setLoading(false);
        }
      },

      modal: {
        ondismiss: function () {
          setLoading(false);
          setError(
            "Payment was cancelled. Your order is still pending."
          );
        },
      },
    };

    const razorpay =
      new window.Razorpay(options);

    razorpay.on(
      "payment.failed",
      function (response) {
        console.error(
          "Razorpay payment failed:",
          response
        );

        setError(
          response.error?.description ||
            "Payment failed. Please try again."
        );

        setLoading(false);
      }
    );

    razorpay.open();
  };

  // ==========================================
  // PLACE ORDER
  // ==========================================

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      setError("");

      // Create ShopNet order
      const order =
        await createShopNetOrder();

      if (!order) {
        return;
      }

      // COD
      if (paymentMethod === "COD") {
        await handleCODOrder(order);
        return;
      }

      // CARD / UPI
      await handleRazorpayPayment(order);
    } catch (error) {
      console.error(
        "Place order error:",
        error
      );

      setError(
        error.message ||
          "Something went wrong while placing your order."
      );

      setLoading(false);
    }
  };

  // ==========================================
  // EMPTY CART
  // ==========================================

  if (cartItems.length === 0) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <span>SHOPNET CHECKOUT</span>

          <h1>Your cart is empty</h1>

          <p>
            Add some products before proceeding
            to checkout.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/products")
            }
          >
            Continue Shopping →
          </button>
        </section>
      </main>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <main className="checkout-page">

      {/* HERO */}

      <section className="checkout-hero">

        <div className="checkout-glow checkout-glow-one"></div>

        <div className="checkout-glow checkout-glow-two"></div>

        <div className="checkout-hero-content">

          <span>SHOPNET CHECKOUT</span>

          <h1>
            Complete Your{" "}
            <strong>Order</strong>
          </h1>

          <p>
            Secure checkout for your ShopNet
            purchase.
          </p>

        </div>

      </section>

      {/* PROGRESS */}

      <section className="checkout-progress">

        <div
          className={`checkout-step ${
            currentStep >= 1
              ? "active"
              : ""
          }`}
        >
          <span>1</span>
          <p>Cart</p>
        </div>

        <div
          className={`checkout-progress-line ${
            currentStep >= 2
              ? "active"
              : ""
          }`}
        ></div>

        <div
          className={`checkout-step ${
            currentStep >= 1
              ? "active"
              : ""
          }`}
        >
          <span>2</span>
          <p>Address</p>
        </div>

        <div
          className={`checkout-progress-line ${
            currentStep >= 2
              ? "active"
              : ""
          }`}
        ></div>

        <div
          className={`checkout-step ${
            currentStep >= 2
              ? "active"
              : ""
          }`}
        >
          <span>3</span>
          <p>Payment</p>
        </div>

        <div
          className={`checkout-progress-line ${
            currentStep >= 3
              ? "active"
              : ""
          }`}
        ></div>

        <div
          className={`checkout-step ${
            currentStep >= 3
              ? "active"
              : ""
          }`}
        >
          <span>4</span>
          <p>Review</p>
        </div>

      </section>

      {/* ERROR */}

      {error && (
        <div className="checkout-error">
          {error}
        </div>
      )}

      {/* CONTENT */}

      <section className="checkout-container">

        {/* ========================= */}
        {/* ADDRESS */}
        {/* ========================= */}

        {currentStep === 1 && (
          <div className="checkout-card">

            <div className="checkout-section-heading">

              <span>STEP 1</span>

              <h2>
                Shipping{" "}
                <strong>Address</strong>
              </h2>

              <p>
                Enter the address where you
                want your order delivered.
              </p>

            </div>

            <div className="checkout-form">

              <div className="checkout-field">

                <label>Full Name</label>

                <input
                  type="text"
                  name="fullName"
                  value={address.fullName}
                  onChange={
                    handleAddressChange
                  }
                  placeholder="Enter your full name"
                />

              </div>

              <div className="checkout-field">

                <label>Phone Number</label>

                <input
                  type="tel"
                  name="phone"
                  value={address.phone}
                  onChange={
                    handleAddressChange
                  }
                  placeholder="10-digit mobile number"
                  maxLength="10"
                />

              </div>

              <div className="checkout-field checkout-field-full">

                <label>Street Address</label>

                <input
                  type="text"
                  name="street"
                  value={address.street}
                  onChange={
                    handleAddressChange
                  }
                  placeholder="House no., building, street"
                />

              </div>

              <div className="checkout-field">

                <label>City</label>

                <input
                  type="text"
                  name="city"
                  value={address.city}
                  onChange={
                    handleAddressChange
                  }
                  placeholder="Mumbai"
                />

              </div>

              <div className="checkout-field">

                <label>State</label>

                <input
                  type="text"
                  name="state"
                  value={address.state}
                  onChange={
                    handleAddressChange
                  }
                  placeholder="Maharashtra"
                />

              </div>

              <div className="checkout-field">

                <label>Country</label>

                <input
                  type="text"
                  name="country"
                  value={address.country}
                  onChange={
                    handleAddressChange
                  }
                  placeholder="India"
                />

              </div>

              <div className="checkout-field">

                <label>Postal Code</label>

                <input
                  type="text"
                  name="postalCode"
                  value={address.postalCode}
                  onChange={
                    handleAddressChange
                  }
                  placeholder="400001"
                  maxLength="6"
                />

              </div>

            </div>

            <div className="checkout-actions">

              <button
                type="button"
                className="back-checkout"
                onClick={() =>
                  navigate("/cart")
                }
              >
                ← Back to Cart
              </button>

              <button
                type="button"
                className="continue-checkout"
                onClick={
                  handleAddressContinue
                }
              >
                Continue to Payment →
              </button>

            </div>

          </div>
        )}

        {/* ========================= */}
        {/* PAYMENT */}
        {/* ========================= */}

        {currentStep === 2 && (
          <div className="checkout-card">

            <div className="checkout-section-heading">

              <span>STEP 2</span>

              <h2>
                Select{" "}
                <strong>Payment</strong>
              </h2>

              <p>
                Choose your preferred payment
                method.
              </p>

            </div>

            <div className="payment-options">

              {/* COD */}

              <button
                type="button"
                className={`payment-option ${
                  paymentMethod === "COD"
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setPaymentMethod("COD")
                }
              >

                <div className="payment-option-icon">
                  💵
                </div>

                <div className="payment-option-content">

                  <h3>
                    Cash on Delivery
                  </h3>

                  <p>
                    Pay when your order
                    arrives.
                  </p>

                </div>

                <div className="payment-radio">
                  {paymentMethod ===
                    "COD" && "✓"}
                </div>

              </button>

              {/* UPI */}

              <button
                type="button"
                className={`payment-option ${
                  paymentMethod === "UPI"
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setPaymentMethod("UPI")
                }
              >

                <div className="payment-option-icon">
                  📱
                </div>

                <div className="payment-option-content">

                  <h3>UPI</h3>

                  <p>
                    Pay securely using
                    UPI through Razorpay.
                  </p>

                </div>

                <div className="payment-radio">
                  {paymentMethod ===
                    "UPI" && "✓"}
                </div>

              </button>

              {/* CARD */}

              <button
                type="button"
                className={`payment-option ${
                  paymentMethod === "CARD"
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setPaymentMethod("CARD")
                }
              >

                <div className="payment-option-icon">
                  💳
                </div>

                <div className="payment-option-content">

                  <h3>
                    Credit / Debit Card
                  </h3>

                  <p>
                    Secure card payment
                    through Razorpay.
                  </p>

                </div>

                <div className="payment-radio">
                  {paymentMethod ===
                    "CARD" && "✓"}
                </div>

              </button>

            </div>

            <div className="checkout-payment-summary">

              <span>
                AMOUNT TO PAY
              </span>

              <strong>
                ₹
                {totalAmount.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

            <div className="checkout-actions">

              <button
                type="button"
                className="back-checkout"
                onClick={() =>
                  setCurrentStep(1)
                }
              >
                ← Back to Address
              </button>

              <button
                type="button"
                className="continue-checkout"
                onClick={
                  handlePaymentContinue
                }
              >
                Review Order →
              </button>

            </div>

          </div>
        )}

        {/* ========================= */}
        {/* REVIEW */}
        {/* ========================= */}

        {currentStep === 3 && (
          <div className="checkout-review">

            <div className="checkout-card">

              <div className="checkout-section-heading">

                <span>STEP 3</span>

                <h2>
                  Review Your{" "}
                  <strong>Order</strong>
                </h2>

                <p>
                  Check your details before
                  placing the order.
                </p>

              </div>

              {/* ADDRESS */}

              <div className="review-box">

                <div className="review-box-heading">

                  <h3>
                    Shipping Address
                  </h3>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentStep(1)
                    }
                  >
                    Edit
                  </button>

                </div>

                <p>
                  <strong>
                    {address.fullName}
                  </strong>
                </p>

                <p>{address.phone}</p>

                <p>
                  {address.street},{" "}
                  {address.city},{" "}
                  {address.state}
                </p>

                <p>
                  {address.country} -{" "}
                  {address.postalCode}
                </p>

              </div>

              {/* PAYMENT */}

              <div className="review-box">

                <div className="review-box-heading">

                  <h3>
                    Payment Method
                  </h3>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentStep(2)
                    }
                  >
                    Edit
                  </button>

                </div>

                <p>
                  {paymentMethod ===
                    "COD" &&
                    "💵 Cash on Delivery"}

                  {paymentMethod ===
                    "UPI" &&
                    "📱 UPI - Razorpay"}

                  {paymentMethod ===
                    "CARD" &&
                    "💳 Card - Razorpay"}
                </p>

              </div>

              {/* PRODUCTS */}

              <div className="review-products">

                <h3>
                  Order Items
                </h3>

                {cartItems.map(
                  (item) => (
                    <div
                      className="review-product"
                      key={item._id}
                    >

                      <img
                        src={item.imageUrl}
                        alt={item.name}
                      />

                      <div>

                        <h4>
                          {item.name}
                        </h4>

                        <p>
                          Qty:{" "}
                          {item.quantity}
                        </p>

                      </div>

                      <strong>
                        ₹
                        {(
                          Number(item.price) *
                          Number(
                            item.quantity
                          )
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                    </div>
                  )
                )}

              </div>

            </div>

            {/* SUMMARY */}

            <aside className="checkout-summary">

              <span>
                ORDER SUMMARY
              </span>

              <h2>
                Payment{" "}
                <strong>Summary</strong>
              </h2>

              <div className="summary-row">

                <span>Subtotal</span>

                <strong>
                  ₹
                  {subtotal.toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>

              <div className="summary-row">

                <span>
                  Shipping Fee
                </span>

                <strong>
                  ₹
                  {shippingFee.toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>

              <div className="summary-row">

                <span>Tax</span>

                <strong>
                  ₹
                  {tax.toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>

              <div className="summary-row">

                <span>Discount</span>

                <strong>
                  - ₹
                  {discount.toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>

              <div className="summary-line"></div>

              <div className="summary-total">

                <span>
                  Total Amount
                </span>

                <strong>
                  ₹
                  {totalAmount.toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>

              <button
                type="button"
                className="continue-checkout"
                onClick={
                  handlePlaceOrder
                }
                disabled={loading}
              >
                {loading
                  ? "Processing..."
                  : paymentMethod === "COD"
                  ? "Place Order →"
                  : "Pay with Razorpay →"}
              </button>

              <p className="secure-checkout-text">
                🔒 Secure payment powered by
                Razorpay
              </p>

            </aside>

          </div>
        )}

      </section>
    </main>
  );
};

export default Checkout;
