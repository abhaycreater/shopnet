import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import "../../style/orders/orders.css";
import API_URL from '../../config/api.js'

const Orders = () => {
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState("All");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // FETCH MY ORDERS
  // =========================
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/orders/myOrders`,
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
            data.message || "Failed to fetch orders"
          );
        }

        setOrders(data.orders || []);
      } catch (error) {
        console.error("Fetch orders error:", error);

        setError(
          error.message ||
            "Unable to fetch your orders"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  // =========================
  // FILTERS
  // =========================
  const filters = [
  "All",
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

  const filteredOrders = useMemo(() => {
    if (activeFilter === "All") {
      return orders;
    }

    return orders.filter(
      (order) =>
        order.status?.toLowerCase() ===
        activeFilter.toLowerCase()
    );
  }, [activeFilter, orders]);

  // =========================
  // GET ITEM QUANTITY
  // =========================
  const getItemQuantity = (item) => {
    return Number(item.quantity) || 0;
  };

  // =========================
  // GET SAVED ITEM PRICE
  // =========================
  const getItemPrice = (item) => {
    return Number(item.price) || 0;
  };

  // =========================
  // GET SAVED ITEM SUBTOTAL
  // =========================
  const getItemSubtotal = (item) => {
    return Number(item.subtotal) || 0;
  };

  // =========================
  // TOTAL QUANTITY
  // =========================
  const getItemCount = (order) => {
    if (
      !order.items ||
      !Array.isArray(order.items)
    ) {
      return 0;
    }

    return order.items.reduce(
      (total, item) => {
        return (
          total + getItemQuantity(item)
        );
      },
      0
    );
  };

  // =========================
  // FINAL ORDER AMOUNT
  // =========================
  const getFinalAmount = (order) => {
    return Number(order.totalAmount) || 0;
  };

  // =========================
  // PAYMENT STATUS
  // =========================
  const getPaymentStatus = (order) => {
    if (order.paymentStatus) {
      return order.paymentStatus;
    }

    if (order.paymentId) {
      return "Paid";
    }

    return "Pending";
  };

  // =========================
  // PAYMENT CLASS
  // =========================
  const getPaymentClass = (order) => {
    const status = getPaymentStatus(order);

    return status
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  // =========================
  // STATUS CLASS
  // =========================
  const getStatusClass = (status) => {
    return status?.toLowerCase() || "pending";
  };

  // =========================
  // FORMAT DATE
  // =========================
  const formatDate = (date) => {
    if (!date) {
      return "Date unavailable";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================
  // FORMAT TIME
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
  // ORDER PROGRESS
  // =========================
  const getProgress = (status) => {
    const normalized =
      status?.toLowerCase();

    if (normalized === "delivered") {
      return 100;
    }

    if (normalized === "shipped") {
      return 66;
    }

    if (normalized === "cancelled") {
      return 0;
    }

    return 33;
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <main className="orders-page">
        <section className="orders-heading">
          <span className="orders-label">
            SHOPNET
          </span>

          <h1>
            My <span>Orders</span>
          </h1>

          <p>
            Track and manage all your ShopNet
            orders in one place.
          </p>
        </section>

        <section className="orders-container">
          <div className="orders-loading">
            <div className="loading-spinner"></div>

            <h2>
              Loading your orders
            </h2>

            <p>
              Please wait while we fetch your
              order history.
            </p>
          </div>
        </section>
      </main>
    );
  }

  // =========================
  // ERROR
  // =========================
  if (error) {
    return (
      <main className="orders-page">
        <section className="orders-heading">
          <span className="orders-label">
            SHOPNET
          </span>

          <h1>
            My <span>Orders</span>
          </h1>

          <p>
            Track and manage all your ShopNet
            orders in one place.
          </p>
        </section>

        <section className="orders-container">
          <div className="orders-empty">
            <div className="orders-empty-icon">
              ⚠️
            </div>

            <h2>
              Unable to Load Orders
            </h2>

            <p>{error}</p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
            >
              Try Again
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="orders-page">

      {/* =========================
          PAGE HEADER
      ========================= */}
      <section className="orders-heading">
        <span className="orders-label">
          SHOPNET
        </span>

        <h1>
          My <span>Orders</span>
        </h1>

        <p>
          Track, manage and view all your
          ShopNet orders.
        </p>
      </section>

      {/* =========================
          MAIN CONTAINER
      ========================= */}
      <section className="orders-container">

        {/* =========================
            FILTER BAR
        ========================= */}
        <div className="orders-toolbar">

          <div className="orders-filter-title">
            <span>Order History</span>

            <small>
              {orders.length}{" "}
              {orders.length === 1
                ? "order"
                : "orders"}
            </small>
          </div>

          <div className="orders-filters">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={
                  activeFilter === filter
                    ? "order-filter active"
                    : "order-filter"
                }
                onClick={() =>
                  setActiveFilter(filter)
                }
              >
                {filter}
              </button>
            ))}
          </div>

        </div>

        {/* =========================
            ORDERS
        ========================= */}
        {filteredOrders.length > 0 ? (
          <div className="orders-list">

            {filteredOrders.map((order) => {

              const itemCount =
                getItemCount(order);

              const finalAmount =
                getFinalAmount(order);

              const progress =
                getProgress(order.status);

              const paymentStatus =
                getPaymentStatus(order);

              return (
                <article
                  className="order-card"
                  key={order._id}
                >

                  {/* =====================
                      CARD TOP
                  ===================== */}
                  <div className="order-card-top">

                    <div className="order-main-info">

                      <div className="order-icon">
                        📦
                      </div>

                      <div>
                        <span className="order-number-label">
                          ORDER ID
                        </span>

                        <h2>
                          #
                          {order.orderNumber ||
                            (order._id
                              ? order._id.slice(-8)
                              : "N/A")}
                        </h2>
                      </div>

                    </div>

                    <span
                      className={`order-status ${getStatusClass(
                        order.status
                      )}`}
                    >
                      <span className="status-dot"></span>

                      {order.status ||
                        "Pending"}
                    </span>

                  </div>

                  {/* =====================
                      ORDER META
                  ===================== */}
                  <div className="order-meta">

                    <div className="order-meta-item">
                      <span className="meta-icon">
                        📅
                      </span>

                      <div>
                        <small>
                          Ordered On
                        </small>

                        <strong>
                          {formatDate(
                            order.createdAt
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className="order-meta-item">
                      <span className="meta-icon">
                        🕐
                      </span>

                      <div>
                        <small>
                          Time
                        </small>

                        <strong>
                          {formatTime(
                            order.createdAt
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className="order-meta-item">
                      <span className="meta-icon">
                        🛍️
                      </span>

                      <div>
                        <small>
                          Quantity
                        </small>

                        <strong>
                          {itemCount}{" "}
                          {itemCount === 1
                            ? "Item"
                            : "Items"}
                        </strong>
                      </div>
                    </div>

                    <div className="order-meta-item">
                      <span className="meta-icon">
                        💳
                      </span>

                      <div>
                        <small>
                          Payment
                        </small>

                        <strong
                          className={`payment-${getPaymentClass(
                            order
                          )}`}
                        >
                          {paymentStatus}
                        </strong>
                      </div>
                    </div>

                  </div>

                  {/* =====================
                      PRODUCTS
                  ===================== */}
                  <div className="order-products">

                    <div className="products-heading">
                      <span>
                        ORDER ITEMS
                      </span>

                      <span>
                        {itemCount}{" "}
                        {itemCount === 1
                          ? "item"
                          : "items"}
                      </span>
                    </div>

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
                            className="order-product"
                            key={`${order._id}-${index}`}
                          >

                            {/* IMAGE */}
                            <div className="order-product-image">

                              {item.product
                                ?.imageUrl ? (
                                <img
                                  src={
                                    item.product
                                      .imageUrl
                                  }
                                  alt={
                                    item.name ||
                                    item.product
                                      ?.name ||
                                    "Product"
                                  }
                                />
                              ) : (
                                <span>
                                  📦
                                </span>
                              )}

                            </div>

                            {/* PRODUCT INFO */}
                            <div className="order-product-info">

                              <h3>
                                {item.name ||
                                  item.product
                                    ?.name ||
                                  "Product"}
                              </h3>

                              <div className="product-meta">

                                <span>
                                  Qty:{" "}
                                  <strong>
                                    {quantity}
                                  </strong>
                                </span>

                                <span>
                                  ₹
                                  {price.toLocaleString(
                                    "en-IN"
                                  )}{" "}
                                  each
                                </span>

                              </div>

                            </div>

                            {/* ITEM TOTAL */}
                            <div className="product-total-box">

                              <small>
                                Item Total
                              </small>

                              <strong className="product-total">
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

                  {/* =====================
                      TRACKING
                  ===================== */}
                  {order.status?.toLowerCase() !==
                    "cancelled" && (
                    <div className="order-tracking">

                      <div className="tracking-header">
                        <span>
                          Order Progress
                        </span>

                        <strong>
                          {order.status ||
                            "Pending"}
                        </strong>
                      </div>

                      <div className="tracking-bar">

                        <div
                          className="tracking-progress"
                          style={{
                            width: `${progress}%`,
                          }}
                        ></div>

                      </div>

                      <div className="tracking-steps">

                        <span
                          className={
                            progress >= 33
                              ? "completed"
                              : ""
                          }
                        >
                          Order Placed
                        </span>

                        <span
                          className={
                            progress >= 66
                              ? "completed"
                              : ""
                          }
                        >
                          Shipped
                        </span>

                        <span
                          className={
                            progress >= 100
                              ? "completed"
                              : ""
                          }
                        >
                          Delivered
                        </span>

                      </div>

                    </div>
                  )}

                  {/* =====================
                      FOOTER
                  ===================== */}
                  <div className="order-card-footer">

                    <div className="order-total">

                      <div>
                        <span>
                          Final Amount
                        </span>

                        <strong>
                          ₹
                          {finalAmount.toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </div>

                    </div>

                    <button
                      type="button"
                      className="order-details-btn"
                      onClick={() =>
                        navigate(
                          `/orders/${order._id}`
                        )
                      }
                    >
                      View Order Details

                      <span>
                        →
                      </span>
                    </button>

                  </div>

                </article>
              );
            })}

          </div>
        ) : (
          <div className="orders-empty">

            <div className="orders-empty-icon">
              📦
            </div>

            <h2>
              No{" "}
              {activeFilter !== "All"
                ? activeFilter.toLowerCase()
                : ""}{" "}
              orders
            </h2>

            <p>
              You don't have any orders in
              this category yet.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/products")
              }
            >
              Start Shopping
            </button>

          </div>
        )}

      </section>

    </main>
  );
};

export default Orders;