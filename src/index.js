const express = require("express");
const passport = require('passport');
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const bodyParser = require('body-parser');
const app = express();
const EcommerceProducts = require("./models/ProductsModal");
const product = require("./data/menjeans");
const productApi = require("./controllers/ProductsController");
const Order = require("./models/order"); 
const port = process.env.PORT || 5000;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const razorpay = new Razorpay({
  key_id: 'rzp_test_Xa1fAmRtAIprCh', 
  key_secret: 'KghJQawmh1ssLtq5374KPkfO', 
});

app.use(express.json());
app.use(cors());

app.use(bodyParser.json());


app.post('/api/orders', async (req, res) => {
    const { shippingData, cartItems, total } = req.body;

    const newOrder = {
        shippingData,
        cartItems,
        total,
        orderDate: new Date().toISOString(),
    };

    try {
        // Use Mongoose to insert the order into the database
        const order = await Order.create(newOrder); // Alternatively, you can use insertMany if you need to insert multiple orders

        console.log('New Order Received and saved:', order);

        res.status(201).json({ message: 'Order submitted successfully!', order });
    } catch (error) {
        console.error('Error saving the order:', error.message);
        res.status(500).json({ message: 'Error submitting the order.', error: error.message });
    }
});




app.get('/', (req, res) => {
    res.send('Server is running...');
});

app.post('/api/payment', async (req, res) => {
  const { amount } = req.body;

  try {
    
    const order = await razorpay.orders.create({
      amount: amount * 100, 
      currency: 'INR',
      receipt: crypto.randomBytes(10).toString('hex'),
      payment_capture: 1,
    });
    res.json(order);
  } catch (error) {
    console.error('Error creating order:', error.message); 
    res.status(500).json({ message: 'Error creating Razorpay order', error: error.message });
  }
});

app.post('/api/payment/verify', (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  const secret = 'KghJQawmh1ssLtq5374KPkfO';

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
  const generated_signature = hmac.digest('hex');

  if (generated_signature === razorpay_signature) {
    res.json({ message: 'Payment verified successfully' });
  } else {
    res.status(400).json({ message: 'Payment verification failed' });
  }
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
})
.then(() => {
  console.log("MongoDB connected successfully");
  addMultipleProducts(product);
})
.catch(err => {
  console.error("MongoDB connection error:", err);
});


const addMultipleProducts = async (products) => {
  try {
    const savedProducts = await EcommerceProducts.insertMany(products);
    console.log("New products added:", savedProducts);
  } catch (error) {
    console.error("Error adding products:", error);
  }
}


const { register, login, newToken } = require("./controllers/auth.controller");
app.post("/register", register);
app.post("/login", login);

app.use("/product", productApi);

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
 
const ensureAuthenticated=(req, res, next) =>{
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

app.get('/profile', ensureAuthenticated, (req, res) => {
  res.send('This is your profile page.');
});

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('');
  }
);
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://unrivaled-taiyaki-6d08b0.netlify.app/auth/google/callback",
  scope: ['profile', 'email'] 
},
  function (accessToken, refreshToken, profile, done) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
