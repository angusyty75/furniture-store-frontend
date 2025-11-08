// src/pages/OrderHistory.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import apiClient from '../config/api';
import './OrderHistory.css';

const OrderHistory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await apiClient.get('/orders');
        console.log('Orders response:', response.data);
        
        // Handle API response structure
        if (response.data.success && response.data.orders) {
          console.log('Orders array:', response.data.orders);
          console.log('First order details:', response.data.orders[0]);
          
          // Debug date format
          if (response.data.orders[0]) {
            console.log('Order date formats:', {
              createdAt: response.data.orders[0].createdAt,
              orderDate: response.data.orders[0].orderDate,
              created_at: response.data.orders[0].created_at
            });
          }
          
          if (response.data.orders[0]?.items) {
            console.log('First order items:', response.data.orders[0].items);
            const firstItem = response.data.orders[0].items[0];
            console.log('First item details:', firstItem);
            console.log('First item ALL fields:', Object.keys(firstItem || {}));
            console.log('First item price fields:', {
              productPrice: firstItem?.productPrice,
              price: firstItem?.price,
              amount: firstItem?.amount,
              unitPrice: firstItem?.unitPrice,
              total: firstItem?.total,
              quantity: firstItem?.quantity
            });
          }
          setOrders(response.data.orders);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const formatDate = (dateData) => {
    try {
      // Handle different date formats from backend
      if (Array.isArray(dateData)) {
        // Java LocalDateTime format: [year, month, day, hour, minute, second?, nanosecond?]
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateData;
        // Note: JavaScript months are 0-indexed, so subtract 1 from month
        const date = new Date(year, month - 1, day, hour, minute, second);
        return date.toLocaleDateString();
      } else if (typeof dateData === 'string') {
        // Handle ISO string format
        const date = new Date(dateData);
        return date.toLocaleDateString();
      } else {
        // Handle timestamp or other formats
        const date = new Date(dateData);
        return date.toLocaleDateString();
      }
    } catch (error) {
      console.error('Error formatting date:', error, 'dateData:', dateData);
      return 'Invalid Date';
    }
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const getStatusText = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return t('statusPending');
      case 'processing': return t('statusProcessing');
      case 'shipped': return t('statusShipped');
      case 'delivered': return t('statusDelivered');
      case 'cancelled': return t('statusCancelled');
      default: return status;
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0.00';
    // If price is in cents (> 1000), convert to dollars
    const numPrice = Number(price);
    if (numPrice > 1000) {
      return (numPrice / 100).toFixed(2);
    }
    return numPrice.toFixed(2);
  };

  if (loading) return <div>{t('loading')}</div>;

  return (
    <div className="order-history">
      <div className="orders-container">
        <h1>{t('orderHistory')}</h1>
        
        {orders.length === 0 ? (
          <div className="no-orders">
            <p>{t('noOrders')}</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>{t('orderNumber')}{order.id}</h3>
                    <p className="order-date">
                      {t('orderedOn')} {formatDate(order.createdAt || order.orderDate || order.created_at)}
                    </p>
                  </div>
                  <div className="order-status">
                    <span className={`status ${getStatusClass(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>
                
                <div className="order-items">
                  {order.items && order.items.map((item, index) => (
                    <div key={item.id || index} className="order-item">
                      <div className="item-info">
                        <h4>{item.productNameEn || item.productName || item.name || `Product ID: ${item.productId}` || 'Unknown Product'}</h4>
                        <p>{t('quantity')}: {item.quantity || 0}</p>
                      </div>
                      <div className="item-price">
                        ${(() => {
                          // Try different possible price field names
                          const unitPrice = item.productPrice || item.price || item.unitPrice || item.amount || 0;
                          const quantity = item.quantity || 1;
                          
                          // Don't divide by 100 - backend likely sends prices in dollars already
                          const finalPrice = unitPrice * quantity;
                          
                          return finalPrice.toFixed(2);
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="order-total">
                  <strong>{t('total')}: ${(order.totalAmount || 0).toFixed(2)}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;