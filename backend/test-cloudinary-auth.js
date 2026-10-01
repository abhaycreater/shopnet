require("dotenv").config();

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testAuth() {
  try {
    const result = await cloudinary.api.ping();

    console.log("CLOUDINARY AUTH SUCCESS ✅");
    console.log(result);
  } catch (error) {
    console.log("CLOUDINARY AUTH ERROR ❌");
    console.dir(error, { depth: null });
  }
}

testAuth();