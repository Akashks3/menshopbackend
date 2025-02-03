const mongoose = require("mongoose");


const EcommerceProductsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: {
      mrp: { type: Number, required: true },
      discount: { type: Number, required: true },
      sp: { type: Number, required: true }
    },
    brand_name: { type: String, required: true },
    sizes: { type: [Number], required: true },
    customer_rating: { type: Number, required: true },
    product_details: { type: [String], required: true },
    images: { type: [String], required: true },
    tag: { type: String, required: true }
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const EcommerceProducts = mongoose.model("product", EcommerceProductsSchema);
module.exports = EcommerceProducts;