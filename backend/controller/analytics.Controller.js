const Order = require("../model/order.model.js");
const Product = require("../model/product.model.js");
const User = require("../model/user.model.js");


// ADMIN OVERVIEW

const getOverview = async (req ,res)=>{
    try{
        const totalUsers = await User.countDocuments({role: 'user'});
        
        const totalProducts = await Product.countDocuments({});

        const totalOrder = await Order.countDocuments({});

        // Revenu from paid orders
        const revenueResult = await Order.aggregate([
            {
                $match:{
                    paymentStatus : "paid",
                },
            },
            {
                $group:{
                    _id: null,
                    totalRevenue:{
                        $sum:"$totalAmount"
                    }
                }
            }
        ]);

        const totalRevenue = 
        revenueResult.length > 0
        ? revenueResult[0].totalRevenue
        : 0


        // order status count
        const orderStatusResult = await Order.aggregate([
            {
                $group:{
                    _id:"$status",
                    count:{
                        $sum:1,
                    }
                }
            }
        ]);

        const orders = {
            pending: 0,
            confirmed: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0,
            returned: 0,
        };

        orderStatusResult.forEach((item)=>{
            if(orders[item._id] !== undefined){
                orders[item._id] = item.count;
            }
        })

        //Payment status count
        const paymentStatusResult = await Order.aggregate([
            {
                $group:{
                    _id:"$paymentStatus",
                    count:{
                        $sum: 1,
                    }
                }
            }
        ]);

        const payments = {
            pending: 0,
            paid: 0,
            failed: 0,
            refunded: 0,
        }

        paymentStatusResult.forEach((item)=>{
            if(payments[item._id] !== undefined){
                payments[item._id] = item.count;
            }
        })

        return res.status(200).json({
            message:"Analytics overview fetched successfully",

            overview:{
                totalUsers,
                totalProducts,
                totalOrder,
                totalRevenue
            },
            orders,
            payments
        })
    }catch(error){
        console.log("Analytics overview error: ",error);

        return res.status(500).json({
            message:"Error fetching analytics overview",
            error: error.message
        })
    }
}


// Order Analytics
const getOrderAnalytics = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({});

    // Today's date
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayOrders = await Order.countDocuments({
      createdAt: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
    });

    // This month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyOrders = await Order.countDocuments({
      createdAt: {
        $gte: startOfMonth,
      },
    });

    // Order status
    const statusResult = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const status = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
    };

    statusResult.forEach((item) => {
      if (status[item._id] !== undefined) {
        status[item._id] = item.count;
      }
    });

    // Recent orders
    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
        "orderNumber user totalAmount paymentMethod paymentStatus status createdAt"
      );

    return res.status(200).json({
      message: "Order analytics fetched successfully",

      statistics: {
        totalOrders,
        todayOrders,
        monthlyOrders,
      },

      status,

      recentOrders,
    });
  } catch (error) {
    console.log("Order analytics error:", error);

    return res.status(500).json({
      message: "Error fetching order analytics",
      error: error.message,
    });
  }
};


// Sales Analytics
const getSalesAnalytics = async (req, res) => {
  try {
    // Total revenue
    const totalRevenueResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const totalRevenue =
      totalRevenueResult.length > 0
        ? totalRevenueResult[0].totalRevenue
        : 0;

    // Today's revenue
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayRevenueResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: {
            $gte: startOfToday,
            $lte: endOfToday,
          },
        },
      },
      {
        $group: {
          _id: null,
          revenue: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const todayRevenue =
      todayRevenueResult.length > 0
        ? todayRevenueResult[0].revenue
        : 0;

    // This month's revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyRevenueResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: {
            $gte: startOfMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          revenue: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const monthlyRevenue =
      monthlyRevenueResult.length > 0
        ? monthlyRevenueResult[0].revenue
        : 0;

    // Daily sales for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailySales = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: {
            $gte: sevenDaysAgo,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },

          revenue: {
            $sum: "$totalAmount",
          },

          orders: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    return res.status(200).json({
      message: "Sales analytics fetched successfully",

      revenue: {
        total: totalRevenue,
        today: todayRevenue,
        thisMonth: monthlyRevenue,
      },

      dailySales,
    });
  } catch (error) {
    console.log("Sales analytics error:", error);

    return res.status(500).json({
      message: "Error fetching sales analytics",
      error: error.message,
    });
  }
};

// ==========================================
// TOP SELLING PRODUCTS
// ==========================================

const getTopSellingProducts = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
        },
      },

      {
        $unwind: "$items",
      },

      {
        $group: {
          _id: "$items.product",

          productName: {
            $first: "$items.name",
          },

          totalQuantity: {
            $sum: "$items.quantity",
          },

          totalRevenue: {
            $sum: "$items.subtotal",
          },
        },
      },

      {
        $sort: {
          totalQuantity: -1,
        },
      },

      {
        $limit: 10,
      },
    ]);

    return res.status(200).json({
      message: "Top selling products fetched successfully",
      products: topProducts,
    });
  } catch (error) {
    console.log("Top products analytics error:", error);

    return res.status(500).json({
      message: "Error fetching top selling products",
      error: error.message,
    });
  }
};
// ==========================================
// LOW STOCK PRODUCTS
// ==========================================

const getLowStockProducts = async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      stock: {
        $lte: 5,
      },
    })
      .select("name category stock price imageUrl")
      .sort({ stock: 1 });

    return res.status(200).json({
      message: "Low stock products fetched successfully",
      products: lowStockProducts,
    });
  } catch (error) {
    console.log("Low stock analytics error:", error);

    return res.status(500).json({
      message: "Error fetching low stock products",
      error: error.message,
    });
  }
};

// ==========================================
// MONTHLY SALES
// ==========================================

const getMonthlySales = async (req, res) => {
  try {
    const startDate = new Date();

    startDate.setMonth(startDate.getMonth() - 11);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const monthlySales = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: {
            $gte: startDate,
          },
        },
      },

      {
        $group: {
          _id: {
            year: {
              $year: "$createdAt",
            },

            month: {
              $month: "$createdAt",
            },
          },

          revenue: {
            $sum: "$totalAmount",
          },

          orders: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    const formattedSales = monthlySales.map((item) => ({
      year: item._id.year,
      month: item._id.month,
      revenue: item.revenue,
      orders: item.orders,
    }));

    return res.status(200).json({
      message: "Monthly sales fetched successfully",
      sales: formattedSales,
    });
  } catch (error) {
    console.log("Monthly sales analytics error:", error);

    return res.status(500).json({
      message: "Error fetching monthly sales",
      error: error.message,
    });
  }
};

module.exports = {
  getOverview,
  getOrderAnalytics,
  getSalesAnalytics,
  getTopSellingProducts,
  getLowStockProducts,
  getMonthlySales
};