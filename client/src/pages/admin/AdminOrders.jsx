
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/admin/adminOrders.css";
import API_URL from '../../config/api.js'

const statusFlow = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

const paymentFlow = {
  pending: ["paid", "failed"],
  paid: ["refunded"],
  failed: [],
  refunded: [],
};

const AdminOrders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);

  const token = localStorage.getItem("token");

  // =========================
  // ADMIN CHECK
  // =========================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      if (user?.role !== "admin") {
        navigate("/");
      }
    } catch (error) {
      console.log("User parsing error:", error);
      navigate("/login");
    }
  }, [navigate, token]);

  // =========================
  // FETCH ORDERS
  // =========================

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/orders`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
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
      console.log("Fetch orders error:", error);

      setError(
        error.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  // =========================
  // ORDER STATUS UPDATE
  // =========================

  const handleOrderStatusChange = async (
    order,
    newStatus
  ) => {
    if (!newStatus || newStatus === order.status) {
      return;
    }

    let cancellationReason = "";

    if (newStatus === "cancelled") {
      cancellationReason = window.prompt(
        "Enter cancellation reason:"
      );

      if (cancellationReason === null) {
        return;
      }
    }

    try {
      setUpdatingOrderId(order._id);
      setError("");

      const response = await fetch(
        `${API_URL}/api/orders/${order._id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
            cancellationReason,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update order status"
        );
      }

      setOrders((previousOrders) =>
        previousOrders.map((item) =>
          item._id === order._id
            ? data.order
            : item
        )
      );

      if (selectedOrder?._id === order._id) {
        setSelectedOrder(data.order);
      }
    } catch (error) {
      console.log(
        "Update order status error:",
        error
      );

      setError(
        error.message ||
          "Failed to update order status"
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // =========================
  // PAYMENT STATUS UPDATE
  // =========================

  const handlePaymentStatusChange = async (
    order,
    newPaymentStatus
  ) => {
    if (
      !newPaymentStatus ||
      newPaymentStatus === order.paymentStatus
    ) {
      return;
    }

    try {
      setUpdatingPaymentId(order._id);
      setError("");

      const response = await fetch(
        `${API_URL}/api/orders/${order._id}/payment`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            paymentStatus: newPaymentStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update payment status"
        );
      }

      setOrders((previousOrders) =>
        previousOrders.map((item) =>
          item._id === order._id
            ? data.order
            : item
        )
      );

      if (selectedOrder?._id === order._id) {
        setSelectedOrder(data.order);
      }
    } catch (error) {
      console.log(
        "Update payment status error:",
        error
      );

      setError(
        error.message ||
          "Failed to update payment status"
      );
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  // =========================
  // HELPERS
  // =========================

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
      .charAt(0)
      .toUpperCase() + status.slice(1);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getCustomerName = (order) => {
    return (
      order.user?.name ||
      order.address?.fullName ||
      "Unknown Customer"
    );
  };

  const getItemCount = (order) => {
    return (
      order.items?.reduce(
        (total, item) =>
          total + (Number(item.quantity) || 0),
        0
      ) || 0
    );
  };

  const getOrderTimeline = (order) => {
  return [
    {
      title: "Order Placed",
      date: order.createdAt,
      completed: Boolean(order.createdAt),
    },
    {
      title: "Order Confirmed",
      date: order.confirmedAt,
      completed: Boolean(order.confirmedAt),
    },
    {
      title: "Processing",
      date:
        order.confirmedAt &&
        ["processing", "shipped", "delivered", "returned"].includes(
          order.status
        )
          ? order.confirmedAt
          : null,
      completed: [
        "processing",
        "shipped",
        "delivered",
        "returned",
      ].includes(order.status),
    },
    {
      title: "Shipped",
      date: order.shippedAt,
      completed: Boolean(order.shippedAt),
    },
    {
      title: "Delivered",
      date: order.deliveredAt,
      completed: Boolean(order.deliveredAt),
    },
  ];
};

  // =========================
  // SUMMARY COUNTS
  // =========================

  const summary = useMemo(() => {
    return {
      total: orders.length,

      pending: orders.filter(
        (order) => order.status === "pending"
      ).length,

      processing: orders.filter(
        (order) => order.status === "processing"
      ).length,

      shipped: orders.filter(
        (order) => order.status === "shipped"
      ).length,

      delivered: orders.filter(
        (order) => order.status === "delivered"
      ).length,

      cancelled: orders.filter(
        (order) => order.status === "cancelled"
      ).length,
    };
  }, [orders]);

  // =========================
  // SEARCH + FILTER
  // =========================

  const filteredOrders = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return orders.filter((order) => {
      const orderNumber =
        order.orderNumber?.toLowerCase() || "";

      const customerName =
        order.user?.name?.toLowerCase() ||
        order.address?.fullName?.toLowerCase() ||
        "";

      const customerEmail =
        order.user?.email?.toLowerCase() || "";

      const paymentId =
        order.paymentId?.toLowerCase() || "";

      const matchesSearch =
        !searchValue ||
        orderNumber.includes(searchValue) ||
        customerName.includes(searchValue) ||
        customerEmail.includes(searchValue) ||
        paymentId.includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        order.status === statusFilter;

      const matchesPayment =
        paymentFilter === "all" ||
        order.paymentStatus === paymentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment
      );
    });
  }, [
    orders,
    search,
    statusFilter,
    paymentFilter,
  ]);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="admin-orders-page">
        <div className="admin-orders-loading">
          <div className="orders-loader"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-orders-page">

      {/* ================= HEADER ================= */}

      <div className="admin-orders-header">

        <div>
          <button
            className="admin-orders-back"
            onClick={() => navigate("/admin")}
          >
            ← Dashboard
          </button>

          <h1>Manage Orders</h1>

          <p>
            View and manage all customer orders.
          </p>
        </div>

        <div className="admin-orders-header-actions">

          <button
            className="admin-orders-refresh"
            onClick={fetchOrders}
            disabled={loading}
          >
            ↻ Refresh
          </button>

          <div className="admin-orders-count">
            <span>{orders.length}</span>
            <small>Total Orders</small>
          </div>

        </div>

      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div className="admin-orders-error">
          <span>{error}</span>

          <button
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      {/* ================= SUMMARY ================= */}

      <div className="orders-summary-grid">

        <div className="order-summary-card total">
          <span className="summary-card-icon">
            📦
          </span>

          <div>
            <small>Total Orders</small>
            <strong>{summary.total}</strong>
          </div>
        </div>

        <div className="order-summary-card pending">
          <span className="summary-card-icon">
            ⏳
          </span>

          <div>
            <small>Pending</small>
            <strong>{summary.pending}</strong>
          </div>
        </div>

        <div className="order-summary-card processing">
          <span className="summary-card-icon">
            ⚙️
          </span>

          <div>
            <small>Processing</small>
            <strong>{summary.processing}</strong>
          </div>
        </div>

        <div className="order-summary-card shipped">
          <span className="summary-card-icon">
            🚚
          </span>

          <div>
            <small>Shipped</small>
            <strong>{summary.shipped}</strong>
          </div>
        </div>

        <div className="order-summary-card delivered">
          <span className="summary-card-icon">
            ✓
          </span>

          <div>
            <small>Delivered</small>
            <strong>{summary.delivered}</strong>
          </div>
        </div>

        <div className="order-summary-card cancelled">
          <span className="summary-card-icon">
            ✕
          </span>

          <div>
            <small>Cancelled</small>
            <strong>{summary.cancelled}</strong>
          </div>
        </div>

      </div>

      {/* ================= SEARCH + FILTER ================= */}

      <div className="orders-filter-section">

        <div className="orders-search-box">

          <span>🔍</span>

          <input
            type="text"
            placeholder="Search by order number, customer, email or payment ID..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {search && (
            <button
              onClick={() => setSearch("")}
            >
              ×
            </button>
          )}

        </div>

        <div className="orders-filter-controls">

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="all">
              All Order Status
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="confirmed">
              Confirmed
            </option>

            <option value="processing">
              Processing
            </option>

            <option value="shipped">
              Shipped
            </option>

            <option value="delivered">
              Delivered
            </option>

            <option value="cancelled">
              Cancelled
            </option>

            <option value="returned">
              Returned
            </option>
          </select>

          <select
            value={paymentFilter}
            onChange={(event) =>
              setPaymentFilter(event.target.value)
            }
          >
            <option value="all">
              All Payment Status
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="paid">
              Paid
            </option>

            <option value="failed">
              Failed
            </option>

            <option value="refunded">
              Refunded
            </option>
          </select>

          {(search ||
            statusFilter !== "all" ||
            paymentFilter !== "all") && (
            <button
              className="clear-filters-button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setPaymentFilter("all");
              }}
            >
              Clear Filters
            </button>
          )}

        </div>

      </div>

      {/* ================= RESULTS INFO ================= */}

      <div className="orders-results-info">
        <span>
          Showing{" "}
          <strong>{filteredOrders.length}</strong>{" "}
          of <strong>{orders.length}</strong> orders
        </span>
      </div>

      {/* ================= ORDERS ================= */}

      {filteredOrders.length === 0 ? (
        <div className="admin-orders-empty">

          <div className="empty-icon">
            🔍
          </div>

          <h2>No Orders Found</h2>

          <p>
            No orders match your current search or
            filters.
          </p>

          {(search ||
            statusFilter !== "all" ||
            paymentFilter !== "all") && (
            <button
              className="empty-clear-button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setPaymentFilter("all");
              }}
            >
              Clear Filters
            </button>
          )}

        </div>
      ) : (
        <div className="admin-orders-table-container">

          <table className="admin-orders-table">

            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Order Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {filteredOrders.map((order) => {

                const nextStatuses =
                  statusFlow[order.status] || [];

                const nextPaymentStatuses =
                  paymentFlow[
                    order.paymentStatus
                  ] || [];

                return (
                  <tr key={order._id}>

                    {/* ORDER */}

                    <td>

                      <div className="order-number">
                        #
                        {order.orderNumber ||
                          order._id.slice(-8)}
                      </div>

                      <button
                        className="view-order-button"
                        onClick={() =>
                          setSelectedOrder(order)
                        }
                      >
                        View Details
                      </button>

                    </td>

                    {/* CUSTOMER */}

                    <td>

                      <div className="customer-info">

                        <strong>
                          {getCustomerName(order)}
                        </strong>

                        <span>
                          {order.user?.email ||
                            "No email"}
                        </span>

                      </div>

                    </td>

                    {/* DATE */}

                    <td>

                      <div className="order-date">

                        <span>
                          {formatDate(
                            order.createdAt
                          )}
                        </span>

                        <small>
                          {formatTime(
                            order.createdAt
                          )}
                        </small>

                      </div>

                    </td>

                    {/* ITEMS */}

                    <td>

                      <span className="item-count">
                        {getItemCount(order)}
                      </span>

                    </td>

                    {/* TOTAL */}

                    <td>

                      <strong className="order-total">
                        ₹
                        {Number(
                          order.totalAmount || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                    </td>

                    {/* PAYMENT */}

                    <td>

                      <div className="payment-column">

                        <span
                          className={`payment-badge payment-${order.paymentStatus}`}
                        >
                          {formatStatus(
                            order.paymentStatus
                          )}
                        </span>

                        {nextPaymentStatuses.length >
                          0 && (
                          <select
                            value=""
                            disabled={
                              updatingPaymentId ===
                              order._id
                            }
                            onChange={(event) =>
                              handlePaymentStatusChange(
                                order,
                                event.target.value
                              )
                            }
                          >
                            <option value="">
                              Update
                            </option>

                            {nextPaymentStatuses.map(
                              (status) => (
                                <option
                                  key={status}
                                  value={status}
                                >
                                  {formatStatus(
                                    status
                                  )}
                                </option>
                              )
                            )}

                          </select>
                        )}

                      </div>

                    </td>

                    {/* ORDER STATUS */}

                    <td>

                      <div className="status-column">

                        <span
                          className={`order-status-badge status-${order.status}`}
                        >
                          {formatStatus(
                            order.status
                          )}
                        </span>

                        {nextStatuses.length > 0 && (
                          <select
                            value=""
                            disabled={
                              updatingOrderId ===
                              order._id
                            }
                            onChange={(event) =>
                              handleOrderStatusChange(
                                order,
                                event.target.value
                              )
                            }
                          >

                            <option value="">
                              Update
                            </option>

                            {nextStatuses.map(
                              (status) => (
                                <option
                                  key={status}
                                  value={status}
                                >
                                  {formatStatus(
                                    status
                                  )}
                                </option>
                              )
                            )}

                          </select>
                        )}

                      </div>

                    </td>

                    {/* ACTION */}

                    <td>

                      <button
                        className="admin-view-button"
                        onClick={() =>
                          setSelectedOrder(order)
                        }
                      >
                        View
                      </button>

                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>
      )}

      {/* ================= ORDER DETAILS ================= */}

      {selectedOrder && (
        <div
          className="order-details-overlay"
          onClick={() =>
            setSelectedOrder(null)
          }
        >

          <div
            className="order-details-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="order-details-header">

              <div>

                <h2>Order Details</h2>

                <p>
                  #
                  {selectedOrder.orderNumber ||
                    selectedOrder._id.slice(-8)}
                </p>

              </div>

              <button
                className="order-details-close"
                onClick={() =>
                  setSelectedOrder(null)
                }
              >
                ×
              </button>

            </div>

            {/* Customer */}

            <div className="details-section">

              <h3>
                Customer Information
              </h3>

              <div className="details-grid">

                <div>
                  <span>Name</span>

                  <strong>
                    {getCustomerName(
                      selectedOrder
                    )}
                  </strong>
                </div>

                <div>
                  <span>Email</span>

                  <strong>
                    {selectedOrder.user?.email ||
                      "N/A"}
                  </strong>
                </div>

                <div>
                  <span>Phone</span>

                  <strong>
                    {selectedOrder.address?.phone ||
                      "N/A"}
                  </strong>
                </div>

              </div>

            </div>

            {/* Address */}

            <div className="details-section">

              <h3>
                Shipping Address
              </h3>

              <p className="shipping-address">

                {selectedOrder.address?.fullName}

                <br />

                {selectedOrder.address?.street}

                <br />

                {selectedOrder.address?.city},{" "}
                {selectedOrder.address?.state}

                <br />

                {selectedOrder.address?.country} -{" "}
                {selectedOrder.address?.postalCode}

              </p>

            </div>

            {/* Products */}

            <div className="details-section">

              <h3>
                Order Items
              </h3>

              <div className="order-items-list">

                {selectedOrder.items?.map(
                  (item, index) => (

                    <div
                      className="order-detail-item"
                      key={
                        item.product?._id ||
                        index
                      }
                    >

                      <div className="order-detail-image">

                        {item.product?.imageUrl ? (
                          <img
                            src={
                              item.product.imageUrl
                            }
                            alt={
                              item.name ||
                              item.product?.name
                            }
                          />
                        ) : (
                          <span>📦</span>
                        )}

                      </div>

                      <div className="order-detail-product">

                        <strong>
                          {item.name ||
                            item.product?.name ||
                            "Product"}
                        </strong>

                        <span>
                          ₹
                          {Number(
                            item.price || 0
                          ).toLocaleString(
                            "en-IN"
                          )}{" "}
                          × {item.quantity}
                        </span>

                      </div>

                      <strong>
                        ₹
                        {Number(
                          item.subtotal || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                    </div>

                  )
                )}

              </div>

            </div>

            {/* Summary */}

            <div className="details-summary">

              <div>
                <span>Subtotal</span>

                <strong>
                  ₹
                  {Number(
                    selectedOrder.subtotal || 0
                  ).toLocaleString("en-IN")}
                </strong>
              </div>

              <div>
                <span>Shipping</span>

                <strong>
                  ₹
                  {Number(
                    selectedOrder.shippingFee || 0
                  ).toLocaleString("en-IN")}
                </strong>
              </div>

              <div>
                <span>Tax</span>

                <strong>
                  ₹
                  {Number(
                    selectedOrder.tax || 0
                  ).toLocaleString("en-IN")}
                </strong>
              </div>

              <div>
                <span>Discount</span>

                <strong>
                  - ₹
                  {Number(
                    selectedOrder.discount || 0
                  ).toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="final-total">

                <span>
                  Final Amount
                </span>

                <strong>
                  ₹
                  {Number(
                    selectedOrder.totalAmount || 0
                  ).toLocaleString("en-IN")}
                </strong>

              </div>

            </div>

            {/* Order Timeline */}

          <div className="details-section">

            <h3>Order Timeline</h3>

            <div className="order-timeline">

              {getOrderTimeline(selectedOrder).map(
                (event, index) => (
                  <div
                    className={`timeline-item ${
                      event.completed
                        ? "timeline-completed"
                        : ""
                    }`}
                    key={event.title}
                  >

                    <div className="timeline-marker">
                      {event.completed ? "✓" : ""}
                    </div>

                    <div className="timeline-content">

                      <strong>
                        {event.title}
                      </strong>

                      {event.date ? (
                        <span>
                          {formatDate(event.date)}{" "}
                          {formatTime(event.date)}
                        </span>
                      ) : (
                        <span className="timeline-pending">
                          Waiting...
                        </span>
                      )}

                    </div>

                  </div>
                )
              )}

            </div>

          </div>


          {/* Cancellation Information */}

          {selectedOrder.status === "cancelled" && (
            <div className="details-section cancellation-section">

              <h3>Cancellation Information</h3>

              <div className="cancellation-box">

                <div>
                  <span>Cancellation Reason</span>

                  <strong>
                    {selectedOrder.cancellationReason ||
                      "No reason provided"}
                  </strong>
                </div>

                <div>
                  <span>Cancelled At</span>

                  <strong>
                    {selectedOrder.cancelledAt
                      ? `${formatDate(
                          selectedOrder.cancelledAt
                        )} ${formatTime(
                          selectedOrder.cancelledAt
                        )}`
                      : "N/A"}
                  </strong>
                </div>

              </div>

            </div>
          )}

          {/* Quick Status Actions */}

            <div className="details-section">

              <h3>Quick Actions</h3>

              <div className="quick-actions">

                {statusFlow[selectedOrder.status]?.map(
                  (nextStatus) => (
                    <button
                      key={nextStatus}
                      className={`quick-action-button ${
                        nextStatus === "cancelled"
                          ? "quick-cancel-button"
                          : ""
                      }`}
                      disabled={
                        updatingOrderId ===
                        selectedOrder._id
                      }
                      onClick={() =>
                        handleOrderStatusChange(
                          selectedOrder,
                          nextStatus
                        )
                      }
                    >
                      {nextStatus === "confirmed" &&
                        "✓ Confirm Order"}

                      {nextStatus === "processing" &&
                        "⚙ Mark Processing"}

                      {nextStatus === "shipped" &&
                        "🚚 Mark as Shipped"}

                      {nextStatus === "delivered" &&
                        "✓ Mark as Delivered"}

                      {nextStatus === "returned" &&
                        "↩ Mark as Returned"}

                      {nextStatus === "cancelled" &&
                        "✕ Cancel Order"}
                    </button>
                  )
                )}

              </div>

            </div>

            {/* Payment Quick Actions */}

            <div className="details-section">

              <h3>Payment Actions</h3>

              <div className="quick-actions">

                {paymentFlow[
                  selectedOrder.paymentStatus
                ]?.map((nextPaymentStatus) => (
                  <button
                    key={nextPaymentStatus}
                    className="quick-action-button payment-action-button"
                    disabled={
                      updatingPaymentId ===
                      selectedOrder._id
                    }
                    onClick={() =>
                      handlePaymentStatusChange(
                        selectedOrder,
                        nextPaymentStatus
                      )
                    }
                  >
                    {nextPaymentStatus === "paid" &&
                      "✓ Mark Payment Paid"}

                    {nextPaymentStatus === "failed" &&
                      "✕ Mark Payment Failed"}

                    {nextPaymentStatus === "refunded" &&
                      "↩ Refund Payment"}
                  </button>
                ))}

              </div>

            </div>

            {/* Payment */}

            <div className="details-payment-info">

              <div>
                <span>
                  Payment Method
                </span>

                <strong>
                  {selectedOrder.paymentMethod ||
                    "N/A"}
                </strong>
              </div>

              <div>
                <span>
                  Payment Status
                </span>

                <strong>
                  {formatStatus(
                    selectedOrder.paymentStatus
                  )}
                </strong>
              </div>

              {selectedOrder.paymentId && (
                <div>
                  <span>
                    Payment ID
                  </span>

                  <strong>
                    {selectedOrder.paymentId}
                  </strong>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default AdminOrders;