import React from "react";
import { useNavigate } from "react-router-dom";
import "../../style/profile/profile.css";

const Profile = () => {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const userName = user?.name || user?.username || "ShopNet User";
  const userEmail = user?.email || "No email available";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.dispatchEvent(new Event("authChanged"));

    navigate("/login");
  };

  return (
    <main className="profile-page">

      {/* Header */}
      <section className="profile-heading">
        <span className="profile-label">MY ACCOUNT</span>

        <h1>
          Welcome, <span>{userName}</span>
        </h1>

        <p>
          Manage your account, orders and shopping preferences.
        </p>
      </section>

      {/* Profile + Orders */}
      <section className="profile-top-grid">

        {/* User Card */}
        <div className="profile-user-card">

          <div className="profile-avatar">
            {userName.charAt(0).toUpperCase()}
          </div>

          <div className="profile-user-info">
            <span className="profile-small-label">
              SHOPNET MEMBER
            </span>

            <h2>{userName}</h2>

            <p>{userEmail}</p>
          </div>

          <button
            className="profile-edit-btn"
            onClick={() => navigate("/profile/edit")}
          >
            Edit Profile
          </button>

        </div>

        {/* Orders Card */}
        <div
          className="profile-orders-card"
          onClick={() => navigate("/orders")}
        >
          <div className="profile-card-icon">
            📦
          </div>

          <div>
            <span className="profile-small-label">
              SHOPPING
            </span>

            <h2>My Orders</h2>

            <p>
              Track and manage your ShopNet orders.
            </p>
          </div>

          <span className="profile-card-arrow">
            →
          </span>
        </div>

      </section>

      {/* Account */}
      <section className="profile-menu-section">

        <div className="profile-section-title">
          <span>ACCOUNT</span>
          <h2>Account Settings</h2>
        </div>

        <div className="profile-menu-list">

          <button
            className="profile-menu-item"
            onClick={() => navigate("/profile/edit")}
          >
            <div className="profile-menu-icon">
              👤
            </div>

            <div className="profile-menu-content">
              <h3>Personal Information</h3>
              <p>
                Manage your name, email and personal details.
              </p>
            </div>

            <span>→</span>
          </button>

          <button
            className="profile-menu-item"
            onClick={() => navigate("/profile/addresses")}
          >
            <div className="profile-menu-icon">
              📍
            </div>

            <div className="profile-menu-content">
              <h3>Addresses</h3>
              <p>
                Manage your delivery addresses.
              </p>
            </div>

            <span>→</span>
          </button>

          <button
            className="profile-menu-item"
            onClick={() => navigate("/profile/security")}
          >
            <div className="profile-menu-icon">
              🔒
            </div>

            <div className="profile-menu-content">
              <h3>Security</h3>
              <p>
                Manage your password and account security.
              </p>
            </div>

            <span>→</span>
          </button>

        </div>

      </section>

      {/* Shopping */}
      <section className="profile-menu-section">

        <div className="profile-section-title">
          <span>SHOPPING</span>
          <h2>Your Shopping</h2>
        </div>

        <div className="profile-menu-list">

          <button
            className="profile-menu-item"
            onClick={() => navigate("/orders")}
          >
            <div className="profile-menu-icon">
              🛒
            </div>

            <div className="profile-menu-content">
              <h3>My Orders</h3>
              <p>
                View your order history and track deliveries.
              </p>
            </div>

            <span>→</span>
          </button>

          <button
            className="profile-menu-item"
            onClick={() => navigate("/wishlist")}
          >
            <div className="profile-menu-icon">
              ♥
            </div>

            <div className="profile-menu-content">
              <h3>Wishlist</h3>
              <p>
                View products you have saved.
              </p>
            </div>

            <span>→</span>
          </button>

        </div>

      </section>

      {/* Logout */}
      <section className="profile-logout-section">

        <button
          className="profile-logout-btn"
          onClick={handleLogout}
        >
          <span>↪</span>
          Logout
        </button>

      </section>

    </main>
  );
};

export default Profile;