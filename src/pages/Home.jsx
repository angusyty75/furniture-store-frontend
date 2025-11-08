// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { testBackendConnection, testProxyConnection, testDirectConnection } from '../utils/backendTest';
import { testConnections, explainResults } from '../utils/connectionTester';
import { getFullImageUrl } from '../utils/imageUtils';
import apiClient from '../config/api.js';
import useSEO from '../hooks/useSEO';
import StructuredData, { createOrganizationSchema, createWebsiteSchema } from '../components/StructuredData';

const Home = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  
  // SEO for Home page
  useSEO({
    title: "Home - Premium Furniture Store",
    description: "Welcome to our premium furniture store. Discover modern office desks, ergonomic chairs, and stylish home furniture. Fast delivery and great prices!",
    keywords: "furniture store, office furniture, home furniture, desks, chairs, modern furniture, premium furniture, fast delivery"
  });
  
  const [connectionStatus, setConnectionStatus] = useState({
    backend: null,
    proxy: null,
    direct: null
  });
  const [latestProducts, setLatestProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Restore scroll position if navigated back from product detail
  useEffect(() => {
    const restorePosition = location.state?.restoreScrollPosition;
    console.log('🔄 Home: Checking for scroll restoration');
    console.log('🔄 Location state:', location.state);
    console.log('🔄 Restore position:', restorePosition);
    
    if (restorePosition) {
      console.log('🔄 Restoring scroll position:', restorePosition);
      // Use setTimeout to ensure DOM is rendered
      setTimeout(() => {
        window.scrollTo(restorePosition.x, restorePosition.y);
        console.log('✅ Scroll position restored to:', restorePosition);
      }, 100); // Increased timeout to ensure DOM is ready
      
      // Clean up the state to prevent restoration on subsequent renders
      window.history.replaceState(
        { ...location.state, restoreScrollPosition: null }, 
        '', 
        location.pathname + location.search
      );
    }
  }, [location.state]);

  useEffect(() => {
    // Check login status
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };

    checkLoginStatus();

    // Listen for storage changes
    const handleStorageChange = () => {
      checkLoginStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    // Fetch latest products
    fetchLatestProducts();
    
    // Connection tests disabled to avoid CORS errors in console
    // Uncomment below to run connection diagnostics
    /*
    const runTests = async () => {
      console.log('🚀 Running connection tests...');
      
      const backendTest = await testBackendConnection();
      const proxyTest = await testProxyConnection();
      const directTest = await testDirectConnection();
      
      setConnectionStatus({
        backend: backendTest,
        proxy: proxyTest,
        direct: directTest
      });
    };

    runTests();
    */
  }, []);

  const fetchLatestProducts = async () => {
    setLoadingProducts(true);
    try {
      // Use dynamic API base URL instead of hardcoded port
      const response = await apiClient.get('/products?limit=3');
      setLatestProducts(response.data);
      console.log('✅ Latest products loaded:', response.data.length);
    } catch (error) {
      console.error('Failed to fetch latest products:', error);
      setLatestProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const runDetailedTests = async () => {
    console.log('🔬 Running detailed connection tests...');
    const results = await testConnections();
    explainResults(results);
  };

  return (
    <div className="home">
      <div className="hero-section">
        <h1>{t('welcome')}</h1>
        <p>Discover our beautiful furniture collection</p>
        <Link to="/products" className="cta-button">
          {t('categories')}
        </Link>
      </div>

      {/* Latest Products Section */}
      <div className="latest-products-section">
        <div className="latest-products-container">
          <h2>{t('home.latestProducts.title', 'Latest Products')}</h2>
          <p className="section-description">{t('home.latestProducts.description', 'Check out our newest arrivals')}</p>
          
          {loadingProducts ? (
            <div className="loading-products">
              <div className="loading-spinner"></div>
              <p>{t('loading', 'Loading...')}</p>
            </div>
          ) : (
            <div className="latest-products-grid">
              {latestProducts.map((product) => (
                <div key={product.id} className="latest-product-card">
                  <div className="product-image">
                    <img src={getFullImageUrl(product.images && product.images[0] ? product.images[0].imageUrl : '/images/placeholder.jpg')} alt={product.name} />
                    <div className="product-overlay">
                      <button
                        className="view-product-btn"
                        onClick={() => {
                          // Capture current scroll position at click time
                          const currentScrollPosition = {
                            x: window.pageXOffset || document.documentElement.scrollLeft,
                            y: window.pageYOffset || document.documentElement.scrollTop
                          };
                          
                          console.log('🔄 Home: Capturing scroll position:', currentScrollPosition);
                          
                          // Navigate with state containing scroll position
                          navigate(`/products/${product.slug || product.id}`, {
                            state: {
                              from: {
                                pathname: location.pathname,
                                search: location.search,
                                state: location.state,
                                scrollPosition: currentScrollPosition
                              }
                            }
                          });
                          
                          // Also store in sessionStorage as backup
                          sessionStorage.setItem('previousScrollPosition', JSON.stringify({
                            pathname: location.pathname,
                            search: location.search,
                            scrollPosition: currentScrollPosition
                          }));
                        }}
                      >
                        {t('home.latestProducts.viewProduct', 'View Product')}
                      </button>
                    </div>
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">
                      {i18n.language === 'zh' ? (product.nameZh || product.name) : (product.nameEn || product.name)}
                    </h3>
                    <p className="product-description">
                      {i18n.language === 'zh' ? (product.descriptionZh || product.description) : (product.descriptionEn || product.description)}
                    </p>
                    <div className="product-price">
                      <span className="price">${product.price}</span>
                      <div className="product-actions">
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            // Capture current scroll position at click time
                            const currentScrollPosition = {
                              x: window.pageXOffset || document.documentElement.scrollLeft,
                              y: window.pageYOffset || document.documentElement.scrollTop
                            };
                            
                            console.log('🔄 Home: Capturing scroll position (btn):', currentScrollPosition);
                            
                            // Navigate with state containing scroll position
                            navigate(`/products/${product.slug || product.id}`, {
                              state: {
                                from: {
                                  pathname: location.pathname,
                                  search: location.search,
                                  state: location.state,
                                  scrollPosition: currentScrollPosition
                                }
                              }
                            });
                            
                            // Also store in sessionStorage as backup
                            sessionStorage.setItem('previousScrollPosition', JSON.stringify({
                              pathname: location.pathname,
                              search: location.search,
                              scrollPosition: currentScrollPosition
                            }));
                          }}
                        >
                          {t('viewDetails')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="view-all-products">
            <Link to="/products" className="view-all-btn">
              {t('home.latestProducts.viewAll', 'View All Products')}
            </Link>
          </div>
        </div>
      </div>
      
           
      {/* Features Section */}
      <div className="features-section">
        <div className="features-container">
          <div className="feature-item">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8z"/>
                <path d="M3.27 6.96L12 12.01l8.73-5.05"/>
                <path d="M12 22.08V12"/>
              </svg>
            </div>
            <h3>{t('home.features.freeShipping.title', '免費送貨')}</h3>
            <p>{t('home.features.freeShipping.description', '訂購滿3000免運費')}</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
              </svg>
            </div>
            <h3>{t('home.features.qualityGuarantee.title', '品質保證')}</h3>
            <p>{t('home.features.qualityGuarantee.description', '所有產品品質保證')}</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <h3>{t('home.features.returns.title', '30天退貨')}</h3>
            <p>{t('home.features.returns.description', '不滿意30天內退貨')}</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"/>
              </svg>
            </div>
            <h3>{t('home.features.support.title', '線上客服')}</h3>
            <p>{t('home.features.support.description', '專業客服為您服務')}</p>
          </div>
        </div>
      </div>

      {/* Site Map / Footer Info Section */}
      <div className="sitemap-section">
        <div className="sitemap-container">
          <div className="sitemap-column">
            <h3>{t('home.sitemap.company.title', '優質傢俱')}</h3>
            <p>{t('home.sitemap.company.description', '為您提供最優質的傢俱選擇，打造舒適美好的生活。')}</p>
            <div className="social-links">
              <a 
                href="https://wa.me/85251121555?text=Hello! I'm interested in your furniture products." 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                title="WhatsApp: +852 5112-1555"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                </svg>
              </a>
              <a 
                href="https://www.facebook.com/angus.yu.505" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Facebook"
                title="Follow us on Facebook"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="sitemap-column">
            <h3>{t('home.sitemap.quickLinks.title', '快速連結')}</h3>
            <ul>
              <li><Link to="/">{t('home.sitemap.quickLinks.home', '首頁')}</Link></li>
              <li><Link to="/products">{t('home.sitemap.quickLinks.products', '所有產品')}</Link></li>
              <li><Link to="/about">{t('home.sitemap.quickLinks.about', '關於我們')}</Link></li>
              <li><Link to="/contact">{t('home.sitemap.quickLinks.contact', '聯絡我們')}</Link></li>
            </ul>
          </div>

          <div className="sitemap-column">
            <h3>{t('home.sitemap.customerService.title', '客戶服務')}</h3>
            <ul>
              <li><Link to="/cart">{t('home.sitemap.customerService.cart', '購物車')}</Link></li>
              {isLoggedIn && (
                <li><Link to="/order-history">{t('home.sitemap.customerService.orders', '訂單查詢')}</Link></li>
              )}
              <li><Link to="/ai-assistant">{t('home.sitemap.customerService.aiAssistant', '線上客服')}</Link></li>
              <li><Link to="/contact">{t('home.sitemap.customerService.returns', '退換貨政策')}</Link></li>
              <li><Link to="/contact">{t('home.sitemap.customerService.help', '隱私政策')}</Link></li>
            </ul>
          </div>

          <div className="sitemap-column">
            <h3>{t('home.sitemap.contact.title', '聯絡資訊')}</h3>
            <div className="contact-info">
              <p>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <a 
                  href="https://maps.google.com/?q=100+Canton+Road+Harbour+City+Tsim+Sha+Tsui+Kowloon+Hong+Kong" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="address-link"
                >
                  {t('home.sitemap.contact.address', '香港九龍尖沙咀廣東道100號 港威大廈10樓A室')}
                </a>
              </p>
              <p>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <a 
                  href="https://wa.me/85251121555?text=Hello! I'm interested in your furniture products." 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="whatsapp-link"
                >
                  {t('home.sitemap.contact.whatsapp', '+852 5112-1555 (WhatsApp)')}
                </a>
              </p>
              <p>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <a 
                  href="mailto:angusyty175@gmail.com"
                  className="email-link"
                >
                  {t('home.sitemap.contact.email', 'angusyty175@gmail.com')}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Data for Home page */}
      <StructuredData data={createOrganizationSchema()} />
      <StructuredData data={createWebsiteSchema()} />
    </div>
  );
};

export default Home;