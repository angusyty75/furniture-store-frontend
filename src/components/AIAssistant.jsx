// components/AIAssistant/AIAssistant.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../config/api';
import { getFullImageUrl } from '../utils/imageUtils';
import '../AIAssistant.css';

const AIAssistant = ({ language = 'en' }) => {
  const { i18n } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Use language from i18n if available, fallback to prop
  const currentLanguage = language || i18n.language || 'en';

  // Initialize session ID and test backend connection
  useEffect(() => {
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    loadChatHistory(newSessionId);
    testBackendConnection();
  }, []);

  const testBackendConnection = async () => {
    try {
      console.log('Testing AI backend connection...');
      const response = await apiClient.get('/furniture-store/api/ai/test');
      console.log('✅ AI Backend connection successful:', response.data);
    } catch (error) {
      console.error('❌ AI Backend connection failed:', error);
      console.error('Make sure your Java backend is running on http://localhost:8080');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateSessionId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const loadChatHistory = async (sessionId) => {
    try {
      console.log('Loading chat history for session:', sessionId);
      const response = await apiClient.get(`/furniture-store/api/ai/history/${sessionId}`);
      
      if (response.data.success && response.data.messages) {
        setMessages(response.data.messages);
        console.log('Chat history loaded:', response.data.messages);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      // Don't show error to user for history loading failure
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const messageText = input.trim();
    const userMessage = { 
      type: 'user', 
      content: messageText, 
      timestamp: new Date(),
      language: currentLanguage 
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      console.log('Sending message to AI:', {
        message: messageText,
        sessionId: sessionId,
        language: currentLanguage
      });

      const chatRequest = {
        message: messageText,
        sessionId: sessionId,
        language: currentLanguage,
        context: getChatContext()
      };

      const response = await apiClient.post('/furniture-store/api/ai/chat', chatRequest);
      
      console.log('AI response received:', response.data);
      
      if (response.data.success) {
        console.log('AI products received:', response.data.products);
        
        // Debug product images
        if (response.data.products && response.data.products.length > 0) {
          response.data.products.forEach((product, index) => {
            console.log(`Product ${index}:`, {
              id: product.id,
              name: getProductName(product),
              imageUrl: getProductImage(product),
              originalImageData: product.images
            });
          });
        }
        
        const aiMessage = { 
          type: 'ai', 
          content: response.data.response,
          products: response.data.products || [],
          timestamp: new Date(),
          language: currentLanguage
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(response.data.error || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorText;
      if (error.response?.data?.error) {
        errorText = error.response.data.error;
      } else if (error.response?.status === 500) {
        errorText = currentLanguage === 'zh' 
          ? '伺服器內部錯誤，請稍後再試。' 
          : 'Server error, please try again later.';
      } else if (error.response?.status === 400) {
        errorText = currentLanguage === 'zh' 
          ? '請求格式錯誤，請檢查輸入。' 
          : 'Invalid request format.';
      } else if (error.response?.status === 404) {
        errorText = currentLanguage === 'zh' 
          ? 'AI服務暫時不可用，請稍後再試。' 
          : 'AI service is temporarily unavailable.';
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        errorText = currentLanguage === 'zh' 
          ? '網路連接失敗，請檢查網路連接。' 
          : 'Network connection failed. Please check your connection.';
      } else {
        errorText = currentLanguage === 'zh' 
          ? '抱歉，我遇到了問題。請稍後再試。' 
          : 'Sorry, I encountered an error. Please try again.';
      }
      
      const errorMessage = { 
        type: 'ai', 
        content: errorText,
        timestamp: new Date(),
        language: currentLanguage
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getChatContext = () => {
    const contextObject = {
      page: window.location.pathname,
      userPreferences: JSON.parse(localStorage.getItem('userPreferences') || '{}'),
      currentProducts: getCurrentProducts(),
      language: currentLanguage,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
    
    // Convert context object to JSON string as expected by Java backend
    return JSON.stringify(contextObject);
  };

  const getCurrentProducts = () => {
    // Get current products from page context if available
    if (window.currentProducts) {
      return window.currentProducts;
    }
    return [];
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickSuggestions = {
    en: [
      "Sofa",
      "Office chair recommendations",
      "What's on sale?",
      "Bedroom"
    ],
    zh: [
      "沙發",
      "辦公椅推薦",
      "有什麼促銷商品？",
      "臥室"
    ]
  };

  const getCurrentSuggestions = () => {
    return quickSuggestions[currentLanguage] || quickSuggestions.en;
  };

  const clearChat = async () => {
    try {
      console.log('Clearing chat history for session:', sessionId);
      await apiClient.delete(`/furniture-store/api/ai/history/${sessionId}`);
      setMessages([]);
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      console.log('Chat cleared, new session ID:', newSessionId);
    } catch (error) {
      console.error('Failed to clear chat:', error);
      // Still clear local messages even if server request fails
      setMessages([]);
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat(currentLanguage === 'zh' ? 'zh-CN' : 'en-US', {
      style: 'currency',
      currency: 'HKD' // Always use HKD for consistency with your backend
    }).format(price);
  };

  const getProductName = (product) => {
    return currentLanguage === 'zh' ? (product.nameZh || product.name) : (product.nameEn || product.name);
  };

  const getProductDescription = (product) => {
    return currentLanguage === 'zh' ? (product.descriptionZh || product.description) : (product.descriptionEn || product.description);
  };

  // getFullImageUrl is now imported from utils

  const getProductImage = (product) => {
    // Try to get image from different possible sources
    if (product.images && product.images.length > 0 && product.images[0].imageUrl) {
      return getFullImageUrl(product.images[0].imageUrl);
    }
    if (product.imageUrl) {
      return getFullImageUrl(product.imageUrl);
    }
    if (product.image) {
      return product.image;
    }
    // Return default image if no image found
    return getDefaultProductImage();
  };

  const getDefaultProductImage = () => {
    // Use a reliable placeholder image service
    return "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
  };

  return (
    <div className={`ai-assistant ${isOpen ? 'open' : ''}`}>
      <div className="ai-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="ai-title">
          <span className="ai-icon">🤖</span>
          <h3>{currentLanguage === 'zh' ? '家具助手' : 'Furniture Assistant'}</h3>
        </div>
        <div className="ai-controls">
          {isOpen && (
            <button className="clear-btn" onClick={clearChat} title={currentLanguage === 'zh' ? '清空對話' : 'Clear chat'}>
              🗑️
            </button>
          )}
          <span className="toggle-icon">{isOpen ? '−' : '+'}</span>
        </div>
      </div>
      
      {isOpen && (
        <div className="ai-chat-container">
          <div className="messages-container">
            {messages.length === 0 && (
              <div className="welcome-message">
                <p>{currentLanguage === 'zh' ? '您好！我是您的家具助手。今天需要什麼幫助？' : 'Hi! I\'m your furniture assistant. How can I help you today?'}</p>
                <div className="quick-suggestions">
                  {getCurrentSuggestions().map((suggestion, index) => (
                    <button 
                      key={index}
                      className="suggestion-btn"
                      onClick={() => setInput(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.type}`}>
                <div className="message-content">
                  {message.content}
                  {message.products && message.products.length > 0 && (
                    <div className="product-suggestions">
                      {message.products.map(product => (
                        <div key={product.id} className="product-card">
                          <img 
                            src={getProductImage(product)} 
                            alt={getProductName(product)}
                            style={{ 
                              width: '60px', 
                              height: '60px', 
                              objectFit: 'cover', 
                              borderRadius: '6px',
                              backgroundColor: '#f0f0f0',
                              border: '1px solid #ddd'
                            }}
                            onError={(e) => {
                              console.log('Image failed to load:', e.target.src);
                              if (e.target.src !== getDefaultProductImage()) {
                                e.target.src = getDefaultProductImage();
                              } else {
                                console.log('Default image also failed, hiding image');
                                e.target.style.display = 'none';
                              }
                            }}
                            onLoad={(e) => {
                              console.log('Image loaded successfully:', e.target.src);
                            }}
                          />
                          <div className="product-info">
                            <h4>{getProductName(product)}</h4>
                            <p className="product-price">
                              {formatPrice(product.price)}
                              {product.comparePrice && product.comparePrice > product.price && (
                                <span className="compare-price">
                                  {formatPrice(product.comparePrice)}
                                </span>
                              )}
                            </p>
                            <p className="product-stock">
                              {product.inStock ? 
                                (currentLanguage === 'zh' ? '有現貨' : 'In Stock') : 
                                (currentLanguage === 'zh' ? '缺貨' : 'Out of Stock')}
                            </p>
                            <button 
                              className="view-details-btn"
                              onClick={() => window.location.href = `/products/${product.slug || product.id}`}
                            >
                              {currentLanguage === 'zh' ? '查看詳情' : 'View Details'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="timestamp">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
            
            {isLoading && (
              <div className="message ai">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="input-container">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={currentLanguage === 'zh' ? '詢問家具、風格或推薦...' : 'Ask about furniture, styles, or recommendations...'}
              rows="1"
              disabled={isLoading}
            />
            <button 
              onClick={sendMessage} 
              disabled={isLoading || !input.trim()}
              className="send-btn"
            >
              {isLoading ? '⏳' : '📤'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;