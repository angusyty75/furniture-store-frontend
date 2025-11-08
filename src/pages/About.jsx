import React from 'react';
import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation();
  
  return (
    <div className="about-page">
      <div className="about-container">
        <div className="about-hero">
          <h1>{t('aboutUs')}</h1>
          <p className="hero-subtitle">{t('aboutHeroSubtitle')}</p>
        </div>
        
        <div className="about-content">
          <section className="about-section">
            <h2>{t('ourStory')}</h2>
            <div className="story-content">
              <p>{t('storyParagraph1')}</p>
              <p>{t('storyParagraph2')}</p>
              <p>{t('storyParagraph3')}</p>
            </div>
          </section>
          
          <section className="about-section">
            <h2>{t('ourMission')}</h2>
            <div className="mission-content">
              <p>{t('missionParagraph1')}</p>
              <ul className="mission-list">
                <li>{t('missionPoint1')}</li>
                <li>{t('missionPoint2')}</li>
                <li>{t('missionPoint3')}</li>
                <li>{t('missionPoint4')}</li>
              </ul>
            </div>
          </section>
          
          <section className="about-section">
            <h2>{t('whyChooseUs')}</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🏆</div>
                <h3>{t('premiumQuality')}</h3>
                <p>{t('premiumQualityDesc')}</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎨</div>
                <h3>{t('uniqueDesign')}</h3>
                <p>{t('uniqueDesignDesc')}</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🚚</div>
                <h3>{t('fastDelivery')}</h3>
                <p>{t('fastDeliveryDesc')}</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💎</div>
                <h3>{t('affordablePrice')}</h3>
                <p>{t('affordablePriceDesc')}</p>
              </div>
            </div>
          </section>
          
          <section className="about-section">
            <h2>{t('ourValues')}</h2>
            <div className="values-content">
              <div className="value-item">
                <h4>{t('sustainability')}</h4>
                <p>{t('sustainabilityDesc')}</p>
              </div>
              <div className="value-item">
                <h4>{t('craftsmanship')}</h4>
                <p>{t('craftsmanshipDesc')}</p>
              </div>
              <div className="value-item">
                <h4>{t('customerFirst')}</h4>
                <p>{t('customerFirstDesc')}</p>
              </div>
            </div>
          </section>
          
          <section className="about-section">
            <h2>{t('ourTeam')}</h2>
            <p>{t('teamDescription')}</p>
            <div className="team-stats">
              <div className="stat">
                <span className="stat-number">15+</span>
                <span className="stat-label">{t('yearsExperience')}</span>
              </div>
              <div className="stat">
                <span className="stat-number">5000+</span>
                <span className="stat-label">{t('happyCustomers')}</span>
              </div>
              <div className="stat">
                <span className="stat-number">500+</span>
                <span className="stat-label">{t('productVarieties')}</span>
              </div>
              <div className="stat">
                <span className="stat-number">24/7</span>
                <span className="stat-label">{t('customerSupport')}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;