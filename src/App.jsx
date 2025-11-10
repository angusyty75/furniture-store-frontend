// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/config';
import Header from './components/Header';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Contact from './pages/Contact';
import About from './pages/About';
import Cart from './pages/Cart';
import CartTest from './pages/CartTest';
import Login from './pages/Login';
import Register from './pages/Register';
import UserProfile from './pages/UserProfile';
import OrderHistory from './pages/OrderHistory';
import AIAssistant from './components/AIAssistant';
import './App.css';
import './AIAssistant.css';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import analytics from './utils/analytics';

function App() {
  // Simplified: No prefix for easier development and CORS handling
  const basename = '';
  
  return (
    <I18nextProvider i18n={i18n}>
      <Router basename={basename}>
        <div className="App">
          <Header />
          {/* Track page views on route change */}
          <RouteChangeTracker />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/products/:slug" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/cart-test" element={<CartTest />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/orders" element={<OrderHistory />} />
              <Route path="/order-history" element={<OrderHistory />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
            </Routes>
          </main>
        </div>
      </Router>
    </I18nextProvider>
  );
}

export default App;

function RouteChangeTracker() {
  const location = useLocation();
  useEffect(() => {
    analytics.pageview(location.pathname + location.search);
  }, [location]);
  return null;
}