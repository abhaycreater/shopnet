require("dotenv").config();

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testUpload() {
  try {
    console.log("Testing Cloudinary upload...");

    const result = await cloudinary.uploader.upload(
      "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      {
        folder: "shopnet",
      }
    );

    console.log("UPLOAD SUCCESS ✅");
    console.log("URL:", result.secure_url);
  } catch (error) {
    console.log("UPLOAD ERROR ❌");
    console.dir(error, { depth: null });
  }
}

testUpload();