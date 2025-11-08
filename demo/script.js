// Language switching functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize language
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'zh';
    setLanguage(savedLanguage);
    
    // Initialize cart count
    updateCartCount();
    
    // Load products if on products page
    if (window.location.pathname.includes('products.html')) {
        loadProducts();
    }
    
    // Initialize product detail if on product page
    if (window.location.pathname.includes('product-detail.html')) {
        initializeProductDetail();
    }
    
    // Initialize cart if on cart page
    if (window.location.pathname.includes('cart.html')) {
        initializeCart();
    }
}

// Language Management
function setLanguage(language) {
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.value = language;
    }
    localStorage.setItem('preferredLanguage', language);
    updateContentLanguage(language);
}

function updateContentLanguage(language) {
    // This would typically make API calls to get translated content
    // For demo purposes, we'll just update some basic text
    const translations = {
        'zh': {
            'searchPlaceholder': '搜尋產品...',
            'welcome': '歡迎來到優質傢俱',
            'cart': '購物車',
            'login': '登入'
        },
        'en': {
            'searchPlaceholder': 'Search products...',
            'welcome': 'Welcome to Quality Furniture',
            'cart': 'Shopping Cart',
            'login': 'Login'
        }
    };
    
    const t = translations[language];
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.placeholder = t.searchPlaceholder;
    
    // Update other elements as needed
}

// Cart Management
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

function addToCart(productId, quantity = 1) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            quantity: quantity,
            addedAt: new Date().toISOString()
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('產品已加入購物車', 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Product Management
function loadProducts() {
    // Mock product data
    const products = [
        {
            id: 1,
            name: '現代簡約布藝沙發',
            nameEn: 'Modern Minimalist Fabric Sofa',
            price: 12800,
            originalPrice: 15800,
            image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1758&q=80',
            category: 'sofa',
            badge: '熱賣'
        },
        {
            id: 2,
            name: '北歐實木餐桌',
            nameEn: 'Nordic Solid Wood Dining Table',
            price: 8500,
            image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80',
            category: 'table'
        },
        {
            id: 3,
            name: '舒適雙人床組',
            nameEn: 'Comfort Double Bed Set',
            price: 15600,
            originalPrice: 18900,
            image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80',
            category: 'bed',
            badge: '新品'
        }
    ];
    
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        productsGrid.innerHTML = products.map(product => `
            <div class="product-card fade-in">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                    ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">
                        <span class="current-price">$${product.price.toLocaleString()}</span>
                        ${product.originalPrice ? `<span class="original-price">$${product.originalPrice.toLocaleString()}</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-outline" onclick="addToCart(${product.id})">
                            <i class="fas fa-shopping-cart"></i>
                            加入購物車
                        </button>
                        <button class="btn btn-primary" onclick="viewProduct(${product.id})">
                            查看詳情
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function viewProduct(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

// Product Detail Functions
function initializeProductDetail() {
    // Initialize image gallery
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('mainImage');
    
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
            // Remove active class from all thumbnails
            thumbnails.forEach(t => t.classList.remove('active'));
            // Add active class to clicked thumbnail
            this.classList.add('active');
            // Update main image
            const newSrc = this.querySelector('img').src;
            mainImage.src = newSrc;
        });
    });
    
    // Initialize color options
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            colorOptions.forEach(o => o.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Initialize size options
    const sizeOptions = document.querySelectorAll('.size-option');
    sizeOptions.forEach(option => {
        option.addEventListener('click', function() {
            sizeOptions.forEach(o => o.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Initialize tabs
    const tabHeaders = document.querySelectorAll('.tab-header');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab header
            tabHeaders.forEach(h => h.classList.remove('active'));
            this.classList.add('active');
            
            // Update active tab pane
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === tabId) {
                    pane.classList.add('active');
                }
            });
        });
    });
}

function increaseQuantity() {
    const quantityInput = document.getElementById('quantity');
    quantityInput.value = parseInt(quantityInput.value) + 1;
}

function decreaseQuantity() {
    const quantityInput = document.getElementById('quantity');
    if (parseInt(quantityInput.value) > 1) {
        quantityInput.value = parseInt(quantityInput.value) - 1;
    }
}

// Cart Page Functions
function initializeCart() {
    updateCartTotals();
}

function increaseCartQuantity(button) {
    const input = button.parentNode.querySelector('input');
    input.value = parseInt(input.value) + 1;
    updateCartTotals();
}

function decreaseCartQuantity(button) {
    const input = button.parentNode.querySelector('input');
    if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
        updateCartTotals();
    }
}

function removeCartItem(button) {
    const cartItem = button.closest('.cart-item');
    cartItem.style.opacity = '0';
    setTimeout(() => {
        cartItem.remove();
        updateCartTotals();
    }, 300);
}

function updateCartTotals() {
    // Calculate and update cart totals
    // This is a simplified version - in real app, you'd calculate based on actual prices
    const subtotal = 21300; // This would be calculated from cart items
    const discount = 3000;
    const total = subtotal - discount;
    
    // Update UI elements
    const totalElement = document.querySelector('.summary-row.total span:last-child');
    if (totalElement) {
        totalElement.textContent = `$${total.toLocaleString()}`;
    }
}

function applyPromoCode() {
    const promoCode = document.getElementById('promoCode').value;
    if (promoCode === 'SAVE100') {
        showNotification('優惠代碼已套用！', 'success');
    } else {
        showNotification('無效的優惠代碼', 'error');
    }
}

function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('購物車是空的', 'error');
        return;
    }
    window.location.href = 'checkout.html';
}

// Utility Functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        border-radius: 4px;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Search functionality
function performSearch(query) {
    if (query.trim()) {
        window.location.href = `products.html?search=${encodeURIComponent(query)}`;
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Language switcher
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.addEventListener('change', function() {
            setLanguage(this.value);
        });
    }
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch(this.value);
            }
        });
        
        const searchBtn = document.querySelector('.search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', function() {
                performSearch(searchInput.value);
            });
        }
    }
    
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            const navMenu = document.querySelector('.nav-menu');
            navMenu.classList.toggle('active');
        });
    }
});

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .hamburger {
        display: none;
        flex-direction: column;
        cursor: pointer;
    }
    
    .hamburger span {
        width: 25px;
        height: 3px;
        background: #333;
        margin: 3px 0;
        transition: 0.3s;
    }
    
    @media (max-width: 768px) {
        .hamburger {
            display: flex;
        }
        
        .nav-menu {
            position: fixed;
            top: 70px;
            left: -100%;
            width: 100%;
            background: white;
            flex-direction: column;
            text-align: center;
            transition: 0.3s;
            box-shadow: 0 10px 27px rgba(0,0,0,0.05);
            padding: 2rem 0;
        }
        
        .nav-menu.active {
            left: 0;
        }
    }
`;
document.head.appendChild(style);