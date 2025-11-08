// src/pages/ProductList.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../config/api';
import { getFullImageUrl } from '../utils/imageUtils';
import useSEO from '../hooks/useSEO';

const ProductList = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // SEO for Product List page
  useSEO({
    title: "All Products - Premium Furniture Collection",
    description: "Browse our complete collection of premium furniture. Office desks, ergonomic chairs, home furniture, and more. Quality furniture at competitive prices with fast shipping.",
    keywords: "furniture collection, all products, office furniture, home furniture, desks, chairs, tables, premium furniture, furniture catalog"
  });
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Initialize filter states from URL parameters
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  // Sync component state with URL parameters on navigation
  useEffect(() => {
    const urlCategory = searchParams.get('category') || 'all';
    const urlSearch = searchParams.get('search') || '';
    
    console.log('🔄 ProductList: Syncing URL params');
    console.log('🔄 URL Category:', urlCategory);
    console.log('🔄 URL Search:', urlSearch);
    
    setSelectedCategory(urlCategory);
    setSearchTerm(urlSearch);
  }, [searchParams]);

  // Restore scroll position if navigated back from product detail
  useEffect(() => {
    const restorePosition = location.state?.restoreScrollPosition;
    console.log('🔄 ProductList: Checking for scroll restoration');
    console.log('🔄 Location state:', location.state);
    console.log('🔄 Restore position:', restorePosition);
    
    if (restorePosition) {
      console.log('🔄 Restoring scroll position:', restorePosition);
      // Use setTimeout to ensure DOM is rendered and filters are applied
      setTimeout(() => {
        window.scrollTo(restorePosition.x, restorePosition.y);
        console.log('✅ Scroll position restored to:', restorePosition);
      }, 200); // Increased timeout to ensure filtered products are rendered
      
      // Clean up the state to prevent restoration on subsequent renders
      window.history.replaceState(
        { ...location.state, restoreScrollPosition: null }, 
        '', 
        location.pathname + location.search
      );
    }
  }, [location.state, filteredProducts]); // Added filteredProducts dependency

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('🔄 Fetching products from:', `/products?lang=${i18n.language}`);
        const response = await apiClient.get(`/products?lang=${i18n.language}`);
        console.log('✅ Products fetched successfully:', response.data);
        setProducts(response.data);
        setError(null);
      } catch (error) {
        console.error('❌ Error fetching products:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          url: error.config?.url
        });
        
        setError(`Failed to load products: ${error.message}`);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [i18n.language]);

  // Filter and search products
  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.categoryId === parseInt(selectedCategory)
      );
    }

    // Filter by search term - search only in product names (both English and Chinese)
    if (searchTerm.trim()) {
      const searchTermLower = searchTerm.toLowerCase();
      console.log('🔍 Searching for:', searchTermLower, 'in language:', i18n.language);
      
      filtered = filtered.filter(product => {
        // Get only name fields (no descriptions for more precise results)
        const nameEn = (product.nameEn || product.name || '').toLowerCase();
        const nameZh = (product.nameZh || product.name || '').toLowerCase();
        
        // Search only in name fields regardless of current language
        const matchesName = nameEn.includes(searchTermLower) || nameZh.includes(searchTermLower);
        
        if (matchesName) {
          console.log('✅ Match found in product:', product.id, 'nameEn:', nameEn, 'nameZh:', nameZh);
        }
        
        return matchesName;
      });
      
      console.log('🔍 Search results:', filtered.length, 'products found');
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm, i18n.language]);

  const categories = [
    { id: 'all', nameEn: 'All Products', nameZh: '所有產品' },
    { id: '6', nameEn: 'Fabric Sofas', nameZh: '布藝沙發' },
    { id: '7', nameEn: 'Leather Sofas', nameZh: '皮革沙發' },
    { id: '8', nameEn: 'Sectional Sofas', nameZh: 'L型沙發' },
    { id: '9', nameEn: 'Recliner Sofas', nameZh: '電動沙發' },
    { id: '2', nameEn: 'Dining Tables', nameZh: '餐桌' },
    { id: '10', nameEn: 'Wooden Dining Tables', nameZh: '實木餐桌' },
    { id: '16', nameEn: 'Storage Beds', nameZh: '收納床' },
    { id: '4', nameEn: 'Cabinets & Storage', nameZh: '櫃子與收納' },
    { id: '19', nameEn: 'Bookshelves', nameZh: '書架' },
    { id: '5', nameEn: 'Office Furniture', nameZh: '辦公傢俱' }
  ];

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    
    // Update URL parameters
    const newSearchParams = new URLSearchParams(searchParams);
    if (categoryId === 'all') {
      newSearchParams.delete('category');
    } else {
      newSearchParams.set('category', categoryId);
    }
    setSearchParams(newSearchParams, { replace: true });
  };

  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    
    // Update URL parameters with debounce effect
    const newSearchParams = new URLSearchParams(searchParams);
    if (newSearchTerm.trim()) {
      newSearchParams.set('search', newSearchTerm);
    } else {
      newSearchParams.delete('search');
    }
    setSearchParams(newSearchParams, { replace: true });
  };

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert(t('loginRequired'));
      return;
    }
    
    try {
      console.log('Adding to cart:', { productId: product.id, quantity: 1 });
      
      // Create form data to match backend @FormParam expectations
      const cartData = new URLSearchParams();
      cartData.append('productId', product.id.toString());
      cartData.append('quantity', '1');

      const response = await apiClient({
        method: 'POST',
        url: '/cart/items',
        data: cartData.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });
      
      if (response.data.success) {
        alert(t('addedToCart'));
      } else {
        alert('Failed to add to cart');
      }
    } catch (error) {
      console.error('Cart error details:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        alert(t('loginRequired'));
      } else if (error.response?.data?.error) {
        alert(`Failed to add to cart: ${error.response.data.error}`);
      } else {
        alert('Failed to add to cart');
      }
    }
  };

  if (loading) return <div>{t('loading')}</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="product-list">
      <div className="product-list-header">
        <h1>{t('categories')}</h1>
        
        {/* Search Bar */}
        <div className="search-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder={t('search', 'Search products...')}
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            <div className="search-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="category-section">
          <h3>{t('productCategories', 'Product Categories')}</h3>
          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category.id)}
              >
                {i18n.language === 'zh' ? category.nameZh : category.nameEn}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="results-info">
          <p>{t('showingResults', `Showing ${filteredProducts.length} of ${products.length} products`)}</p>
        </div>
      </div>
      
      <div className="products-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image-container">
                {product.images && product.images[0] && product.images[0].imageUrl ? (
                  <img 
                    src={getFullImageUrl(product.images[0].imageUrl)} 
                    alt={i18n.language === 'zh' ? (product.images[0].altTextZh || product.images[0].altText) : (product.images[0].altTextEn || product.images[0].altText)}
                    className="product-image"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
                    }}
                  />
                ) : (
                  <img 
                    src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    alt={i18n.language === 'zh' ? (product.nameZh || product.name) : (product.nameEn || product.name)}
                    className="product-image"
                  />
                )}
              </div>
              <div className="product-info">
                <h3>{i18n.language === 'zh' ? (product.nameZh || product.name) : (product.nameEn || product.name)}</h3>
                <div className="price-container">
                  <p className="product-price">${product.price}</p>
                  {product.comparePrice && (
                    <p className="original-price">${product.comparePrice}</p>
                  )}
                </div>
              </div>
              <div className="product-actions">
                <button
                  className="view-details-btn"
                  onClick={() => {
                    // Capture current scroll position at click time
                    const currentScrollPosition = {
                      x: window.pageXOffset || document.documentElement.scrollLeft,
                      y: window.pageYOffset || document.documentElement.scrollTop
                    };
                    
                    console.log('🔄 Capturing scroll position:', currentScrollPosition);
                    console.log('🔄 Current filters - Category:', selectedCategory, 'Search:', searchTerm);
                    console.log('🔄 Current URL search:', location.search);
                    
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
                <button 
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(product)}
                >
                  {t('addToCartButton')}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-products">
            <p>{searchTerm ? t('noSearchResults', 'No products found for your search') : t('noProducts', 'No products available in this category')}</p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="clear-search-btn"
              >
                {t('clearSearch', 'Clear Search')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;