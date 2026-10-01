const Product = require('../model/product.model.js')
const cloudinary = require('../config/cloudinary.js')
const streamifier = require('streamifier')

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "shopnet-products",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

//Get all Product
const getProducts = async (req , res)=>{
    try {
        const products = await Product.find({})
        .sort({createdAt: -1});

        return res.status(200).json({
            message:"Product fetched successfully",
            products
        })
    } catch (error) {
    console.log("Get products error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get products by Id
const getProductById = async (req ,res)=>{
    try{
        const product = await Product.findById(req.params.id);

        if(!product){
            return res.status(404).json({
                message:"Product not found"
            }) 
        }
        return res.status(200).json(product)
    }catch (error) {
    console.log("Get product by ID error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}

// create product
const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      stock,
      description,
      price,
    } = req.body;

    // Check required fields
    if (!name || !category || !stock || !description || !price) {
      return res.status(400).json({
        message: "All product fields are required",
      });
    }

    // Check image
    if (!req.file) {
      return res.status(400).json({
        message: "Product image is required",
      });
    }

    // Upload image to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer
    );

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      imageUrl: result.secure_url,
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });

  } catch (error) {
    console.log("Create product error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Update the Product
const updateProduct = async (req ,res)=>{
    try{
        const {
            name ,
            description , 
            price , 
            category , 
            stock
        } = req.body;

        const product = await Product.findById(req.params.id);

        if(!product){
            return res.status(400).json({
                message:"Product not found"
            });
        }

        // Update only fields that were provided
        if(name !== undefined){
            product.name = name;
        }

        if(description !== undefined){
            product.description = description;
        }

        if (price !== undefined) {
      product.price = Number(price);
        }

        if (category !== undefined) {
        product.category = category;
        }

        if (stock !== undefined) {
        product.stock = Number(stock);
        }

        //update image if new image is uploaded
        if(req.file){
            const result = await uploadToCloudinary(
                req.file.buffer
            );

            product.imageUrl = result.secure_url;
        }

        const updatedProduct = await product.save();

        return res.status(200).json({
            message:"Product update successfully",
            product: updatedProduct,
        })

    }catch (error) {
    console.log("Update product error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}

// delet the Product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    await product.deleteOne();

    return res.status(200).json({
      message: "Product successfully removed",
    });

  } catch (error) {
    console.log("Delete product error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports={
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
}