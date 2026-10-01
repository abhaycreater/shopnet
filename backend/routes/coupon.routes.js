const express = require("express");

const {
  createCoupon,
  getAllCoupons,
  getCouponByCode,
  updateCoupon,
  deleteCoupon,
  applyCoupon
} = require("../controller/coupon.Controller");

const router = express.Router();


// CREATE COUPON
router.post("/", createCoupon);


// GET ALL COUPONS
router.get("/", getAllCoupons);

// APPLY COUPON
router.post('/apply' , applyCoupon)


// GET COUPON BY CODE
router.get("/:code", getCouponByCode);


// UPDATE COUPON
router.put("/:id", updateCoupon);


// DELETE COUPON
router.delete("/:id", deleteCoupon);




module.exports = router;