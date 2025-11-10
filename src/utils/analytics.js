// Lightweight Google Analytics (gtag) helper
const GA_KV = { id: null };

export function initGA(gaId) {
  if (!gaId) return;
  if (GA_KV.id === gaId) return; // already initialized
  GA_KV.id = gaId;

  // Inject gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  const inline = document.createElement('script');
  inline.innerHTML = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaId}', { send_page_view: false });`;
  document.head.appendChild(inline);
}


export function pageview(path) {
  if (!GA_KV.id) return;
  try {
    window.gtag && window.gtag('event', 'page_view', { page_path: path });
  } catch (e) {
    // ignore
  }
}

// Track add_to_cart event for GA4
export function trackAddToCart({ currency = 'HKD', value = 0, items = [] } = {}) {
  if (!GA_KV.id) return;
  try {
    // expose last payload for debugging and log on localhost
    try {
      if (typeof window !== 'undefined') {
        window.__lastGAPayload = { event: 'add_to_cart', currency, value, items };
        // attach dev helper for manual triggering
        window.trackAddToCartDev = (p) => {
          try {
            const payload = p || window.__lastGAPayload;
            window.gtag && window.gtag('event', 'add_to_cart', payload);
            console.log('GA dev helper sent payload', payload);
          } catch (e) {
            console.warn('GA dev helper error', e);
          }
        };
        if (window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
          console.log('GA debug payload prepared', window.__lastGAPayload);
        }
      }
    } catch (ee) {
      // ignore debugging attach errors
    }
    if (window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency,
        value,
        items,
      });
    }
  } catch (e) {
    // ignore errors from analytics
  }
}

export default { initGA, pageview, trackAddToCart };
