// src/hooks/useSEO.js
import { useEffect } from 'react';

const useSEO = ({ 
  title = "Furniture Store - Premium Office & Home Furniture",
  description = "Premium furniture store offering modern office desks, chairs, and home furniture. Quality furniture at affordable prices with fast delivery.",
  keywords = "furniture, office furniture, desks, chairs, home furniture, modern furniture, premium furniture"
}) => {
  useEffect(() => {
    // Update document title
    const prevTitle = document.title;
    document.title = title.includes("Furniture Store") ? title : `${title} | Furniture Store`;

    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    const prevDescription = metaDescription.content;
    metaDescription.content = description;

    // Update or create meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    const prevKeywords = metaKeywords.content;
    metaKeywords.content = keywords;

    // Update or create Open Graph title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    const prevOgTitle = ogTitle.content;
    ogTitle.content = document.title;

    // Update or create Open Graph description
    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescription);
    }
    const prevOgDescription = ogDescription.content;
    ogDescription.content = description;

    // Cleanup function to restore previous values when component unmounts
    return () => {
      document.title = prevTitle;
      if (metaDescription) metaDescription.content = prevDescription;
      if (metaKeywords) metaKeywords.content = prevKeywords;
      if (ogTitle) ogTitle.content = prevOgTitle;
      if (ogDescription) ogDescription.content = prevOgDescription;
    };
  }, [title, description, keywords]);
};

export default useSEO;