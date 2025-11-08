// src/pages/Cart.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import apiClient from '../config/api';
import { getStripe, DEFAULT_TEST_CARD } from '../config/payment';
import '../styles/payment.css';
import { testCartAndOrder } from '../utils/testOrdersAPI';
import { getFullImageUrl } from '../utils/imageUtils';
import useSEO from '../hooks/useSEO';

const Cart = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // SEO for Cart page
  useSEO({
    title: "Shopping Cart - Furniture Store",
    description: "Review your selected furniture items and proceed to secure checkout. Premium office and home furniture with fast delivery and great customer service.",
    keywords: "shopping cart, checkout, furniture purchase, office furniture, home furniture, secure payment"
  });
  
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    shippingAddress: '',
    billingAddress: '',
    paymentMethod: 'credit_card',
    phone: '',
    email: '',
    contactPerson: '',
    // Credit card fields
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    cardholderName: ''
  });
  const [processingOrder, setProcessingOrder] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [debugInfo, setDebugInfo] = useState({
    lastFetch: null,
    cartCleared: false,
    orderCreated: false
  });

  const fetchCartItems = async () => {
    try {
      console.log('Fetching cart items...');
      setDebugInfo(prev => ({ ...prev, lastFetch: new Date().toLocaleTimeString() }));
      const response = await apiClient.get('/cart');
      console.log('Cart response:', response.data);
      
      // Extract items from the nested cart structure
      if (response.data.success && response.data.cart && response.data.cart.items) {
        console.log(`Cart has ${response.data.cart.items.length} items`);
        setCartItems(response.data.cart.items);
      } else {
        console.log('No cart items found or invalid response structure');
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      setCartItems([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ No auth token found - user not logged in');
      setLoading(false);
      return;
    } else {
      console.log('✅ Auth token found:', token.substring(0, 20) + '...');
    }

    fetchCartItems();
  }, []);

  // Fetch user profile for address pre-population
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await apiClient.get('/users/profile');
        console.log('User profile for checkout:', response.data);
        setUserProfile(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      // Create form data for backend consistency
      const updateData = new URLSearchParams();
      updateData.append('quantity', newQuantity.toString());

      await apiClient({
        method: 'PUT',
        url: `/cart/items/${itemId}`,
        data: updateData.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      // Update local state
      setCartItems(cartItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await apiClient.delete(`/cart/items/${itemId}`);
      setCartItems(cartItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.productPrice * item.quantity), 0).toFixed(2);
  };

  const fillTestCardData = () => {
    setCheckoutData(prev => ({
      ...prev,
      cardNumber: DEFAULT_TEST_CARD.number,
      expiryDate: DEFAULT_TEST_CARD.expiry,
      cvc: DEFAULT_TEST_CARD.cvc,
      cardholderName: DEFAULT_TEST_CARD.name
    }));
  };

  const handleCheckout = () => {
    // Pre-populate form with user's profile data
    const updatedCheckoutData = { ...checkoutData };
    
    if (userProfile?.address) {
      updatedCheckoutData.shippingAddress = userProfile.address;
    }
    
    if (userProfile?.phone) {
      updatedCheckoutData.phone = userProfile.phone;
    }
    
    if (userProfile?.email) {
      updatedCheckoutData.email = userProfile.email;
    }
    
    // Set contact person as lastName + ' ' + firstName
    if (userProfile?.lastName || userProfile?.firstName) {
      const contactPersonName = [userProfile?.lastName, userProfile?.firstName]
        .filter(name => name && name.trim()) // Remove empty/null values
        .join(' ');
      updatedCheckoutData.contactPerson = contactPersonName;
    }
    
    setCheckoutData(updatedCheckoutData);
    setShowCheckoutForm(true);
  };

  const handleCheckoutFormSubmit = async (e) => {
    e.preventDefault();
    setProcessingOrder(true);
    setPaymentError('');

    // Store original cart items in case we need to restore on error
    const originalCartItems = [...cartItems];

    try {
      console.log('Starting checkout process...');

      // Validate form data
      if (!checkoutData.shippingAddress.trim()) {
        throw new Error('Shipping address is required');
      }
      if (!checkoutData.phone.trim()) {
        throw new Error('Phone number is required');
      }
      if (!checkoutData.email.trim()) {
        throw new Error('Email address is required');
      }
      if (!checkoutData.contactPerson.trim()) {
        throw new Error('Contact person is required');
      }

      // Validate credit card fields if payment method is credit card
      if (checkoutData.paymentMethod === 'credit_card') {
        if (!checkoutData.cardNumber.trim()) {
          throw new Error('Card number is required');
        }
        if (!checkoutData.expiryDate.trim()) {
          throw new Error('Expiry date is required');
        }
        if (!checkoutData.cvc.trim()) {
          throw new Error('CVC is required');
        }
        if (!checkoutData.cardholderName.trim()) {
          throw new Error('Cardholder name is required');
        }
      }

      // Step 1: Create order
      const orderData = new URLSearchParams();
      orderData.append('shippingAddress', checkoutData.shippingAddress);
      orderData.append('billingAddress', checkoutData.billingAddress || checkoutData.shippingAddress);
      orderData.append('paymentMethod', checkoutData.paymentMethod);
      orderData.append('contact_phone', checkoutData.phone);
      orderData.append('contact_email', checkoutData.email);
      orderData.append('contact_person', checkoutData.contactPerson);

      console.log('Creating order with data:', {
        shippingAddress: checkoutData.shippingAddress,
        billingAddress: checkoutData.billingAddress || checkoutData.shippingAddress,
        paymentMethod: checkoutData.paymentMethod,
        contact_phone: checkoutData.phone,
        contact_email: checkoutData.email,
        contact_person: checkoutData.contactPerson
      });

      // Check if we have auth token
      const token = localStorage.getItem('token');
      console.log('Auth token available:', token ? 'Yes' : 'No');
      if (token) {
        console.log('Token preview:', token.substring(0, 20) + '...');
      }

      const orderResponse = await apiClient.post('/orders', orderData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      console.log('Order response:', orderResponse.data);

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.error || 'Failed to create order');
      }

      const order = orderResponse.data.order;
      console.log('Order created successfully, ID:', order.id);
      setDebugInfo(prev => ({ ...prev, orderCreated: true }));

      // Don't clear cart yet - wait until payment is also successful
      
      // Step 2: Process payment if credit card
      if (checkoutData.paymentMethod === 'credit_card') {
        setProcessingPayment(true);
        console.log('Processing credit card payment...');
        
        console.log('⚠️ DEVELOPMENT MODE: Using simulated payment backend');
        console.log('🔄 Processing payment through backend APIs...');
        
        // Create payment intent
        const paymentIntentResponse = await apiClient.post(`/payment/create-intent?orderId=${order.id}`);

        if (!paymentIntentResponse.data.success) {
          throw new Error('Failed to create payment intent');
        }

        console.log('Payment intent created, confirming payment...');
        
        // Confirm payment
        const confirmResponse = await apiClient.post('/payment/confirm', 
          new URLSearchParams({
            paymentIntentId: paymentIntentResponse.data.data.paymentIntentId
          }).toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            }
          }
        );

        if (!confirmResponse.data.success) {
          throw new Error('Payment confirmation failed');
        }

        console.log('Payment simulation completed successfully');
      }

      // Only clear cart after BOTH order creation AND payment are successful
      console.log('Order and payment completed successfully, clearing cart...');
      setCartItems([]); // Clear cart since backend has cleared it
      setDebugInfo(prev => ({ ...prev, cartCleared: true }));
      setShowCheckoutForm(false);
      
      // Navigate to order confirmation or order history
      alert(`${t('paymentSuccess')} Order ID: ${order.id || 'N/A'}`);
      navigate('/order-history');
      
    } catch (error) {
      console.error('Checkout error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      
      let errorMessage = t('paymentError');
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setPaymentError(errorMessage);
      alert(errorMessage);
      
      // If there was an error, restore the original cart items
      // since the backend might have cleared the cart but the process failed
      console.log('Error occurred, restoring original cart items...');
      setCartItems(originalCartItems);
    } finally {
      setProcessingOrder(false);
      setProcessingPayment(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCheckoutData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <div>{t('loading')}</div>;

  // If no token, show login required message
  const token = localStorage.getItem('token');
  if (!token) {
    return (
      <div className="cart">
        <h1>{t('cart')}</h1>
        <div className="empty-cart">
          <p>{t('loginRequired')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <h1>{t('cart')}</h1>
      
      
      
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>{t('emptyCart')}</p>
          <button 
            onClick={() => navigate('/products')} 
            className="continue-shopping-btn"
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            {t('continueShopping')}
          </button>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  <img 
                    src={getFullImageUrl(item.productImageUrl)} 
                    alt={item.productAltTextEn} 
                    style={{width: '80px', height: '80px', objectFit: 'cover'}}
                  />
                </div>
                <div className="item-info">
                  <h3>{item.productNameEn}</h3>
                  <p className="chinese-name">{item.productNameZh}</p>
                  <p>${(item.productPrice).toFixed(2)}</p>
                </div>
                <div className="quantity-controls">
                  <button 
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
                <div className="item-total">
                  ${(item.productPrice * item.quantity).toFixed(2)}
                </div>
                <button onClick={() => removeItem(item.id)} className="remove-btn">
                  {t('remove')}
                </button>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <h3>{t('total')}: ${getTotalPrice()}</h3>
            <button 
              className="checkout-btn" 
              onClick={handleCheckout}
              disabled={processingOrder || processingPayment}
            >
              {processingOrder || processingPayment ? t('processing') + '...' : t('proceedToCheckout')}
            </button>
          </div>
        </div>
      )}

      {/* Checkout Form Modal */}
      {showCheckoutForm && (
        <div className="checkout-modal">
          <div className="checkout-form">
            <h2>{t('checkout')}</h2>
            <form onSubmit={handleCheckoutFormSubmit}>
              <div className="form-group">
                <label htmlFor="contactPerson">{t('contactPerson')}:</label>
                <input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  value={checkoutData.contactPerson}
                  onChange={handleInputChange}
                  required
                  placeholder={t('contactPersonPlaceholder')}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">{t('phone')}:</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={checkoutData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder={t('phonePlaceholder')}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">{t('email')}:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={checkoutData.email}
                  onChange={handleInputChange}
                  required
                  placeholder={t('emailPlaceholder')}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="shippingAddress">{t('shippingAddress')}:</label>
                <textarea
                  id="shippingAddress"
                  name="shippingAddress"
                  value={checkoutData.shippingAddress}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  placeholder={t('addressPlaceholder')}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="billingAddress">{t('billingAddress')}:</label>
                <textarea
                  id="billingAddress"
                  name="billingAddress"
                  value={checkoutData.billingAddress}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder={t('billingAddressPlaceholder')}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="paymentMethod">{t('paymentMethod')}:</label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={checkoutData.paymentMethod}
                  onChange={handleInputChange}
                  required
                >
                  <option value="credit_card">{t('creditCard')}</option>
                  {/* Temporarily hidden - Will implement later */}
                  {/* <option value="wechat_pay">{t('wechatPay')}</option> */}
                  {/* <option value="alipay_hk">{t('alipayHk')}</option> */}
                </select>
              </div>

              {/* Credit Card Fields - Show only when credit card is selected */}
              {checkoutData.paymentMethod === 'credit_card' && (
                <div className="credit-card-section">
                  <h4>{t('creditCard')} {t('details', 'Details')}</h4>
                  
                  <div className="test-card-helper">
                    <button 
                      type="button" 
                      onClick={fillTestCardData}
                      className="test-card-btn"
                    >
                      {t('useTestCard')}
                    </button>
                  </div>

                  <div className="form-group">
                    <label htmlFor="cardNumber">{t('cardNumber')}:</label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={checkoutData.cardNumber}
                      onChange={handleInputChange}
                      placeholder={t('cardNumberPlaceholder')}
                      maxLength="19"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group half-width">
                      <label htmlFor="expiryDate">{t('expiryDate')}:</label>
                      <input
                        type="text"
                        id="expiryDate"
                        name="expiryDate"
                        value={checkoutData.expiryDate}
                        onChange={handleInputChange}
                        placeholder={t('expiryPlaceholder')}
                        maxLength="5"
                        required
                      />
                    </div>

                    <div className="form-group half-width">
                      <label htmlFor="cvc">{t('cvc')}:</label>
                      <input
                        type="text"
                        id="cvc"
                        name="cvc"
                        value={checkoutData.cvc}
                        onChange={handleInputChange}
                        placeholder={t('cvcPlaceholder')}
                        maxLength="4"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="cardholderName">{t('cardholderName')}:</label>
                    <input
                      type="text"
                      id="cardholderName"
                      name="cardholderName"
                      value={checkoutData.cardholderName}
                      onChange={handleInputChange}
                      placeholder={t('cardholderPlaceholder')}
                      required
                    />
                  </div>

                  {paymentError && (
                    <div className="payment-error">
                      {paymentError}
                    </div>
                  )}
                </div>
              )}

              {/* WeChat Pay Section - Temporarily hidden (will implement later) */}
              {/* {checkoutData.paymentMethod === 'wechat_pay' && (
                <div className="wechat-pay-section">
                  <h4>{t('wechatPay')} 微信支付</h4>
                  <div className="payment-method-info">
                    <div className="wechat-icon">📱</div>
                    <p>請在手機上使用微信掃描QR碼完成付款</p>
                    <p>Please use WeChat on your phone to scan the QR code for payment</p>
                    <div className="qr-placeholder">
                      <div className="qr-code-simulator">
                        <div className="qr-grid">
                          {Array.from({length: 64}).map((_, i) => (
                            <div key={i} className={`qr-dot ${Math.random() > 0.5 ? 'filled' : ''}`}></div>
                          ))}
                        </div>
                        <p className="qr-label">WeChat Pay QR Code</p>
                        <p className="amount-label">Amount: ${getTotalPrice()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )} */}

              {/* Alipay HK Section - Temporarily hidden (will implement later) */}
              {/* {checkoutData.paymentMethod === 'alipay_hk' && (
                <div className="alipay-hk-section">
                  <h4>{t('alipayHk')} 支付寶香港</h4>
                  <div className="payment-method-info">
                    <div className="alipay-icon">💳</div>
                    <p>請使用支付寶香港應用程式掃描QR碼或點擊按鈕前往付款頁面</p>
                    <p>Please use Alipay HK app to scan QR code or click button to go to payment page</p>
                    <div className="alipay-options">
                      <button type="button" className="alipay-button">
                        前往支付寶付款 / Go to Alipay Payment
                      </button>
                      <div className="qr-placeholder">
                        <div className="qr-code-simulator alipay">
                          <div className="qr-grid">
                            {Array.from({length: 64}).map((_, i) => (
                              <div key={i} className={`qr-dot ${Math.random() > 0.4 ? 'filled' : ''}`}></div>
                            ))}
                          </div>
                          <p className="qr-label">Alipay HK QR Code</p>
                          <p className="amount-label">Amount: ${getTotalPrice()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )} */}
              
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setShowCheckoutForm(false)}
                  disabled={processingOrder || processingPayment}
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit" 
                  disabled={processingOrder || processingPayment}
                >
                  {processingPayment ? t('paymentProcessing') : 
                   processingOrder ? t('processing') : 
                   `${t('placeOrder')} ($${getTotalPrice()})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;