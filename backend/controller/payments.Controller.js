// const Razorpay = require("razorpay")
// const crypto = require('crypto')

// const Order = require('../model/order.model.js')

// const razorpay = new Razorpay({
//     key_id : process.env.RAZORPAY_KEY_ID,
//     key_secret : process.env.RAZORPAY_KEY_SECRET
// });

// // Create Razorpay Payment

// const createPayment = async(req ,res)=>{
//     try{
//         const {orderId} = req.body;

//         if(!orderId){
//             return res.status(400).json({
//                 message:"Order Id is required"
//             })
//         }

//         const order = await Order.findById(orderId);

//         if(!order){
//             return res.status(404).json({
//                 message:"Order not found"
//             });
//         }

//         // make sure this order belongs to logged-in user
//         if(order.user.toString() !== req.user._id.toString()){
//             return res.status(403).json({
//                 message:"Not authorized to pay for this order"
//             })
//         }

//         // COD should not go through Razorpay
//         if(order.paymentMethod === 'COD'){
//             return res.status(400).json({
//                 message:"COD order do not require online payment"
//             })
//         }

//         // Don't create another payment for already apid order
//         if(order.paymentStatus === "paid"){
//             return res.status(400).json({
//                 message:"Order is already paid"
//             })
//         }

//         const razorpayOrder = await razorpay.orders.create({
//             amount: Math.round(order.totalAmount * 100),
//             currency: "INR",
//             receipt:order.orderNumber
//         });

//         return res.status(200).json({
//             message: "Razorpay order created successfully",

//             razorpayOrderId: razorpayOrder.id,

//             amount:razorpayOrder.amount,

//             currency: razorpayOrder.currency,

//             key:process.env.RAZORPAY_KEY_ID,

//             orderId:order._id,
//         });
//     }catch(error){
//         console.log("Create payment error: ", error);

//         return res.status(500).json({
//             message:"Error creating payment",
//             error:error.message
//         })
//     }
// }


// // Verify Razorpay Payment

// const verifyPayment = async (req,res)=>{
//     try{
//         const {
//             orderId,
//             razorpay_order_id,
//             razorpay_payment_id,
//             razorpay_signature
//         } = req.body;

//         if(
//             !orderId ||
//             !razorpay_order_id ||
//             !razorpay_payment_id ||
//             !razorpay_signature
//         ){
//             return res.status(400).json({
//                 message:"Payment verification data is required"
//             });
//         }

//         const order = await Order.findById(orderId);

//         if(!order){
//             return res.status(404).json({
//                 message: "Order not found"
//             });
//         }

//         // Make sure Order belong to Logged-in user
//         if(order.user.toString() !== req.user._id.toString()){
//             return res.status(403).json({
//                 message:"Not authorized"
//             });
//         }

//         const generatedSignature = crypto
//         .createHmac(
//             "sha256",
//             process.env.RAZORPAY_KEY_SECRET
//         )
//         .update(
//             razorpay_order_id + "|" + razorpay_payment_id
//         )
//         .digest("hex")

//         if(generatedSignature !== razorpay_signature){
//             return res.status(400).json({
//                 message:"Invalied payment signature"
//             });
//         }

//         // Payment successfully verified
//         order.paymentStatus = "paid";
//         order.paymentId = razorpay_payment_id;

//         await order.save();
//         return res.status(200).json({
//             message:"Payment verified successfully",
//             order
//         });
//     }catch(error){
//         console.log("Verify payment error: ",error);

//         return res.status(500).json({
//             message:"Error verifying payment",
//             error : error.message
//         })
//     }
// }


// module.exports = {
//     createPayment,
//     verifyPayment
// }

const Razorpay = require("razorpay");
const crypto = require("crypto");

const Order = require("../model/order.model.js");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ==========================================
// CREATE RAZORPAY PAYMENT ORDER
// ==========================================

const createPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        message: "Order Id is required",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Make sure this order belongs to logged-in user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to pay for this order",
      });
    }

    // COD does not need Razorpay
    if (order.paymentMethod === "COD") {
      return res.status(400).json({
        message: "COD order does not require online payment",
      });
    }

    // Don't create another payment for already paid order
    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        message: "Order is already paid",
      });
    }

    // If Razorpay order already exists, return it
    if (order.razorpayOrderId) {
      return res.status(200).json({
        message: "Razorpay order already exists",
        razorpayOrderId: order.razorpayOrderId,
        amount: Math.round(order.totalAmount * 100),
        currency: "INR",
        key: process.env.RAZORPAY_KEY_ID,
        orderId: order._id,
      });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalAmount * 100),
      currency: "INR",
      receipt: order.orderNumber,
    });

    // Save Razorpay order ID in ShopNet order
    order.razorpayOrderId = razorpayOrder.id;

    await order.save();

    return res.status(200).json({
      message: "Razorpay order created successfully",

      razorpayOrderId: razorpayOrder.id,

      amount: razorpayOrder.amount,

      currency: razorpayOrder.currency,

      key: process.env.RAZORPAY_KEY_ID,

      orderId: order._id,
    });
  } catch (error) {
    console.log("Create payment error:", error);

    return res.status(500).json({
      message: "Error creating payment",
      error: error.message,
    });
  }
};

// ==========================================
// VERIFY RAZORPAY PAYMENT
// ==========================================

const verifyPayment = async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !orderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Payment verification data is required",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Make sure order belongs to logged-in user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    // Make sure Razorpay order belongs to this ShopNet order
    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        message: "Razorpay order does not match ShopNet order",
      });
    }

    // Generate signature on server
    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    // Compare signatures safely
    const generatedBuffer = Buffer.from(
      generatedSignature,
      "utf8"
    );

    const receivedBuffer = Buffer.from(
      razorpay_signature,
      "utf8"
    );

    if (
      generatedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(
        generatedBuffer,
        receivedBuffer
      )
    ) {
      return res.status(400).json({
        message: "Invalid payment signature",
      });
    }

    // Payment successfully verified
    order.paymentStatus = "paid";
    order.paymentId = razorpay_payment_id;

    await order.save();

    return res.status(200).json({
      message: "Payment verified successfully",
      order,
    });
  } catch (error) {
    console.log("Verify payment error:", error);

    return res.status(500).json({
      message: "Error verifying payment",
      error: error.message,
    });
  }
};

module.exports = {
  createPayment,
  verifyPayment,
};
