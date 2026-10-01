const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const dotenv = require('dotenv')
dotenv.config()

const express = require('express')
const cors = require('cors')
const ConnectDB = require('../backend/config/db.js')
const authroutes = require('./routes/auth.routes.js')
const productRoutes = require('./routes/product.routes.js')
const orderRoutes = require('./routes/order.routes.js')
const paymentsRoutes = require('./routes/paymet.routes.js')
const analyticsRoutes = require('./routes/analytics.routes.js')
const couponRouter = require('./routes/coupon.routes.js')

const app = express()
app.use(cors())
ConnectDB()
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.get("/", (req ,res)=>{
    res.send("shopnet Backend properly working!")
})
app.use('/api/auth', authroutes)
app.use('/api/products' ,productRoutes )
app.use('/api/orders' ,orderRoutes )
app.use('/api/payments' ,paymentsRoutes )
app.use('/api/analytics' , analyticsRoutes )
app.use('/api/coupons' , couponRouter )

const PORT = process.env.PORT || 5000
app.listen(PORT , ()=>{
    console.log(`Server is running on port ${PORT}`)
})