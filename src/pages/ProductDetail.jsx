// src/pages/ProductDetail.jsx
import React from 'react';
import ProductDetailComponent from '../components/ProductDetail';
import useSEO from '../hooks/useSEO';

const ProductDetail = () => {
  // Default SEO for product detail page (will be overridden by component)
  useSEO({
    title: "Product Details - Furniture Store",
    description: "View detailed information about our premium furniture products. High-quality office and home furniture with specifications and customer reviews.",
    keywords: "product details, furniture specifications, office furniture, home furniture, furniture reviews"
  });

  return (
    <div className="product-detail-page">
      <ProductDetailComponent />
    </div>
  );
};

export default ProductDetail;