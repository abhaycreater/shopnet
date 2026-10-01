const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

const {
  getOverview,
  getOrderAnalytics,
  getSalesAnalytics,
  getTopSellingProducts,
  getLowStockProducts,
  getMonthlySales,
} = require("../controller/analytics.Controller");

const router = express.Router();

router.get("/overview", protect, admin, getOverview);

router.get("/orders", protect, admin, getOrderAnalytics);

router.get("/sales", protect, admin, getSalesAnalytics);

router.get("/top-products", protect, admin, getTopSellingProducts);

router.get("/low-stock", protect, admin, getLowStockProducts);

router.get("/monthly-sales", protect, admin, getMonthlySales);

module.exports = router;