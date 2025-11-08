// Mock backend server for development
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 8080;

// Enable CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock data
let mockCart = {
  id: 1,
  userId: 1,
  items: [
    {
      id: 1,
      productId: 1,
      productNameEn: "Modern Sofa",
      productNameZh: "現代沙發",
      productImageUrl: "/images/sofa1.jpg",
      productAltTextEn: "Modern comfortable sofa",
      productAltTextZh: "現代舒適沙發",
      quantity: 2,
      price: 899.99
    },
    {
      id: 2,
      productId: 2,
      productNameEn: "Dining Table",
      productNameZh: "餐桌",
      productImageUrl: "/images/table1.jpg",
      productAltTextEn: "Wooden dining table",
      productAltTextZh: "木製餐桌",
      quantity: 1,
      price: 599.99
    }
  ]
};

let mockOrders = [];
let orderIdCounter = 1000;

// Cart endpoints
app.get('/furniture-store/api/cart', (req, res) => {
  console.log('GET /cart - Returning mock cart data');
  res.json({
    success: true,
    cart: mockCart
  });
});

// Order endpoints
app.post('/furniture-store/api/orders', (req, res) => {
  console.log('POST /orders - Creating order with data:', req.body);
  
  // Simulate order creation
  const newOrder = {
    id: orderIdCounter++,
    userId: 1,
    items: [...mockCart.items],
    shippingAddress: req.body.shippingAddress,
    billingAddress: req.body.billingAddress,
    paymentMethod: req.body.paymentMethod,
    contactPhone: req.body.contact_phone,
    contactEmail: req.body.contact_email,
    contactPerson: req.body.contact_person,
    status: 'pending',
    createdAt: new Date().toISOString(),
    total: mockCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  };
  
  mockOrders.push(newOrder);
  
  // Clear cart after order creation (simulate backend behavior)
  mockCart.items = [];
  
  res.json({
    success: true,
    order: newOrder,
    message: 'Order created successfully'
  });
});

// Payment endpoints
app.post('/furniture-store/api/payment/create-intent', (req, res) => {
  const orderId = req.query.orderId;
  console.log('POST /payment/create-intent for order:', orderId);
  
  res.json({
    success: true,
    data: {
      paymentIntentId: `pi_test_${Date.now()}`,
      clientSecret: `pi_test_${Date.now()}_secret_${Math.random()}`
    }
  });
});

app.post('/furniture-store/api/payment/confirm', (req, res) => {
  const paymentIntentId = req.body.paymentIntentId;
  console.log('POST /payment/confirm for intent:', paymentIntentId);
  
  res.json({
    success: true,
    data: {
      paymentIntentId: paymentIntentId,
      status: 'succeeded'
    },
    message: 'Payment confirmed successfully'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock backend server running on http://localhost:${PORT}`);
  console.log(`📡 Serving furniture-store API endpoints:`);
  console.log(`   GET  /furniture-store/api/cart`);
  console.log(`   POST /furniture-store/api/orders`);
  console.log(`   POST /furniture-store/api/payment/create-intent`);
  console.log(`   POST /furniture-store/api/payment/confirm`);
});

export default app;