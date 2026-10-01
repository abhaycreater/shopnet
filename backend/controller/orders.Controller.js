const Order = require('../model/order.model.js')
const Product = require('../model/product.model.js')
const sendEmail = require('../util/sendEmail.js')


const createOrder = async (req ,res)=>{
    try{
        const{
            items ,
            address ,
            paymentMethod = 'COD',
            paymentId = null,
            shippingFee = 0,
            tax = 0,
            discount = 0
        } = req.body;

        // -------------------
        //1. Validate basic data
        //---------------------
        if(!items || !Array.isArray(items) || items.length === 0){
            return res.status(400).json({
                message:"Order must contain at least one product."
            })
        }

        if(!address){
            return res.json(400).json({
                message: "Shipping address is required"
            })
        }

        if(!["COD","CARD",'UPI'].includes(paymentMethod)){
            return res.status(400).json({
                message:"Invalied payment method"
            })
        }

        //--------------------
        //2. Validate address
        //--------------------
        const requiredAddressFields = [
            "fullName",
            "phone",
            "street",
            "city",
            "state",
            "country",
            "postalCode"
        ];

        for(const field of requiredAddressFields){
            if(!address[field]){
                return res.status(400).json({
                    message:`${field} is required`
                })
            }
        }

        //----------------
        //3. Create order items
        //----------------

        const orderItems = [];

        for(const item of items){
            const product = await Product.findById(item.product)

            if(!product){
                return res.status(404).json({
                    message:`Product not found: ${item.product}`
                })
            }

            if(!item.quantity || item.quantity < 1){
                return res.status(400).json({
                    message:`Invalied quantity for ${product.name}`
                })
            }

            //Check Stock
            if(product.stock < item.quantity){
                return res.status(400).json({
                    message:`Not enough stock for ${product.name}`
                })
            }

            const price = product.price;
            const subtotal = price * item.quantity;

            orderItems.push({
                product: product._id,
                name: product.name,
                price: price,
                quantity: item.quantity,
                subtotal: subtotal,
            });
        }

        // ------------------
        // 4. Calculate subtotal
        // ------------------
        const subtotal = orderItems.reduce(
            (total , item)=> total + item.subtotal,
            0
        );

        //---------------------
        //5. Calculate Total
        //--------------------
        const totalAmount = 
        subtotal + 
        Number(shippingFee) +
        Number(tax) - 
        Number(discount);
        
        if(totalAmount < 0){
            return res.status(400).json({
                message:"Invalied total amount"
            })
        }

        // ------------------------
        // 6. Generate order Number
        //-------------------------
        const orderNumber = `SN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`

        // -----------------
        // 7.create order
        //-----------------
        const order = new Order({
            user : req.user._id,
            orderNumber,
            items: orderItems,
            address,
            subtotal,
            shippingFee:Number(shippingFee),
            tax: Number(tax),
            discount: Number(discount),
            totalAmount,
            paymentMethod: paymentMethod ,
            paymentId : paymentId,
            paymentStatus: "pending",
            status: "pending"
        })

        // ----------------------
        // 8.save order
        //----------------------
        await order.save()

        // ----------------
        // 9.reduce product stock
        // ------------------
        for (const item of orderItems){
            await Product.findByIdAndUpdate(item.product,{
                $inc:{
                    stock: -item.quantity,
                }
            })
        }

        // -------------------
        // 10. send email
        // ------------------

        const message = `
        Your ShopNet order has been created successfully.

        Order Number: ${order.orderNumber}
        Total Amount: ₹${order.totalAmount}
        Payment Method: ${order.paymentMethod}
        Order Status: ${order.status}

        Thank you for shopping with ShopNet!
            `;

            await sendEmail(
                req.user.email,
                "ShopNet - Order Created",
                message
            );

        // ------------
        // 11. Resopnse
        //------------
        return res.status(201).json({
            message:"Order created successfully",
            order
        })
    }catch(error){
        console.log("Created order error", error);

        return res.status(500).json({
            message:"Error creating order",
            error: error.message
        })
    }

    
}

const getMyOrders = async (req, res)=>{
    try{
        const orders = await Order.find({user: req.user._id}).populate('items.product','name price imageUrl').sort({createdAt: -1})
        return res.status(200).json({
            message: "Order fetched Successfullt",
            orders
        })
    }catch(error){
        console.log("get my Orders error: ", error)
        return res.status(500).json({
            message:"Error fetching orders",
            error: error.message
        })
    }
}

const getOrderById = async (req ,res)=>{
    try{
        const order = await Order.findById(req.params.id)
        .populate("user" , "name email")
        .populate("items.product" , "name price imageUrl");

        if(!order){
            return res.status(404).json({
                message: "Order not found"
            });
        }

        // Normal user can only see their own order
        // Admin can see any order
        if(order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin'){
            return res.status(403).json({
                message : "Not authorized to view this order",
            })
        }

        return res.status(200).json({
            message:"Order fetched successfully",
            order
        })
    }catch(error){
        console.log("Get order by ID error:", error);

        return res.status(500).json({
            message: "Error fetching order",
            error: error.message
        })
    }
}

const getAllOrders = async(req ,res)=>{
    try{
        const orders = await Order.find()
        .populate("user" , "name email")
        .populate("items.product" , "name price imageUrl")
        .sort({createdAt: -1});

        return res.status(200).json({
            message:"All orders fetched successfully",
            orders,
        })
    }catch(error){
        console.log("Get  all orders error: ",error);

        return res.status(500).json({
            message:"Error fetching all orders",
            error : error.message,
        })
    }
}

const updateOrderStatus = async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
    ];

    // Check status
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    // Find order
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Status flow
    const statusFlow = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered"],
      delivered: ["returned"],
      cancelled: [],
      returned: [],
    };

    // Check whether new status is allowed
    if (!statusFlow[order.status].includes(status)) {
      return res.status(400).json({
        message: `Cannot change order status from ${order.status} to ${status}`,
      });
    }

    // Cancel order
    if (status === "cancelled") {

      // Restore stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          {
            $inc: {
              stock: item.quantity,
            },
          }
        );
      }

      order.cancelledAt = new Date();

      if (cancellationReason) {
        order.cancellationReason = cancellationReason;
      }
    }

    // Confirm order
    if (status === "confirmed") {
      order.confirmedAt = new Date();
    }

    // Ship order
    if (status === "shipped") {
      order.shippedAt = new Date();
    }

    // Deliver order
    if (status === "delivered") {
      order.deliveredAt = new Date();
    }

    // Finally update status
    order.status = status;

    await order.save();

    return res.status(200).json({
      message: "Order status updated successfully",
      order,
    });

  } catch (error) {
    console.log("Update order status error:", error);

    return res.status(500).json({
      message: "Error updating order status",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
};