import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../style/pagesCss/products.css";
import API_URL from '../config/api.js'

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Admin
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Create / Edit
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: null,
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get category from URL
  const selectedCategory = searchParams.get("category");

  // =================================
  // CHECK LOGGED-IN USER
  // =================================

  useEffect(() => {
    const checkUser = () => {
      try {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);

          setUser(parsedUser);
          setIsAdmin(parsedUser?.role === "admin");
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("User data error:", error);
        setUser(null);
        setIsAdmin(false);
      }
    };

    checkUser();

    window.addEventListener("storage", checkUser);
    window.addEventListener("authChanged", checkUser);

    return () => {
      window.removeEventListener("storage", checkUser);
      window.removeEventListener("authChanged", checkUser);
    };
  }, []);

  // =================================
  // FETCH PRODUCTS
  // =================================

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/products`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();

      setProducts(data.products || []);
    } catch (error) {
      console.error("Product fetch error:", error);

      setError(
        "Unable to load products. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // =================================
  // FILTER PRODUCTS BY CATEGORY
  // =================================

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) {
      return products;
    }

    const normalizedCategory =
      selectedCategory.trim().toLowerCase();

    return products.filter(
      (product) =>
        product.category?.trim().toLowerCase() ===
        normalizedCategory
    );
  }, [products, selectedCategory]);

  // =================================
  // PRODUCT DETAILS
  // =================================

  const handleProductClick = (product) => {
    navigate(`/products/${product._id}`);
  };

  // =================================
  // BACK TO CATEGORIES
  // =================================

  const handleBackToCategories = () => {
    navigate("/categories");
  };

  // =================================
  // OPEN CREATE FORM
  // =================================

  const handleCreateProduct = () => {
    if (!isAdmin) {
      return;
    }

    setEditingProduct(null);

    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      image: null,
    });

    setFormError("");
    setShowForm(true);
  };

  // =================================
  // OPEN EDIT FORM
  // =================================

  const handleEditProduct = (event, product) => {
    event.stopPropagation();

    if (!isAdmin) {
      return;
    }

    setEditingProduct(product);

    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      category: product.category || "",
      stock: product.stock ?? "",
      image: null,
    });

    setFormError("");
    setShowForm(true);
  };

  // =================================
  // CLOSE FORM
  // =================================

  const handleCloseForm = () => {
    if (formLoading) {
      return;
    }

    setShowForm(false);
    setEditingProduct(null);
    setFormError("");
  };

  // =================================
  // FORM INPUT
  // =================================

  const handleInputChange = (event) => {
    const { name, value, files } = event.target;

    if (name === "image") {
      setFormData((previous) => ({
        ...previous,
        image: files?.[0] || null,
      }));

      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =================================
  // CREATE / UPDATE PRODUCT
  // =================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isAdmin) {
      return;
    }

    try {
      setFormLoading(true);
      setFormError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login as admin.");
      }

      // Basic validation
      if (
        !formData.name.trim() ||
        !formData.description.trim() ||
        !formData.price ||
        !formData.category.trim() ||
        formData.stock === ""
      ) {
        throw new Error("Please fill all required fields.");
      }

      // Create FormData because backend uses multer
      const data = new FormData();

      data.append("name", formData.name.trim());
      data.append(
        "description",
        formData.description.trim()
      );
      data.append("price", formData.price);
      data.append("category", formData.category.trim());
      data.append("stock", formData.stock);

      // Image is required for create
      if (!editingProduct && !formData.image) {
        throw new Error("Please select a product image.");
      }

      if (formData.image) {
        data.append("image", formData.image);
      }

      const url = editingProduct
        ? `${API_URL}/api/products/${editingProduct._id}`
        : `${API_URL}/api/products`;

      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            `Failed to ${
              editingProduct ? "update" : "create"
            } product`
        );
      }

      // Refresh product list
      await fetchProducts();

      setShowForm(false);
      setEditingProduct(null);

      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        image: null,
      });
    } catch (error) {
      console.error("Product save error:", error);

      setFormError(
        error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setFormLoading(false);
    }
  };

  // =================================
  // DELETE PRODUCT
  // =================================

  const handleDeleteProduct = async (event, product) => {
    event.stopPropagation();

    if (!isAdmin) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login as admin.");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/products/${product._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to delete product"
        );
      }

      // Remove immediately from UI
      setProducts((previousProducts) =>
        previousProducts.filter(
          (item) => item._id !== product._id
        )
      );
    } catch (error) {
      console.error("Delete product error:", error);

      alert(
        error.message ||
          "Unable to delete product. Please try again."
      );
    }
  };

  return (
    <main className="products-page">

      {/* =================================
          HERO
      ================================= */}

      <section className="products-hero">

        <div className="products-hero-glow products-glow-one"></div>

        <div className="products-hero-glow products-glow-two"></div>

        <span className="products-particle particle-one"></span>
        <span className="products-particle particle-two"></span>
        <span className="products-particle particle-three"></span>
        <span className="products-particle particle-four"></span>

        <div className="products-hero-content">

          <span className="products-label">
            SHOPNET COLLECTION
          </span>

          <h1>
            Discover Our
            <br />
            <span>Products</span>
          </h1>

          <p>
            Explore our collection of quality products
            designed to make your everyday shopping better.
          </p>

        </div>

      </section>

      {/* =================================
          PRODUCTS CONTAINER
      ================================= */}

      <section className="products-container">

        {/* =================================
            ADMIN CREATE BUTTON
        ================================= */}

        {isAdmin && (
          <div className="admin-product-actions">

            <button
              type="button"
              className="admin-add-product-button"
              onClick={handleCreateProduct}
            >
              <span>＋</span>
              Add Product
            </button>

          </div>
        )}

        {/* =================================
            CATEGORY FILTER HEADER
        ================================= */}

        {selectedCategory && (

          <div className="products-category-header">

            <button
              type="button"
              className="products-back-button"
              onClick={handleBackToCategories}
            >
              ← All Products
            </button>

            <div className="products-category-info">

              <span>
                FILTERED CATEGORY
              </span>

              <h2>
                {selectedCategory}
              </h2>

              <p>
                Showing {filteredProducts.length}{" "}
                {filteredProducts.length === 1
                  ? "product"
                  : "products"}
              </p>

            </div>

          </div>

        )}

        {/* =================================
            PRODUCTS HEADING
        ================================= */}

        <div className="products-heading">

          <div>

            <span>
              {selectedCategory
                ? "CATEGORY COLLECTION"
                : "EXPLORE COLLECTION"}
            </span>

            <h2>
              {selectedCategory ? (
                <>
                  {selectedCategory}{" "}
                  <strong>Products</strong>
                </>
              ) : (
                <>
                  All <strong>Products</strong>
                </>
              )}
            </h2>

          </div>

          <div className="products-count">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1
              ? "Product"
              : "Products"}
          </div>

        </div>

        {/* =================================
            LOADING
        ================================= */}

        {loading && (

          <div className="products-loading">

            <div className="loading-orbit">
              <span></span>
            </div>

            <h3>
              Loading Products...
            </h3>

            <p>
              Discovering something extraordinary for you.
            </p>

          </div>

        )}

        {/* =================================
            ERROR
        ================================= */}

        {!loading && error && (

          <div className="products-error">

            <div className="error-icon">
              !
            </div>

            <h3>
              Something went wrong
            </h3>

            <p>
              {error}
            </p>

            <button
              type="button"
              onClick={fetchProducts}
            >
              Try Again
            </button>

          </div>

        )}

        {/* =================================
            EMPTY
        ================================= */}

        {!loading &&
          !error &&
          filteredProducts.length === 0 && (

            <div className="products-empty">

              <div>
                ✦
              </div>

              <h3>
                No Products Found
              </h3>

              <p>
                {selectedCategory
                  ? `There are currently no products in ${selectedCategory}.`
                  : "There are currently no products available."}
              </p>

              {selectedCategory && (

                <button
                  type="button"
                  onClick={handleBackToCategories}
                >
                  View All Categories
                </button>

              )}

              {/* Admin can create even when list is empty */}
              {isAdmin && !selectedCategory && (

                <button
                  type="button"
                  onClick={handleCreateProduct}
                >
                  Add Your First Product
                </button>

              )}

            </div>

          )}

        {/* =================================
            PRODUCT GRID
        ================================= */}

        {!loading &&
          !error &&
          filteredProducts.length > 0 && (

            <div className="products-grid">

              {filteredProducts.map((product) => (

                <article
                  className="products-card"
                  key={product._id}
                  onClick={() =>
                    handleProductClick(product)
                  }
                >

                  {/* IMAGE */}

                  <div className="products-image-container">

                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="products-image"
                    />

                    <div className="products-image-shine"></div>

                    <span className="products-category">
                      {product.category}
                    </span>

                    <button
                      type="button"
                      className="products-wishlist"
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                      aria-label="Add to wishlist"
                    >
                      ♡
                    </button>

                  </div>

                  {/* CONTENT */}

                  <div className="products-card-content">

                    <span className="products-card-category">
                      {product.category}
                    </span>

                    <h3>
                      {product.name}
                    </h3>

                    <p className="products-description">
                      {product.description}
                    </p>

                    {/* RATING */}

                    <div className="products-rating">

                      <span>
                        ★
                      </span>

                      <strong>
                        {Number(
                          product.rating || 0
                        ).toFixed(1)}
                      </strong>

                      <small>
                        ({product.numReviews || 0} reviews)
                      </small>

                    </div>

                    {/* BOTTOM */}

                    <div className="products-card-bottom">

                      <div>

                        <div className="products-price">
                          ₹
                          {Number(
                            product.price || 0
                          ).toLocaleString("en-IN")}
                        </div>

                        <span
                          className={
                            product.stock > 0
                              ? "products-stock in-stock"
                              : "products-stock out-stock"
                          }
                        >
                          {product.stock > 0
                            ? `${product.stock} in stock`
                            : "Out of stock"}
                        </span>

                      </div>

                      <button
                        type="button"
                        className="products-view-button"
                        onClick={(event) => {
                          event.stopPropagation();

                          handleProductClick(
                            product
                          );
                        }}
                      >
                        View
                        <span>
                          →
                        </span>
                      </button>

                    </div>

                    {/* =================================
                        ADMIN ACTIONS
                    ================================= */}

                    {isAdmin && (

                      <div className="admin-product-card-actions">

                        <button
                          type="button"
                          className="admin-edit-button"
                          onClick={(event) =>
                            handleEditProduct(
                              event,
                              product
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="admin-delete-button"
                          onClick={(event) =>
                            handleDeleteProduct(
                              event,
                              product
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    )}

                  </div>

                </article>

              ))}

            </div>

          )}

      </section>

      {/* =================================
          CREATE / EDIT PRODUCT MODAL
      ================================= */}

      {showForm && isAdmin && (

        <div
          className="product-form-overlay"
          onClick={handleCloseForm}
        >

          <div
            className="product-form-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="product-form-header">

              <div>

                <span>
                  SHOPNET ADMIN
                </span>

                <h2>
                  {editingProduct
                    ? "Update Product"
                    : "Create Product"}
                </h2>

              </div>

              <button
                type="button"
                className="product-form-close"
                onClick={handleCloseForm}
              >
                ×
              </button>

            </div>

            {/* ERROR */}

            {formError && (

              <div className="product-form-error">
                {formError}
              </div>

            )}

            {/* FORM */}

            <form onSubmit={handleSubmit}>

              {/* NAME */}

              <div className="product-form-group">

                <label>
                  Product Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  required
                />

              </div>

              {/* DESCRIPTION */}

              <div className="product-form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  rows="4"
                  required
                />

              </div>

              {/* PRICE + STOCK */}

              <div className="product-form-row">

                <div className="product-form-group">

                  <label>
                    Price
                  </label>

                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="70000"
                    min="0"
                    required
                  />

                </div>

                <div className="product-form-group">

                  <label>
                    Stock
                  </label>

                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="10"
                    min="0"
                    required
                  />

                </div>

              </div>

              {/* CATEGORY */}

              <div className="product-form-group">

                <label>
                  Category
                </label>

                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Electronics"
                  required
                />

              </div>

              {/* IMAGE */}

              <div className="product-form-group">

                <label>
                  Product Image
                  {editingProduct
                    ? " (Optional)"
                    : ""}
                </label>

                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleInputChange}
                  required={!editingProduct}
                />

                {editingProduct &&
                  editingProduct.imageUrl && (

                    <small>
                      Leave empty to keep the current
                      image.
                    </small>

                  )}

              </div>

              {/* BUTTONS */}

              <div className="product-form-actions">

                <button
                  type="button"
                  className="product-form-cancel"
                  onClick={handleCloseForm}
                  disabled={formLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="product-form-submit"
                  disabled={formLoading}
                >
                  {formLoading
                    ? editingProduct
                      ? "Updating..."
                      : "Creating..."
                    : editingProduct
                    ? "Update Product"
                    : "Create Product"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </main>
  );
};

export default Products;