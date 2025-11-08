import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../config/api';

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('');

    try {
      console.log('Sending contact form email...');
      
      // Create form data for backend API
      const emailData = new URLSearchParams();
      emailData.append('name', formData.name);
      emailData.append('email', formData.email);
      emailData.append('subject', formData.subject);
      emailData.append('message', formData.message);

      console.log('Email data:', {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      });

      // Send to backend email API
      const response = await apiClient({
        method: 'POST',
        url: '/email/send-contact',
        data: emailData.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      console.log('Email API response:', response.data);

      if (response.data.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        console.log('Email sent successfully!');
      } else {
        throw new Error(response.data.error || 'Failed to send email');
      }
      
    } catch (error) {
      console.error('Error sending email:', error);
      
      // Fallback to mailto if API fails
      console.log('API failed, falling back to mailto...');
      try {
        const subject = encodeURIComponent(formData.subject);
        const body = encodeURIComponent(
          `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
        );
        const mailtoLink = `mailto:angusyty175@gmail.com?subject=${subject}&body=${body}`;
        
        window.open(mailtoLink, '_blank');
        setSubmitStatus('fallback');
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        setSubmitStatus('error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = '85251121555'; // WhatsApp format: country code + number
    const message = encodeURIComponent('Hello! I\'m interested in your furniture products.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handleFacebookClick = () => {
    window.open('https://www.facebook.com/angus.yu.505', '_blank');
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        <div className="contact-hero">
          <h1>{t('contactUs')}</h1>
          <p className="hero-subtitle">{t('contactHeroSubtitle')}</p>
        </div>
        
        <div className="contact-content">
          <div className="contact-info">
            <h2>{t('getInTouch')}</h2>
            <p>{t('contactDescription')}</p>
            
            <div className="contact-methods">
              <div className="contact-method">
                <div className="contact-icon">📍</div>
                <div className="contact-details">
                  <h4>{t('address')}</h4>
                  <p>
                    <a 
                      href="https://maps.google.com/?q=100+Canton+Road+Harbour+City+Tsim+Sha+Tsui+Kowloon+Hong+Kong" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="address-link"
                    >
                      香港九龍尖沙咀廣東道100號<br/>港威大廈10樓A室
                    </a>
                  </p>
                </div>
              </div>
              
              <div className="contact-method">
                <div className="contact-icon">✉️</div>
                <div className="contact-details">
                  <h4>{t('email')}</h4>
                  <p>
                    <a 
                      href="mailto:angusyty175@gmail.com"
                      className="email-link"
                    >
                      angusyty175@gmail.com
                    </a>
                  </p>
                </div>
              </div>
              
              <div className="contact-method">
                <div className="contact-icon">🕒</div>
                <div className="contact-details">
                  <h4>{t('businessHours')}</h4>
                  <p>
                    {t('mondayToFriday')}: 9:00 AM - 6:00 PM<br/>
                    {t('saturday')}: 9:00 AM - 5:00 PM<br/>
                    {t('sunday')}: {t('closed')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="social-media">
              <h3>{t('connectWithUs')}</h3>
              <div className="social-buttons">
                <button 
                  className="social-btn whatsapp-btn"
                  onClick={handleWhatsAppClick}
                  type="button"
                >
                  <span className="social-icon">💬</span>
                  <span className="social-text">
                    WhatsApp<br/>
                    <small>+852 5112-1555</small>
                  </span>
                </button>
                
                <button 
                  className="social-btn facebook-btn"
                  onClick={handleFacebookClick}
                  type="button"
                >
                  <span className="social-icon">📘</span>
                  <span className="social-text">
                    Facebook<br/>
                    <small>{t('followUs')}</small>
                  </span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="contact-form-section">
            <h2>{t('sendMessage')}</h2>
            <p>{t('formDescription')}</p>
            
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">{t('fullName')} *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder={t('enterFullName')}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">{t('email')} *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder={t('enterEmail')}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">{t('subject')} *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  placeholder={t('enterSubject')}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="message">{t('message')} *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="6"
                  placeholder={t('enterMessage')}
                />
              </div>
              
              {submitStatus === 'success' && (
                <div className="status-message success">
                  {t('messageSuccess')}
                </div>
              )}
              
              {submitStatus === 'fallback' && (
                <div className="status-message warning">
                  {t('messageFallback')}
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="status-message error">
                  {t('messageError')}
                </div>
              )}
              
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? t('sending') : t('sendMessage')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;