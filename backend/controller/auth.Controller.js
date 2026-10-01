const User = require("../model/user.model.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendEmail = require("../util/sendEmail.js");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// For register the user
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {

    if(!name || !email || !password){
      return res.status(400).json({
        message:"Name ,email and password are required"
      })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase(), });
    
    if (existingUser) {
      return res.status(400).json({
         message: "User already exiest!" 
        });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Generate Otp
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    //otp expires after 10 minutes
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000)

    // Create User
    const user = await User.create({ 
      name,
      email : email.toLowerCase(), 
      password: hashPassword,
      verified: false,
      otp: otp,
      otpExpires: otpExpires
    });

    if (user) {
      const message = `
        Welcome to ShopNet, ${name}!

        Thank you for registering with us.

        To complete your registration, please use the following One-Time Password (OTP):

        Your OTP for ShopNet registration is: ${otp}

        This OTP will expire in 10 minutes.

        If you did not create this account, please ignore this email.
        `;

      await sendEmail(
        email,
        "Welcome to ShopNet - Your otp is here for Registration",
        message,
      );

       return res.status(201).json({
        message:"Registration Successful. OTP sent to your email.",
        _id : user._id,
        email: user.email
      });
    }
    return res.status(401).json({
      message: "user data not found!" 
    });
      
  } catch (error) {
    return res.status(500).json({ 
      message: "server error", 
      error: error.message });
  }
};

// For login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    // user doesn't exist

    if(!user){
      return res.status(401).json({
        message:"Invalied email or password "
      })
    }

    // User exists but email is not verified 
    if(!user.verified){
      return res.status(401).json({
        message: "Please verify your email using OTP before logging in"
      })
    }
    
    // check password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if(!isPasswordCorrect){
      return res.status(401).json({
        message:"Invalied email and password"
      })
    }

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email : user.email,
      role: user.role,
      token: generateToken(user._id)
    })
  } catch (error) {
    console.log("Login error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// for Get User
const getUser = async (req, res) => {
  try {
    const users = await User.find({})
    .select("-password -otp -otpExpires")
    .sort({createdAt: -1});

    return res.status(200).json({
      message:"User fetched successfully",
      users
    })
  }catch (error) {
    console.log("Get users error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const verifyOTP = async (req ,res)=>{
  const {email ,otp}= req.body;

  try{

    if(!email || !otp){
      return res.status(400).json({
        message: "Email and OTP are required"
      })
    }

    const user = await User.findOne({email: email.toLowerCase()})

    if(!user){
      return res.status(404).json({
        message:"User Not Found!"
      })
    }

    // Already verified
    if(user.verified){
      return res.status(400).json({
        message:"User is Already verified!"
      })
    }

    // Check otp
    if(user.otp !== otp){
      return res.status(400).json({
        message:"Invalied OTP!"
      })
    }

    //check otp expiry
    if(!user.otpExpires || user.otpExpires < new Date()){
      return res.status(400).json({
        message:"OTP has expired"
      })
    }

    //verify user
    user.verified = true;

    //Remove OTP after successful verification
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    return res.status(200).json({
      message:"Email verified successfully!",
      token :generateToken(user._id)
    })
  }catch(error){
    return res.status(500).json({
      message: "Server Error",
      error: error.message
    })
  }
}

const resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    // 1. Check email
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // 2. Find user
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 3. Check if already verified
    if (user.verified) {
      return res.status(400).json({
        message: "Email is already verified",
      });
    }

    // 4. Generate new OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // 5. Set new expiry time
    const otpExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // 6. Save new OTP
    user.otp = otp;
    user.otpExpires = otpExpires;

    await user.save();

    // 7. Send new OTP email
    const message = `
Hello ${user.name},

Your new ShopNet verification OTP is:

${otp}

This OTP will expire in 10 minutes.

If you did not request this OTP, please ignore this email.
`;

    await sendEmail(
      user.email,
      "ShopNet - Resend OTP",
      message
    );

    // 8. Send response
    return res.status(200).json({
      message: "New OTP sent successfully",
    });

  } catch (error) {
    console.log("Resend OTP error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};



module.exports = {
  registerUser,
  loginUser,
  getUser,
  verifyOTP,
  resendOTP
};
