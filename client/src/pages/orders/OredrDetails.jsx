import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../style/orders/orderDetails.css";
import API_URL from '../../config/api.js'

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // FETCH ORDER
  // =========================
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/orders/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch order"
          );
        }

        setOrder(data.order);
      } catch (error) {
        console.error(
          "Fetch order details error:",
          error
        );

        setError(
          error.message ||
            "Unable to fetch order details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id, navigate]);

  // =========================
  // ITEM QUANTITY
  // =========================
  const getItemQuantity = (item) => {
    return Number(item.quantity) || 0;
  };

  // =========================
  // ITEM PRICE
  // =========================
  const getItemPrice = (item) => {
    return Number(item.price) || 0;
  };

  // =========================
  // ITEM SUBTOTAL
  // Use saved order value
  // =========================
  const getItemSubtotal = (item) => {
    return Number(item.subtotal) || 0;
  };

  // =========================
  // TOTAL QUANTITY
  // =========================
  const getTotalQuantity = () => {
    if (!order?.items || !Array.isArray(order.items)) {
      return 0;
    }

    return order.items.reduce(
      (total, item) => {
        return total + getItemQuantity(item);
      },
      0
    );
  };

  // =========================
  // DATE
  // =========================
  const formatDate = (date) => {
    if (!date) {
      return "Date unavailable";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  // =========================
  // TIME
  // =========================
  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =========================
  // PAYMENT STATUS
  // =========================
  const getPaymentStatus = () => {
    if (order?.paymentStatus) {
      return order.paymentStatus;
    }

    if (order?.paymentId) {
      return "Paid";
    }

    return "Pending";
  };

  // =========================
  // STATUS
  // =========================
  const getStatus = () => {
    return order?.status || "Pending";
  };

  // =========================
  // STATUS CLASS
  // =========================
  const getStatusClass = () => {
    return getStatus()
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  // =========================
  // STATUS PROGRESS
  // =========================
  const getProgress = () => {
    const status = getStatus().toLowerCase();

    if (status === "delivered") {
      return 3;
    }

    if (status === "shipped") {
      return 2;
    }

    if (status === "cancelled") {
      return 0;
    }

    return 1;
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <main className="order-details-page">

        <div className="order-details-loading">

          <div className="loading-spinner"></div>

          <h2>
            Loading Order Details
          </h2>

          <p>
            Please wait while we fetch your
            order information.
          </p>

        </div>

      </main>
    );
  }

  // =========================
  // ERROR
  // =========================
  if (error || !order) {
    return (
      <main className="order-details-page">

        <div className="order-details-error">

          <div className="order-error-icon">
            ⚠️
          </div>

          <h2>
            Unable to Load Order
          </h2>

          <p>
            {error || "Order not found"}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/orders")
            }
          >
            Back to Orders
          </button>

        </div>

      </main>
    );
  }

  const progress = getProgress();
  const totalQuantity = getTotalQuantity();

  // =========================
  // SAVED ORDER PRICE VALUES
  // =========================
  const subtotal = Number(order.subtotal) || 0;
  const shippingFee = Number(order.shippingFee) || 0;
  const tax = Number(order.tax) || 0;
  const discount = Number(order.discount) || 0;
  const totalAmount = Number(order.totalAmount) || 0;

  return (
    <main className="order-details-page">

      {/* =========================
          TOP NAVIGATION
      ========================= */}
      <div className="order-details-top">

        <button
          type="button"
          className="back-orders-btn"
          onClick={() =>
            navigate("/orders")
          }
        >
          ← Back to Orders
        </button>

      </div>

      {/* =========================
          ORDER HEADER
      ========================= */}
      <section className="order-details-header">

        <div>

          <span className="details-label">
            SHOPNET
          </span>

          <h1>
            Order Details
          </h1>

          <p>
            Order #
            {order.orderNumber || order._id}
          </p>

        </div>

        <div className="details-status-wrapper">

          <span className="details-status-label">
            ORDER STATUS
          </span>

          <span
            className={`details-status ${getStatusClass()}`}
          >
            <span className="status-dot"></span>

            {getStatus()}
          </span>

        </div>

      </section>

      {/* =========================
          ORDER INFO
      ========================= */}
      <section className="order-info-card">

        <div className="order-info-item">

          <span>
            Ordered On
          </span>

          <strong>
            {formatDate(order.createdAt)}
          </strong>

          <small>
            {formatTime(order.createdAt)}
          </small>

        </div>

        <div className="order-info-item">

          <span>
            Total Items
          </span>

          <strong>
            {totalQuantity}
          </strong>

          <small>
            {totalQuantity === 1
              ? "Item"
              : "Items"}
          </small>

        </div>

        <div className="order-info-item">

          <span>
            Payment
          </span>

          <strong>
            {getPaymentStatus()}
          </strong>

          <small>
            {order.paymentId
              ? "Payment completed"
              : "Payment pending"}
          </small>

        </div>

        <div className="order-info-item">

          <span>
            Final Amount
          </span>

          <strong>
            ₹
            {totalAmount.toLocaleString(
              "en-IN"
            )}
          </strong>

          <small>
            Final amount
          </small>

        </div>

      </section>

      {/* =========================
          ORDER TRACKING
      ========================= */}
      {getStatus().toLowerCase() !==
        "cancelled" && (
        <section className="details-card">

          <div className="details-card-heading">

            <div>

              <span>
                ORDER TRACKING
              </span>

              <h2>
                Track Your Order
              </h2>

            </div>

            <strong>
              {getStatus()}
            </strong>

          </div>

          <div className="details-progress">

            <div className="progress-line">

              <div
                className="progress-line-active"
                style={{
                  width:
                    progress === 1
                      ? "0%"
                      : progress === 2
                      ? "50%"
                      : "100%",
                }}
              ></div>

            </div>

            <div className="progress-step">

              <div
                className={
                  progress >= 1
                    ? "progress-circle completed"
                    : "progress-circle"
                }
              >
                ✓
              </div>

              <span>
                Order Placed
              </span>

            </div>

            <div className="progress-step">

              <div
                className={
                  progress >= 2
                    ? "progress-circle completed"
                    : "progress-circle"
                }
              >
                ✓
              </div>

              <span>
                Shipped
              </span>

            </div>

            <div className="progress-step">

              <div
                className={
                  progress >= 3
                    ? "progress-circle completed"
                    : "progress-circle"
                }
              >
                ✓
              </div>

              <span>
                Delivered
              </span>

            </div>

          </div>

        </section>
      )}

      {/* =========================
          PRODUCTS
      ========================= */}
      <section className="details-card">

        <div className="details-card-heading">

          <div>

            <span>
              ORDER ITEMS
            </span>

            <h2>
              Products in Your Order
            </h2>

          </div>

          <strong>
            {totalQuantity}{" "}
            {totalQuantity === 1
              ? "Item"
              : "Items"}
          </strong>

        </div>

        <div className="details-products">

          {order.items?.map(
            (item, index) => {

              const quantity =
                getItemQuantity(item);

              const price =
                getItemPrice(item);

              const itemSubtotal =
                getItemSubtotal(item);

              return (
                <div
                  className="details-product"
                  key={`${order._id}-${index}`}
                >

                  {/* IMAGE */}
                  <div className="details-product-image">

                    {item.product?.imageUrl ? (
                      <img
                        src={
                          item.product.imageUrl
                        }
                        alt={
                          item.name ||
                          item.product?.name ||
                          "Product"
                        }
                      />
                    ) : (
                      <span>
                        📦
                      </span>
                    )}

                  </div>

                  {/* INFO */}
                  <div className="details-product-info">

                    <h3>
                      {item.name ||
                        item.product?.name ||
                        "Product"}
                    </h3>

                    <p>
                      Unit Price: ₹
                      {price.toLocaleString(
                        "en-IN"
                      )}
                    </p>

                    <span>
                      Quantity:{" "}
                      <strong>
                        {quantity}
                      </strong>
                    </span>

                  </div>

                  {/* TOTAL */}
                  <div className="details-product-total">

                    <small>
                      Item Total
                    </small>

                    <strong>
                      ₹
                      {itemSubtotal.toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>

                </div>
              );
            }
          )}

        </div>

      </section>

      {/* =========================
          TWO COLUMN SECTION
      ========================= */}
      <div className="details-two-column">

        {/* =========================
            DELIVERY ADDRESS
        ========================= */}
        <section className="details-card">

          <div className="details-card-heading">

            <div>

              <span>
                DELIVERY
              </span>

              <h2>
                Delivery Address
              </h2>

            </div>

            <span className="address-icon">
              📍
            </span>

          </div>

          <div className="address-content">

            <h3>
              {order.address?.fullName ||
                order.user?.name ||
                "Customer"}
            </h3>

            <p>
              {order.address?.street ||
                "Address unavailable"}
            </p>

            <p>
              {order.address?.city || ""}

              {order.address?.city &&
              order.address?.state
                ? ", "
                : ""}

              {order.address?.state || ""}
            </p>

            <p>
              {order.address?.country || ""}
            </p>

            <p>
              {order.address?.postalCode
                ? `PIN: ${order.address.postalCode}`
                : ""}
            </p>

            {order.address?.phone && (
              <p>
                Phone: {order.address.phone}
              </p>
            )}

          </div>

        </section>

        {/* =========================
            PAYMENT
        ========================= */}
        <section className="details-card">

          <div className="details-card-heading">

            <div>

              <span>
                PAYMENT
              </span>

              <h2>
                Payment Information
              </h2>

            </div>

            <span className="payment-icon">
              💳
            </span>

          </div>

          <div className="payment-content">

            <div className="payment-row">

              <span>
                Payment Method
              </span>

              <strong>
                {order.paymentMethod ||
                  "COD"}
              </strong>

            </div>

            <div className="payment-row">

              <span>
                Payment Status
              </span>

              <strong
                className={
                  getPaymentStatus()
                    .toLowerCase() ===
                  "paid"
                    ? "payment-success"
                    : "payment-pending"
                }
              >
                {getPaymentStatus()}
              </strong>

            </div>

            <div className="payment-row">

              <span>
                Payment ID
              </span>

              <strong>
                {order.paymentId ||
                  "Not available"}
              </strong>

            </div>

          </div>

        </section>

      </div>

      {/* =========================
          ORDER SUMMARY
      ========================= */}
      <section className="details-summary">

        <div className="summary-header">

          <div>

            <span>
              SUMMARY
            </span>

            <h2>
              Order Summary
            </h2>

          </div>

        </div>

        <div className="summary-body">

          {/* TOTAL ITEMS */}
          <div className="summary-row">

            <span>
              Total Items
            </span>

            <strong>
              {totalQuantity}
            </strong>

          </div>

          {/* PRODUCT SUBTOTAL */}
          <div className="summary-row">

            <span>
              Product Subtotal
            </span>

            <strong>
              ₹
              {subtotal.toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>

          {/* SHIPPING */}
          <div className="summary-row">

            <span>
              Shipping Fee
            </span>

            <strong
              className={
                shippingFee === 0
                  ? "free-delivery"
                  : ""
              }
            >
              {shippingFee === 0
                ? "Free"
                : `₹${shippingFee.toLocaleString(
                    "en-IN"
                  )}`}
            </strong>

          </div>

          {/* TAX */}
          <div className="summary-row">

            <span>
              Tax
            </span>

            <strong>
              ₹
              {tax.toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>

          {/* DISCOUNT */}
          {discount > 0 && (
            <div className="summary-row">

              <span>
                Discount
              </span>

              <strong className="discount-value">
                -₹
                {discount.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>
          )}

          <div className="summary-divider"></div>

          {/* FINAL AMOUNT */}
          <div className="summary-row summary-total">

            <span>
              Final Amount
            </span>

            <strong>
              ₹
              {totalAmount.toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>

        </div>

      </section>

      {/* =========================
          BACK BUTTON
      ========================= */}
      <div className="details-bottom-action">

        <button
          type="button"
          onClick={() =>
            navigate("/orders")
          }
        >
          ← Back to My Orders
        </button>

      </div>

    </main>
  );
};

export default OrderDetails;