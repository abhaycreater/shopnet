import React, { useEffect, useState } from "react";
import "../../style/admin/adminCoupons.css";
import API_URL from '../../config/api.js'

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  // Form
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minimumOrderAmount: 0,
    maximumDiscount: "",
    expiryDate: "",
    usageLimit: "",
    isActive: true,
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // =========================================
  // FETCH COUPONS
  // =========================================

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/coupons`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch coupons"
        );
      }

      setCoupons(data.coupons || data);
    } catch (error) {
      console.error("Fetch coupons error:", error);
      setError("Unable to load coupons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // =========================================
  // FORM INPUT
  // =========================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setFormError("");
  };

  // =========================================
  // OPEN CREATE MODAL
  // =========================================

  const openCreateModal = () => {
    setEditingCoupon(null);

    setFormData({
      code: "",
      discountType: "percentage",
      discountValue: "",
      minimumOrderAmount: 0,
      maximumDiscount: "",
      expiryDate: "",
      usageLimit: "",
      isActive: true,
    });

    setFormError("");
    setShowModal(true);
  };

  // =========================================
  // OPEN EDIT MODAL
  // =========================================

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);

    setFormData({
      code: coupon.code || "",
      discountType: coupon.discountType || "percentage",
      discountValue: coupon.discountValue || "",
      minimumOrderAmount:
        coupon.minimumOrderAmount || 0,
      maximumDiscount:
        coupon.maximumDiscount ?? "",
      expiryDate: coupon.expiryDate
        ? new Date(coupon.expiryDate)
            .toISOString()
            .split("T")[0]
        : "",
      usageLimit: coupon.usageLimit ?? "",
      isActive: coupon.isActive ?? true,
    });

    setFormError("");
    setShowModal(true);
  };

  // =========================================
  // CLOSE MODAL
  // =========================================

  const closeModal = () => {
    if (formLoading) return;

    setShowModal(false);
    setEditingCoupon(null);
    setFormError("");
  };

  // =========================================
  // CREATE / UPDATE
  // =========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormError("");

    if (!formData.code.trim()) {
      setFormError("Coupon code is required.");
      return;
    }

    if (!formData.discountValue) {
      setFormError("Discount value is required.");
      return;
    }

    if (!formData.expiryDate) {
      setFormError("Expiry date is required.");
      return;
    }

    try {
      setFormLoading(true);

      const payload = {
        code: formData.code.trim().toUpperCase(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minimumOrderAmount: Number(
          formData.minimumOrderAmount || 0
        ),
        maximumDiscount:
          formData.maximumDiscount === ""
            ? null
            : Number(formData.maximumDiscount),
        expiryDate: formData.expiryDate,
        usageLimit:
          formData.usageLimit === ""
            ? null
            : Number(formData.usageLimit),
        isActive: formData.isActive,
      };

      const url = editingCoupon
        ? `${API_URL}/api/coupons/${editingCoupon._id}`
        : `${API_URL}/api/coupons`;

      const method = editingCoupon ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to ${
              editingCoupon ? "update" : "create"
            } coupon`
        );
      }

      setShowModal(false);
      setEditingCoupon(null);

      await fetchCoupons();
    } catch (error) {
      console.error("Coupon save error:", error);

      setFormError(
        error.message || "Unable to save coupon."
      );
    } finally {
      setFormLoading(false);
    }
  };

  // =========================================
  // DELETE COUPON
  // =========================================

  const handleDelete = async (coupon) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${coupon.code}"?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/api/coupons/${coupon._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete coupon"
        );
      }

      await fetchCoupons();
    } catch (error) {
      console.error("Delete coupon error:", error);

      alert(
        error.message || "Unable to delete coupon."
      );
    }
  };

  // =========================================
  // DATE FORMAT
  // =========================================

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================
  // EXPIRY
  // =========================================

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  // =========================================
  // STATS
  // =========================================

  const activeCoupons = coupons.filter(
    (coupon) =>
      coupon.isActive &&
      !isExpired(coupon.expiryDate)
  ).length;

  const expiredCoupons = coupons.filter((coupon) =>
    isExpired(coupon.expiryDate)
  ).length;

  return (
    <main className="admin-coupons-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <section className="admin-coupons-header">
        <div>
          <span>ADMIN PANEL</span>

          <h1>
            Coupon <strong>Management</strong>
          </h1>

          <p>
            Create and manage discount coupons for
            ShopNet customers.
          </p>
        </div>

        <button
          type="button"
          className="add-coupon-button"
          onClick={openCreateModal}
        >
          + Add Coupon
        </button>
      </section>

      {/* =====================================
          STATS
      ===================================== */}

      <section className="coupon-stats">

        <div className="coupon-stat-card">
          <span>Total Coupons</span>
          <strong>{coupons.length}</strong>
        </div>

        <div className="coupon-stat-card">
          <span>Active</span>
          <strong>{activeCoupons}</strong>
        </div>

        <div className="coupon-stat-card">
          <span>Expired</span>
          <strong>{expiredCoupons}</strong>
        </div>

      </section>

      {/* =====================================
          COUPON LIST
      ===================================== */}

      <section className="admin-coupon-list">

        <div className="admin-coupon-list-header">

          <div>
            <span>DISCOUNT SYSTEM</span>

            <h2>
              All <strong>Coupons</strong>
            </h2>
          </div>

          <button
            type="button"
            className="refresh-coupon-button"
            onClick={fetchCoupons}
          >
            ↻ Refresh
          </button>

        </div>

        {loading && (
          <div className="coupon-state">
            Loading coupons...
          </div>
        )}

        {!loading && error && (
          <div className="coupon-state coupon-state-error">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          coupons.length === 0 && (
            <div className="coupon-state">
              No coupons found.
            </div>
          )}

        {!loading &&
          !error &&
          coupons.length > 0 && (
            <div className="coupon-table-wrapper">

              <table className="coupon-table">

                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Discount</th>
                    <th>Minimum Order</th>
                    <th>Max Discount</th>
                    <th>Usage</th>
                    <th>Expiry</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {coupons.map((coupon) => {

                    const expired =
                      isExpired(
                        coupon.expiryDate
                      );

                    const active =
                      coupon.isActive &&
                      !expired;

                    return (
                      <tr key={coupon._id}>

                        {/* CODE */}

                        <td>
                          <div className="coupon-code">
                            {coupon.code}
                          </div>
                        </td>

                        {/* DISCOUNT */}

                        <td>
                          <strong>
                            {coupon.discountType ===
                            "percentage"
                              ? `${coupon.discountValue}%`
                              : `₹${Number(
                                  coupon.discountValue
                                ).toLocaleString(
                                  "en-IN"
                                )}`}
                          </strong>

                          <span className="discount-type">
                            {coupon.discountType}
                          </span>
                        </td>

                        {/* MINIMUM */}

                        <td>
                          ₹
                          {Number(
                            coupon.minimumOrderAmount ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        {/* MAX */}

                        <td>
                          {coupon.maximumDiscount
                            ? `₹${Number(
                                coupon.maximumDiscount
                              ).toLocaleString(
                                "en-IN"
                              )}`
                            : "No limit"}
                        </td>

                        {/* USAGE */}

                        <td>
                          <div className="usage-info">

                            <strong>
                              {coupon.usedCount ||
                                0}
                            </strong>

                            <span>
                              /
                              {coupon.usageLimit ||
                                "∞"}
                            </span>

                          </div>
                        </td>

                        {/* EXPIRY */}

                        <td>
                          {formatDate(
                            coupon.expiryDate
                          )}
                        </td>

                        {/* STATUS */}

                        <td>

                          <span
                            className={`coupon-status ${
                              active
                                ? "status-active"
                                : "status-inactive"
                            }`}
                          >
                            {expired
                              ? "Expired"
                              : coupon.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>

                        </td>

                        {/* ACTIONS */}

                        <td>

                          <div className="coupon-actions">

                            <button
                              type="button"
                              className="edit-coupon"
                              onClick={() =>
                                openEditModal(
                                  coupon
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="delete-coupon"
                              onClick={() =>
                                handleDelete(
                                  coupon
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

      </section>

      {/* =====================================
          CREATE / EDIT MODAL
      ===================================== */}

      {showModal && (
        <div
          className="coupon-modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div className="coupon-modal">

            {/* Modal Header */}

            <div className="coupon-modal-header">

              <div>
                <span>
                  {editingCoupon
                    ? "UPDATE COUPON"
                    : "NEW COUPON"}
                </span>

                <h2>
                  {editingCoupon
                    ? "Edit Coupon"
                    : "Create Coupon"}
                </h2>
              </div>

              <button
                type="button"
                className="coupon-modal-close"
                onClick={closeModal}
              >
                ×
              </button>

            </div>

            {/* Form */}

            <form
              className="coupon-form"
              onSubmit={handleSubmit}
            >

              {/* Code */}

              <div className="coupon-form-group">
                <label>
                  Coupon Code
                </label>

                <input
                  type="text"
                  name="code"
                  placeholder="Example: SAVE20"
                  value={formData.code}
                  onChange={handleChange}
                  disabled={formLoading}
                />
              </div>

              {/* Discount Type + Value */}

              <div className="coupon-form-grid">

                <div className="coupon-form-group">
                  <label>
                    Discount Type
                  </label>

                  <select
                    name="discountType"
                    value={
                      formData.discountType
                    }
                    onChange={handleChange}
                    disabled={formLoading}
                  >
                    <option value="percentage">
                      Percentage
                    </option>

                    <option value="fixed">
                      Fixed Amount
                    </option>
                  </select>
                </div>

                <div className="coupon-form-group">
                  <label>
                    Discount Value
                  </label>

                  <input
                    type="number"
                    name="discountValue"
                    placeholder={
                      formData.discountType ===
                      "percentage"
                        ? "20"
                        : "200"
                    }
                    min="0"
                    value={
                      formData.discountValue
                    }
                    onChange={handleChange}
                    disabled={formLoading}
                  />
                </div>

              </div>

              {/* Minimum + Maximum */}

              <div className="coupon-form-grid">

                <div className="coupon-form-group">
                  <label>
                    Minimum Order
                  </label>

                  <input
                    type="number"
                    name="minimumOrderAmount"
                    min="0"
                    value={
                      formData.minimumOrderAmount
                    }
                    onChange={handleChange}
                    disabled={formLoading}
                  />
                </div>

                <div className="coupon-form-group">
                  <label>
                    Maximum Discount
                  </label>

                  <input
                    type="number"
                    name="maximumDiscount"
                    min="0"
                    placeholder="Optional"
                    value={
                      formData.maximumDiscount
                    }
                    onChange={handleChange}
                    disabled={formLoading}
                  />
                </div>

              </div>

              {/* Expiry + Usage */}

              <div className="coupon-form-grid">

                <div className="coupon-form-group">
                  <label>
                    Expiry Date
                  </label>

                  <input
                    type="date"
                    name="expiryDate"
                    value={
                      formData.expiryDate
                    }
                    onChange={handleChange}
                    disabled={formLoading}
                  />
                </div>

                <div className="coupon-form-group">
                  <label>
                    Usage Limit
                  </label>

                  <input
                    type="number"
                    name="usageLimit"
                    min="1"
                    placeholder="Optional"
                    value={
                      formData.usageLimit
                    }
                    onChange={handleChange}
                    disabled={formLoading}
                  />
                </div>

              </div>

              {/* Active */}

              <label className="coupon-active-toggle">

                <input
                  type="checkbox"
                  name="isActive"
                  checked={
                    formData.isActive
                  }
                  onChange={handleChange}
                  disabled={formLoading}
                />

                <span>
                  Coupon is active
                </span>

              </label>

              {/* Error */}

              {formError && (
                <div className="coupon-form-error">
                  {formError}
                </div>
              )}

              {/* Buttons */}

              <div className="coupon-form-actions">

                <button
                  type="button"
                  className="coupon-cancel-button"
                  onClick={closeModal}
                  disabled={formLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="coupon-submit-button"
                  disabled={formLoading}
                >
                  {formLoading
                    ? "Saving..."
                    : editingCoupon
                    ? "Update Coupon"
                    : "Create Coupon"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </main>
  );
};

export default AdminCoupons;