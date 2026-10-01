const express = require('express')
const router = express.Router()
const {registerUser , loginUser , getUser , verifyOTP, resendOTP} = require('../controller/auth.Controller.js')
const { protect } = require('../middleware/authMiddleware.js')
const { admin } = require('../middleware/adminMiddleware.js')



router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/users', protect ,admin, getUser)
router.post('/verify-otp', verifyOTP)
router.post('/resend-otp',resendOTP)

module.exports = router