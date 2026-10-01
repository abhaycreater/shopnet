const Coupon = require("../model/coupon.model");

// CREATE COUPON
const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscount,
      expiryDate,
      usageLimit,
    } = req.body;

    if (
      !code ||
      !discountType ||
      discountValue === undefined ||
      !expiryDate
    ) {
      return res.status(400).json({
        message: "Please provide all required coupon details",
      });
    }

    if (!["percentage", "fixed"].includes(discountType)) {
      return res.status(400).json({
        message: "Invalid discount type",
      });
    }

    if (discountValue <= 0) {
      return res.status(400).json({
        message: "Discount value must be greater than 0",
      });
    }

    if (discountType === "percentage" && discountValue > 100) {
      return res.status(400).json({
        message: "Percentage discount cannot be more than 100%",
      });
    }

    const existingCoupon = await Coupon.findOne({
      code: code.toUpperCase(),
    });

    if (existingCoupon) {
      return res.status(400).json({
        message: "Coupon code already exists",
      });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minimumOrderAmount: minimumOrderAmount || 0,
      maximumDiscount:
        maximumDiscount !== undefined ? maximumDiscount : null,
      expiryDate,
      usageLimit: usageLimit !== undefined ? usageLimit : null,
    });

    res.status(201).json({
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    console.error("Create coupon error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// GET ALL COUPONS
const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    res.status(200).json({
      coupons,
    });
  } catch (error) {
    console.error("Get coupons error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// GET SINGLE COUPON
const getCouponByCode = async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();

    const coupon = await Coupon.findOne({ code });

    if (!coupon) {
      return res.status(404).json({
        message: "Coupon not found",
      });
    }

    res.status(200).json({
      coupon,
    });
  } catch (error) {
    console.error("Get coupon error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// UPDATE COUPON
const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        message: "Coupon not found",
      });
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      message: "Coupon updated successfully",
      coupon: updatedCoupon,
    });
  } catch (error) {
    console.error("Update coupon error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// DELETE COUPON
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        message: "Coupon not found",
      });
    }

    await Coupon.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Delete coupon error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// APPLY COUPON
const applyCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    // 1. Check required fields
    if (!code || cartTotal === undefined) {
      return res.status(400).json({
        message: "Coupon code and cart total are required",
      });
    }

    // 2. Validate cart total
    if (Number(cartTotal) <= 0) {
      return res.status(400).json({
        message: "Cart total must be greater than 0",
      });
    }

    // 3. Find coupon
    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
    });

    if (!coupon) {
      return res.status(404).json({
        message: "Invalid coupon code",
      });
    }

    // 4. Check if coupon is active
    if (!coupon.isActive) {
      return res.status(400).json({
        message: "This coupon is inactive",
      });
    }

    // 5. Check expiry
    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({
        message: "This coupon has expired",
      });
    }

    // 6. Check usage limit
    if (
      coupon.usageLimit !== null &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      return res.status(400).json({
        message: "This coupon usage limit has been reached",
      });
    }

    // 7. Check minimum order amount
    if (Number(cartTotal) < coupon.minimumOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount is ₹${coupon.minimumOrderAmount}`,
      });
    }

    // 8. Calculate discount
    let discount = 0;

    if (coupon.discountType === "percentage") {
      discount = (Number(cartTotal) * coupon.discountValue) / 100;

      // Apply maximum discount limit
      if (
        coupon.maximumDiscount !== null &&
        discount > coupon.maximumDiscount
      ) {
        discount = coupon.maximumDiscount;
      }
    } else if (coupon.discountType === "fixed") {
      discount = coupon.discountValue;
    }

    // 9. Prevent discount from exceeding cart total
    if (discount > Number(cartTotal)) {
      discount = Number(cartTotal);
    }

    // Round discount to 2 decimal places
    discount = Number(discount.toFixed(2));

    // 10. Calculate final amount
    const finalAmount = Number(
      (Number(cartTotal) - discount).toFixed(2)
    );

    // 11. Send response
    res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      couponCode: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      cartTotal: Number(cartTotal),
      discount,
      finalAmount,
    });
  } catch (error) {
    console.error("Apply coupon error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


module.exports = {
  createCoupon,
  getAllCoupons,
  getCouponByCode,
  updateCoupon,
  deleteCoupon,
  applyCoupon
};