import React, {
  useEffect,
  useState,
} from "react";
import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";
import "../style/componentsCss/navbar.css";

const Header = () => {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] =
    useState(false);

  const [user, setUser] = useState(null);

  // Cart count
  const [cartCount, setCartCount] = useState(0);

  // =========================
  // CHECK LOGIN STATUS
  // =========================
  const checkLoginStatus = () => {
    const token =
      localStorage.getItem("token");

    const storedUser =
      localStorage.getItem("user");

    setIsLoggedIn(!!token);

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error(
          "Invalid user data:",
          error
        );

        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  // =========================
  // CHECK LOGIN WHEN HEADER LOADS
  // =========================
  useEffect(() => {
    checkLoginStatus();
  }, []);

  // =========================
  // LISTEN FOR LOGIN / LOGOUT
  // =========================
  useEffect(() => {
    const handleAuthChange = () => {
      checkLoginStatus();
    };

    window.addEventListener(
      "storage",
      handleAuthChange
    );

    window.addEventListener(
      "authChanged",
      handleAuthChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleAuthChange
      );

      window.removeEventListener(
        "authChanged",
        handleAuthChange
      );
    };
  }, []);

  // =========================
  // CART COUNT
  // =========================
  useEffect(() => {
    const updateCartCount = () => {
      const cart =
        JSON.parse(
          localStorage.getItem("cart")
        ) || [];

      const total = cart.reduce(
        (sum, item) =>
          sum +
          Number(item.quantity || 0),
        0
      );

      setCartCount(total);
    };

    // Get current cart count
    updateCartCount();

    // Listen for cart changes
    window.addEventListener(
      "cartUpdated",
      updateCartCount
    );

    return () => {
      window.removeEventListener(
        "cartUpdated",
        updateCartCount
      );
    };
  }, []);

  // =========================
  // CHECK ADMIN
  // =========================
  const isAdmin =
    isLoggedIn &&
    user?.role === "admin";

  return (
    <header className="shopnet-header">

      <div className="shopnet-nav">

        {/* =========================
            LOGO
        ========================= */}
        <Link
          to="/"
          className="shopnet-logo"
        >
          <img
            src="/assets/logo-only.jpg"
            alt="ShopNet Logo"
            className="shopnet-logo-img"
          />

          <span>Shop</span>
          <strong>Net</strong>
        </Link>

        {/* =========================
            NAVIGATION
        ========================= */}
        <nav className="shopnet-links">

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive
                ? "shopnet-link active"
                : "shopnet-link"
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) =>
              isActive
                ? "shopnet-link active"
                : "shopnet-link"
            }
          >
            Products
          </NavLink>

          <NavLink
            to="/categories"
            className={({ isActive }) =>
              isActive
                ? "shopnet-link active"
                : "shopnet-link"
            }
          >
            Categories
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive
                ? "shopnet-link active"
                : "shopnet-link"
            }
          >
            About
          </NavLink>

          {/* =========================
              ADMIN DASHBOARD
          ========================= */}
          {isAdmin && (
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                isActive
                  ? "shopnet-link active"
                  : "shopnet-link"
              }
            >
              Dashboard
            </NavLink>
          )}

        </nav>

        {/* =========================
            RIGHT ACTIONS
        ========================= */}
        <div className="shopnet-actions">

          {/* =========================
              CART
          ========================= */}
          <Link
            to="/cart"
            className="shopnet-cart"
          >
            <span className="cart-icon">
              🛒
            </span>

            <span>Cart</span>

            <b>{cartCount}</b>
          </Link>

          {/* =========================
              NOT LOGGED IN
          ========================= */}
          {!isLoggedIn && (
            <Link
              to="/login"
              className="shopnet-login"
            >
              Login
            </Link>
          )}

          {/* =========================
              LOGGED IN
          ========================= */}
          {isLoggedIn && (
            <button
              type="button"
              className="shopnet-profile"
              onClick={() =>
                navigate("/profile")
              }
              aria-label="Open profile"
            >
              <span className="profile-icon">
                👤
              </span>

              <span className="profile-text">
                {user?.name || "Profile"}
              </span>
            </button>
          )}

        </div>

      </div>

    </header>
  );
};

export default Header;