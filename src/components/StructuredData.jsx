// src/components/StructuredData.jsx
import React, { useEffect } from 'react';

const StructuredData = ({ data }) => {
  useEffect(() => {
    if (!data) return;

    // Remove existing structured data script if any
    const existingScript = document.querySelector('#structured-data');
    if (existingScript) {
      existingScript.remove();
    }

    // Create and add new structured data script
    const script = document.createElement('script');
    script.id = 'structured-data';
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(data, null, 2);
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const scriptToRemove = document.querySelector('#structured-data');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [data]);

  return null; // This component doesn't render anything
};

// Helper functions to create common structured data
export const createOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Furniture Store",
  "description": "Premium furniture store offering modern office desks, chairs, and home furniture.",
  "url": typeof window !== 'undefined' ? window.location.origin : '',
  "logo": typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : '',
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-555-FURNITURE",
    "contactType": "customer service"
  }
});

export const createProductSchema = (product) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.name,
  "description": product.description,
  "image": product.image_url,
  "offers": {
    "@type": "Offer",
    "price": product.price,
    "priceCurrency": "HKD",
    "availability": "https://schema.org/InStock"
  },
  "brand": {
    "@type": "Brand",
    "name": "Furniture Store"
  },
  "category": product.category
});

export const createWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Furniture Store",
  "description": "Premium furniture store offering modern office desks, chairs, and home furniture.",
  "url": typeof window !== 'undefined' ? window.location.origin : '',
  "potentialAction": {
    "@type": "SearchAction",
    "target": typeof window !== 'undefined' ? `${window.location.origin}/products?search={search_term_string}` : '',
    "query-input": "required name=search_term_string"
  }
});

export default StructuredData;