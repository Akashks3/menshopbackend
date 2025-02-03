const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true, 
    required: true,
    default: () => `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}` 
},
    shippingData: {
        name: String,
        mobile: String,
        pincode: String,
        address: String,
        locality: String,
        city: String,
        state: String,
        label: String,
    },
    cartItems: [
        {
            name: String,
            price: {
                sp: Number, // Assuming 'sp' is the selling price
            },
            qty: Number,
        }
    ],
    total: Number,
    orderDate: {
        type: Date,
        default: Date.now,
    },
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
