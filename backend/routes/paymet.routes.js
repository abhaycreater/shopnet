const express = require("express");

const { protect } = require("../middleware/authMiddleware.js");

const {
  createPayment,
  verifyPayment,
} = require("../controller/payments.Controller.js");

const router = express.Router();

// Create Razorpay order
router.post("/create", protect, createPayment);

// Verify Razorpay payment
router.post("/verify", protect, verifyPayment);

module.exports = router;