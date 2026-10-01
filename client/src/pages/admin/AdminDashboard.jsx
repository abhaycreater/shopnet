import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/admin/adminDashboard.css";
import API_URL from '../../config/api.js'

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);
  const [orderAnalytics, setOrderAnalytics] = useState(null);
  const [salesAnalytics, setSalesAnalytics] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // FETCH ANALYTICS
  // =========================
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token) {
          navigate("/login");
          return;
        }

        let user = null;

        try {
          user = JSON.parse(storedUser);
        } catch {
          user = null;
        }

        // Frontend admin protection
        if (user?.role !== "admin") {
          navigate("/");
          return;
        }

        setLoading(true);
        setError("");

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [
          overviewResponse,
          ordersResponse,
          salesResponse,
          topProductsResponse,
          lowStockResponse,
          monthlySalesResponse,
        ] = await Promise.all([
          fetch(
            `${API_URL}/api/analytics/overview`,
            { headers }
          ),

          fetch(
            `${API_URL}/api/analytics/orders`,
            { headers }
          ),

          fetch(
            `${API_URL}/api/analytics/sales`,
            { headers }
          ),

          fetch(
            `${API_URL}/api/analytics/top-products`,
            { headers }
          ),

          fetch(
            `${API_URL}/api/analytics/low-stock`,
            { headers }
          ),

          fetch(
            `${API_URL}/api/analytics/monthly-sales`,
            { headers }
          ),
        ]);

        const [
          overviewData,
          ordersData,
          salesData,
          topProductsData,
          lowStockData,
          monthlySalesData,
        ] = await Promise.all([
          overviewResponse.json(),
          ordersResponse.json(),
          salesResponse.json(),
          topProductsResponse.json(),
          lowStockResponse.json(),
          monthlySalesResponse.json(),
        ]);

        // =========================
        // CHECK API RESPONSES
        // =========================

        if (!overviewResponse.ok) {
          throw new Error(
            overviewData.message ||
              "Failed to fetch overview"
          );
        }

        if (!ordersResponse.ok) {
          throw new Error(
            ordersData.message ||
              "Failed to fetch order analytics"
          );
        }

        if (!salesResponse.ok) {
          throw new Error(
            salesData.message ||
              "Failed to fetch sales analytics"
          );
        }

        if (!topProductsResponse.ok) {
          throw new Error(
            topProductsData.message ||
              "Failed to fetch top products"
          );
        }

        if (!lowStockResponse.ok) {
          throw new Error(
            lowStockData.message ||
              "Failed to fetch low stock products"
          );
        }

        if (!monthlySalesResponse.ok) {
          throw new Error(
            monthlySalesData.message ||
              "Failed to fetch monthly sales"
          );
        }

        // =========================
        // SET EXACT BACKEND DATA
        // =========================

        setOverview(
          overviewData.overview
        );

        setOrderAnalytics(
          ordersData
        );

        setSalesAnalytics(
          salesData
        );

        setTopProducts(
          topProductsData.products || []
        );

        setLowStockProducts(
          lowStockData.products || []
        );

        setMonthlySales(
          monthlySalesData.sales || []
        );

      } catch (error) {
        console.error(
          "Admin analytics error:",
          error
        );

        setError(
          error.message ||
            "Unable to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [navigate]);

  // =========================
  // FORMAT CURRENCY
  // =========================
  const formatCurrency = (value) => {
    return `₹${(
      Number(value) || 0
    ).toLocaleString("en-IN")}`;
  };

  // =========================
  // FORMAT MONTH
  // =========================
  const formatMonth = (month) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return months[month - 1] || "Unknown";
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <main className="admin-dashboard-page">
        <div className="admin-dashboard-loading">
          <div className="admin-loading-spinner"></div>

          <h2>
            Loading Dashboard
          </h2>

          <p>
            Fetching your store analytics...
          </p>
        </div>
      </main>
    );
  }

  // =========================
  // ERROR
  // =========================
  if (error) {
    return (
      <main className="admin-dashboard-page">
        <div className="admin-dashboard-error">
          <div className="admin-error-icon">
            ⚠️
          </div>

          <h2>
            Unable to Load Dashboard
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
      </main>
    );
  }

  return (
    <main className="admin-dashboard-page">

      {/* =========================
          HEADER
      ========================= */}
      <section className="admin-dashboard-header">

        <div>
          <span className="admin-dashboard-label">
            SHOPNET ADMIN
          </span>

          <h1>
            Admin <span>Dashboard</span>
          </h1>

          <p>
            Monitor your store, orders,
            sales and products.
          </p>
        </div>

        <div className="admin-dashboard-actions">

          <button
            type="button"
            onClick={() =>
              navigate("/admin/orders")
            }
          >
            📦 Manage Orders
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/products")
            }
          >
            🛍️ Products
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/coupons")
            }
          >
            🎟️ Manage Coupons
          </button>

        </div>

      </section>

      {/* =========================
          OVERVIEW CARDS
      ========================= */}
      <section className="admin-overview-grid">

        {/* TOTAL REVENUE */}
        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            💰
          </div>

          <div>
            <span>
              Total Revenue
            </span>

            <strong>
              {formatCurrency(
                overview?.totalRevenue
              )}
            </strong>
          </div>

        </div>

        {/* TOTAL ORDERS */}
        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            📦
          </div>

          <div>
            <span>
              Total Orders
            </span>

            <strong>
              {Number(
                overview?.totalOrder || 0
              )}
            </strong>
          </div>

        </div>

        {/* TOTAL USERS */}
        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            👥
          </div>

          <div>
            <span>
              Total Users
            </span>

            <strong>
              {Number(
                overview?.totalUsers || 0
              )}
            </strong>
          </div>

        </div>

        {/* TOTAL PRODUCTS */}
        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            🛒
          </div>

          <div>
            <span>
              Total Products
            </span>

            <strong>
              {Number(
                overview?.totalProducts || 0
              )}
            </strong>
          </div>

        </div>

      </section>

      {/* =========================
          ORDER ANALYTICS
      ========================= */}
      <section className="admin-dashboard-card">

        <div className="admin-card-header">

          <div>
            <span>
              ORDER ANALYTICS
            </span>

            <h2>
              Order Overview
            </h2>
          </div>

          <span className="admin-card-icon">
            📊
          </span>

        </div>

        {/* ORDER PERIOD STATISTICS */}
        <div className="admin-order-grid">

          <div>
            <span>
              Total Orders
            </span>

            <strong>
              {Number(
                orderAnalytics
                  ?.statistics
                  ?.totalOrders || 0
              )}
            </strong>
          </div>

          <div>
            <span>
              Today
            </span>

            <strong>
              {Number(
                orderAnalytics
                  ?.statistics
                  ?.todayOrders || 0
              )}
            </strong>
          </div>

          <div>
            <span>
              This Month
            </span>

            <strong>
              {Number(
                orderAnalytics
                  ?.statistics
                  ?.monthlyOrders || 0
              )}
            </strong>
          </div>

          <div>
            <span>
              Pending
            </span>

            <strong>
              {Number(
                orderAnalytics
                  ?.status
                  ?.pending || 0
              )}
            </strong>
          </div>

          <div>
            <span>
              Confirmed
            </span>

            <strong>
              {Number(
                orderAnalytics
                  ?.status
                  ?.confirmed || 0
              )}
            </strong>
          </div>

          <div>
            <span>
              Processing
            </span>

            <strong>
              {Number(
                orderAnalytics
                  ?.status
                  ?.processing || 0
              )}
            </strong>
          </div>

          <div>
            <span>
              Shipped
            </span>

            <strong>
              {Number(
                orderAnalytics
                  ?.status
                  ?.shipped || 0
              )}
            </strong>
          </div>

          <div>
            <span>
              Delivered
            </span>

            <strong>
              {Number(
                orderAnalytics
                  ?.status
                  ?.delivered || 0
              )}
            </strong>
          </div>

          <div>
            <span>
              Cancelled
            </span>

            <strong>
              {Number(
                orderAnalytics
                  ?.status
                  ?.cancelled || 0
              )}
            </strong>
          </div>

          <div>
            <span>
              Returned
            </span>

            <strong>
              {Number(
                orderAnalytics
                  ?.status
                  ?.returned || 0
              )}
            </strong>
          </div>

        </div>

      </section>

      {/* =========================
          SALES + MONTHLY SALES
      ========================= */}
      <div className="admin-two-column">

        {/* SALES */}
        <section className="admin-dashboard-card">

          <div className="admin-card-header">

            <div>
              <span>
                SALES
              </span>

              <h2>
                Sales Overview
              </h2>
            </div>

            <span className="admin-card-icon">
              💰
            </span>

          </div>

          <div className="admin-sales-main">

            <span>
              Total Revenue
            </span>

            <strong>
              {formatCurrency(
                salesAnalytics
                  ?.revenue
                  ?.total
              )}
            </strong>

          </div>

          <div className="admin-sales-details">

            <div>
              <span>
                Today's Revenue
              </span>

              <strong>
                {formatCurrency(
                  salesAnalytics
                    ?.revenue
                    ?.today
                )}
              </strong>
            </div>

            <div>
              <span>
                This Month
              </span>

              <strong>
                {formatCurrency(
                  salesAnalytics
                    ?.revenue
                    ?.thisMonth
                )}
              </strong>
            </div>

          </div>

        </section>

        {/* MONTHLY SALES */}
        <section className="admin-dashboard-card">

          <div className="admin-card-header">

            <div>
              <span>
                MONTHLY SALES
              </span>

              <h2>
                Sales History
              </h2>
            </div>

            <span className="admin-card-icon">
              📈
            </span>

          </div>

          <div className="admin-monthly-sales">

            {monthlySales.length > 0 ? (
              monthlySales
                .slice(-6)
                .map((month) => {

                  return (
                    <div
                      className="monthly-sale-row"
                      key={`${month.year}-${month.month}`}
                    >

                      <span>
                        {formatMonth(
                          month.month
                        )}{" "}
                        {month.year}
                      </span>

                      <strong>
                        {formatCurrency(
                          month.revenue
                        )}
                      </strong>

                    </div>
                  );
                })
            ) : (
              <p className="admin-no-data">
                No monthly sales data
                available.
              </p>
            )}

          </div>

        </section>

      </div>

      {/* =========================
          TOP PRODUCTS
      ========================= */}
      <section className="admin-dashboard-card">

        <div className="admin-card-header">

          <div>
            <span>
              PRODUCT PERFORMANCE
            </span>

            <h2>
              Top Selling Products
            </h2>
          </div>

          <span className="admin-card-icon">
            🏆
          </span>

        </div>

        {topProducts.length > 0 ? (
          <div className="admin-products-table">

            <div className="admin-table-head">
              <span>
                Product
              </span>

              <span>
                Sold
              </span>

              <span>
                Revenue
              </span>
            </div>

            {topProducts
              .slice(0, 5)
              .map((product, index) => {

                return (
                  <div
                    className="admin-table-row"
                    key={
                      product._id ||
                      index
                    }
                  >

                    <span>
                      <b>
                        #{index + 1}
                      </b>

                      {product.productName ||
                        "Product"}
                    </span>

                    <strong>
                      {Number(
                        product.totalQuantity ||
                          0
                      )}
                    </strong>

                    <strong>
                      {formatCurrency(
                        product.totalRevenue
                      )}
                    </strong>

                  </div>
                );
              })}

          </div>
        ) : (
          <p className="admin-no-data">
            No top-selling products
            available.
          </p>
        )}

      </section>

      {/* =========================
          LOW STOCK
      ========================= */}
      <section className="admin-dashboard-card">

        <div className="admin-card-header">

          <div>
            <span>
              INVENTORY
            </span>

            <h2>
              Low Stock Products
            </h2>
          </div>

          <span className="admin-card-icon">
            ⚠️
          </span>

        </div>

        {lowStockProducts.length > 0 ? (
          <div className="admin-low-stock-list">

            {lowStockProducts.map(
              (product, index) => {

                const stock =
                  Number(
                    product.stock || 0
                  );

                return (
                  <div
                    className="admin-low-stock-item"
                    key={
                      product._id ||
                      index
                    }
                  >

                    <div>
                      <strong>
                        {product.name ||
                          "Product"}
                      </strong>

                      <span>
                        {product.category ||
                          "Uncategorized"}
                      </span>
                    </div>

                    <div
                      className={
                        stock === 0
                          ? "stock-out"
                          : "stock-low"
                      }
                    >
                      {stock === 0
                        ? "Out of Stock"
                        : `${stock} left`}
                    </div>

                  </div>
                );
              }
            )}

          </div>
        ) : (
          <p className="admin-no-data">
            No low-stock products.
          </p>
        )}

      </section>

    </main>
  );
};

export default AdminDashboard;