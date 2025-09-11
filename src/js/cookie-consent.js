// GDPR Cookie Consent Banner for Lineo Finance
(function() {
  'use strict';
  
  // Configuration
  const COOKIE_NAME = 'lineo_cookie_consent';
  const COOKIE_DURATION = 365; // days
  
  // Initialize cookie consent when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    initCookieConsent();
  });
  
  function initCookieConsent() {
    // Check if user has already given consent
    const consent = getCookie(COOKIE_NAME);
    if (consent) {
      // User has already decided - load analytics if accepted
      if (consent === 'accepted') {
        loadGoogleAnalytics();
      }
      return;
    }
    
    // Show cookie banner
    showCookieBanner();
  }
  
  function showCookieBanner() {
    // Create banner HTML
    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.className = 'cookie-consent-banner';
    banner.innerHTML = `
      <div class="cookie-consent-content">
        <div class="cookie-consent-text">
          <h3>Ihre Privatsphäre ist uns wichtig</h3>
          <p>Wir nutzen Google Analytics, um die Nutzung unserer Website zu analysieren und zu verbessern. Diese Cookies helfen uns dabei, Ihnen ein besseres Nutzererlebnis zu bieten.</p>
          <p>Sie können Ihre Einwilligung jederzeit in unserer <a href="/pages/datenschutz/" class="cookie-consent-link">Datenschutzerklärung</a> widerrufen.</p>
        </div>
        <div class="cookie-consent-buttons">
          <button class="cookie-consent-btn cookie-consent-btn--accept" type="button">
            Alle Cookies akzeptieren
          </button>
          <button class="cookie-consent-btn cookie-consent-btn--reject" type="button">
            Nur notwendige Cookies
          </button>
          <button class="cookie-consent-btn cookie-consent-btn--manage" type="button">
            Einstellungen verwalten
          </button>
        </div>
      </div>
    `;
    
    // Add banner to page
    document.body.appendChild(banner);
    
    // Add event listeners
    const acceptBtn = banner.querySelector('.cookie-consent-btn--accept');
    const rejectBtn = banner.querySelector('.cookie-consent-btn--reject');
    const manageBtn = banner.querySelector('.cookie-consent-btn--manage');
    
    acceptBtn.addEventListener('click', () => handleConsent('accepted'));
    rejectBtn.addEventListener('click', () => handleConsent('rejected'));
    manageBtn.addEventListener('click', showDetailedSettings);
    
    // Show banner with animation
    setTimeout(() => {
      banner.classList.add('cookie-consent-banner--show');
    }, 100);
  }
  
  function showDetailedSettings() {
    const banner = document.getElementById('cookie-consent-banner');
    if (!banner) return;
    
    banner.innerHTML = `
      <div class="cookie-consent-content cookie-consent-content--detailed">
        <div class="cookie-consent-text">
          <h3>Cookie-Einstellungen verwalten</h3>
          <p>Hier können Sie im Detail auswählen, welche Cookies Sie zulassen möchten:</p>
        </div>
        
        <div class="cookie-consent-settings">
          <div class="cookie-setting">
            <div class="cookie-setting-header">
              <h4>Notwendige Cookies</h4>
              <span class="cookie-setting-required">Immer aktiv</span>
            </div>
            <p>Diese Cookies sind für das Funktionieren der Website erforderlich und können nicht deaktiviert werden.</p>
          </div>
          
          <div class="cookie-setting">
            <div class="cookie-setting-header">
              <h4>Analyse-Cookies (Google Analytics)</h4>
              <label class="cookie-toggle">
                <input type="checkbox" id="analytics-toggle" checked>
                <span class="cookie-toggle-slider"></span>
              </label>
            </div>
            <p>Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website interagieren, indem sie Informationen anonym sammeln und übertragen.</p>
          </div>
        </div>
        
        <div class="cookie-consent-buttons">
          <button class="cookie-consent-btn cookie-consent-btn--save" type="button">
            Einstellungen speichern
          </button>
          <button class="cookie-consent-btn cookie-consent-btn--back" type="button">
            Zurück
          </button>
        </div>
      </div>
    `;
    
    // Add event listeners for detailed view
    const saveBtn = banner.querySelector('.cookie-consent-btn--save');
    const backBtn = banner.querySelector('.cookie-consent-btn--back');
    const analyticsToggle = banner.querySelector('#analytics-toggle');
    
    saveBtn.addEventListener('click', () => {
      const analyticsAccepted = analyticsToggle.checked;
      handleConsent(analyticsAccepted ? 'accepted' : 'rejected');
    });
    
    backBtn.addEventListener('click', () => {
      banner.remove();
      showCookieBanner();
    });
  }
  
  function handleConsent(decision) {
    // Save consent decision
    setCookie(COOKIE_NAME, decision, COOKIE_DURATION);
    
    // Load analytics if accepted
    if (decision === 'accepted') {
      loadGoogleAnalytics();
    }
    
    // Remove banner
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
      banner.classList.add('cookie-consent-banner--hide');
      setTimeout(() => {
        banner.remove();
      }, 300);
    }
  }
  
  function loadGoogleAnalytics() {
    // Google Analytics 4 measurement ID
    const measurementId = 'G-QYZZ8CW3N0';
    
    // Load gtag script
    if (!window.gtag) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);
      
      script.onload = function() {
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', measurementId, {
          'anonymize_ip': true,
          'cookie_flags': 'max-age=7776000;secure;samesite=none'
        });
      };
    }
  }
  
  // Cookie utility functions
  function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; secure; samesite=strict`;
  }
  
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }
  
  // Global function to reopen cookie settings
  window.openCookieSettings = function() {
    // Remove existing banner if present
    const existingBanner = document.getElementById('cookie-consent-banner');
    if (existingBanner) {
      existingBanner.remove();
    }
    
    // Create new banner for settings
    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.className = 'cookie-consent-banner cookie-consent-banner--show';
    document.body.appendChild(banner);
    
    // Show detailed settings
    showDetailedSettings();
  };
  
})();