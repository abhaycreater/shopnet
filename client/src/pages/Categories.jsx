import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../style/pagesCss/categories.css";
import API_URL from '../config/api.js'

const Categories = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const selectedCategory = searchParams.get("category") || "All";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clickedCategory, setClickedCategory] = useState(null);

  // =================================
  // FETCH PRODUCTS
  // =================================

  useEffect(() => {
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
        console.error("Categories error:", error);
        setError("Unable to load categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // =================================
  // GET UNIQUE CATEGORIES
  // Case-insensitive + trim spaces
  // =================================

  const categories = useMemo(() => {
    const categoryMap = new Map();

    products.forEach((product) => {
      if (!product.category) return;

      const originalCategory = product.category.trim();
      const normalizedCategory =
        originalCategory.toLowerCase();

      if (!categoryMap.has(normalizedCategory)) {
        categoryMap.set(
          normalizedCategory,
          originalCategory
        );
      }
    });

    return Array.from(categoryMap.values());
  }, [products]);

  // =================================
  // FILTER PRODUCTS
  // =================================

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") {
      return products;
    }

    return products.filter(
      (product) =>
        product.category?.trim().toLowerCase() ===
        selectedCategory.trim().toLowerCase()
    );
  }, [products, selectedCategory]);

  // =================================
  // CATEGORY ICON
  // =================================

  const getCategoryIcon = (category) => {
    const name = category.toLowerCase();

    if (
      name.includes("electronic") ||
      name.includes("phone") ||
      name.includes("computer")
    ) {
      return "💻";
    }

    if (
      name.includes("fashion") ||
      name.includes("cloth") ||
      name.includes("wear")
    ) {
      return "👕";
    }

    if (
      name.includes("gaming") ||
      name.includes("game")
    ) {
      return "🎮";
    }

    if (name.includes("accessor")) {
      return "⌚";
    }

    if (
      name.includes("home") ||
      name.includes("furniture")
    ) {
      return "🏠";
    }

    if (
      name.includes("beauty") ||
      name.includes("cosmetic")
    ) {
      return "💄";
    }

    if (name.includes("sport")) {
      return "⚽";
    }

    return "🛍️";
  };

  // =================================
  // CATEGORY CLICK
  // =================================

  const handleCategoryClick = (category) => {
    // Prevent multiple clicks during animation
    if (clickedCategory !== null) {
      return;
    }

    setClickedCategory(category);

    setTimeout(() => {
      if (category === "All") {
        navigate("/products");
      } else {
        navigate(
          `/products?category=${encodeURIComponent(category)}`
        );
      }
    }, 650);
  };

  // =================================
  // PRODUCT DETAILS
  // =================================

  const handleProductClick = (product) => {
    navigate(`/products/${product._id}`);
  };

  // =================================
  // RENDER
  // =================================

  return (
    <main className="categories-page">

      {/* =================================
          HERO
      ================================= */}

      <section className="categories-hero">

        <div className="categories-hero-glow"></div>

        <div className="categories-hero-content">

          <span className="categories-eyebrow">
            SHOPNET COLLECTION
          </span>

          <h1>
            Explore Our
            <span> Categories</span>
          </h1>

          <p>
            Discover products across different categories,
            carefully selected for your shopping experience.
          </p>

        </div>

      </section>


      {/* =================================
          CATEGORY SECTION
      ================================= */}

      <section className="categories-section">

        <div className="categories-container">

          {/* HEADING */}

          <div className="categories-heading">

            <div>

              <span className="categories-small-title">
                BROWSE
              </span>

              <h2>
                Shop by Category
              </h2>

            </div>

            <span className="categories-count">
              {categories.length}{" "}
              {categories.length === 1
                ? "Category"
                : "Categories"}
            </span>

          </div>


          {/* =================================
              LOADING
          ================================= */}

          {loading ? (

            <div className="categories-loading">

              <div className="categories-loader"></div>

              <p>
                Loading categories...
              </p>

            </div>

          ) : error ? (

            /* =================================
               ERROR
            ================================= */

            <div className="categories-error">

              <div className="categories-error-icon">
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
                onClick={() =>
                  window.location.reload()
                }
              >
                Try Again
              </button>

            </div>

          ) : (

            <>

              {/* =================================
                  CATEGORY CARDS
              ================================= */}

              <div className="categories-grid">

                {/* =================================
                    ALL PRODUCTS
                ================================= */}

                <button
                  type="button"
                  className={`category-card ${
                    selectedCategory === "All"
                      ? "active"
                      : ""
                  } ${
                    clickedCategory === "All"
                      ? "category-clicked"
                      : ""
                  }`}
                  onClick={() =>
                    handleCategoryClick("All")
                  }
                >

                  <div className="category-card-icon">
                    🛍️
                  </div>

                  <div className="category-card-content">

                    <h3>
                      All Products
                    </h3>

                    <span>
                      {products.length}{" "}
                      {products.length === 1
                        ? "Product"
                        : "Products"}
                    </span>

                  </div>

                  <span className="category-card-arrow">
                    →
                  </span>

                </button>


                {/* =================================
                    DYNAMIC CATEGORIES
                ================================= */}

                {categories.map((category) => {

                  const categoryProducts =
                    products.filter(
                      (product) =>
                        product.category
                          ?.trim()
                          .toLowerCase() ===
                        category
                          .trim()
                          .toLowerCase()
                    );

                  const isActive =
                    selectedCategory
                      .trim()
                      .toLowerCase() ===
                    category
                      .trim()
                      .toLowerCase();

                  return (

                    <button
                      type="button"
                      key={category}
                      className={`category-card ${
                        isActive
                          ? "active"
                          : ""
                      } ${
                        clickedCategory === category
                          ? "category-clicked"
                          : ""
                      }`}
                      onClick={() =>
                        handleCategoryClick(category)
                      }
                    >

                      <div className="category-card-icon">
                        {getCategoryIcon(category)}
                      </div>

                      <div className="category-card-content">

                        <h3>
                          {category}
                        </h3>

                        <span>
                          {categoryProducts.length}{" "}
                          {categoryProducts.length === 1
                            ? "Product"
                            : "Products"}
                        </span>

                      </div>

                      <span className="category-card-arrow">
                        →
                      </span>

                    </button>

                  );
                })}

              </div>


              {/* =================================
                  PRODUCTS HEADER
              ================================= */}

              <div className="category-products-header">

                <div>

                  <span className="categories-small-title">
                    PRODUCTS
                  </span>

                  <h2>
                    {selectedCategory === "All"
                      ? "All Products"
                      : selectedCategory}
                  </h2>

                </div>

                <span className="category-products-count">
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1
                    ? "product"
                    : "products"}
                </span>

              </div>


              {/* =================================
                  EMPTY PRODUCTS
              ================================= */}

              {filteredProducts.length === 0 ? (

                <div className="category-empty">

                  <div className="category-empty-icon">
                    🛍️
                  </div>

                  <h3>
                    No Products Found
                  </h3>

                  <p>
                    There are currently no products
                    in this category.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/products")
                    }
                  >
                    View All Products
                  </button>

                </div>

              ) : (

                /* =================================
                   PRODUCTS GRID
                ================================= */

                <div className="category-products-grid">

                  {filteredProducts.map((product) => (

                    <article
                      key={product._id}
                      className="category-product-card"
                      onClick={() =>
                        handleProductClick(product)
                      }
                    >

                      <div className="category-product-image">

                        <img
                          src={product.imageUrl}
                          alt={product.name}
                        />

                        <span>
                          {product.category}
                        </span>

                      </div>


                      <div className="category-product-content">

                        <h3>
                          {product.name}
                        </h3>

                        <p>
                          {product.description}
                        </p>


                        <div className="category-product-bottom">

                          <strong>
                            ₹
                            {Number(
                              product.price
                            ).toLocaleString("en-IN")}
                          </strong>

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();

                              handleProductClick(
                                product
                              );
                            }}
                          >
                            View →
                          </button>

                        </div>

                      </div>

                    </article>

                  ))}

                </div>

              )}

            </>

          )}

        </div>

      </section>

    </main>
  );
};

export default Categories;
