const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

const {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controller/orders.Controller.js");
const {updatePaymentStatus} = require('../controller/paymentStatus.Controller.js')

const router = express.Router();

// Create order
router.post("/", protect, createOrder);

// Admin - get all orders
router.get("/", protect, admin, getAllOrders);

// Customer - get own orders
router.get("/myOrders", protect, getMyOrders);

// Customer/Admin - get one order
router.get("/:id", protect, getOrderById);

// Admin - update order status
router.put(
  "/:id/status",
  protect,
  admin,
  updateOrderStatus
);

// Admin - update payment status
router.put(
  "/:id/payment",
  protect,
  admin,
  updatePaymentStatus
);

module.exports = router;