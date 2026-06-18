// Vercel Analytics for Static HTML
// Based on @vercel/analytics v1.6.1

(function() {
  'use strict';

  const name = "@vercel/analytics";
  const version = "1.6.1";

  // Queue initialization
  const initQueue = () => {
    if (window.va) return;
    window.va = function a(...params) {
      (window.vaq = window.vaq || []).push(params);
    };
  };

  // Utility functions
  function isBrowser() {
    return typeof window !== "undefined";
  }

  function detectEnvironment() {
    try {
      const env = process.env.NODE_ENV;
      if (env === "development" || env === "test") {
        return "development";
      }
    } catch (e) {
      // process.env is not available in browser
    }
    return "production";
  }

  function setMode(mode = "auto") {
    if (mode === "auto") {
      window.vam = detectEnvironment();
      return;
    }
    window.vam = mode;
  }

  function getMode() {
    const mode = isBrowser() ? window.vam : detectEnvironment();
    return mode || "production";
  }

  function isDevelopment() {
    return getMode() === "development";
  }

  function getScriptSrc(props) {
    if (props.scriptSrc) {
      return props.scriptSrc;
    }
    if (isDevelopment()) {
      return "https://va.vercel-scripts.com/v1/script.debug.js";
    }
    if (props.basePath) {
      return `${props.basePath}/insights/script.js`;
    }
    return "/_vercel/insights/script.js";
  }

  // Main inject function
  function inject(props = { debug: true }) {
    if (!isBrowser()) return;
    
    setMode(props.mode);
    initQueue();
    
    if (props.beforeSend) {
      window.va?.("beforeSend", props.beforeSend);
    }
    
    const src = getScriptSrc(props);
    
    // Don't inject if script already exists
    if (document.head.querySelector(`script[src*="${src}"]`)) return;
    
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.dataset.sdkn = name + (props.framework ? `/${props.framework}` : "");
    script.dataset.sdkv = version;
    
    if (props.disableAutoTrack) {
      script.dataset.disableAutoTrack = "1";
    }
    
    if (props.endpoint) {
      script.dataset.endpoint = props.endpoint;
    } else if (props.basePath) {
      script.dataset.endpoint = `${props.basePath}/insights`;
    }
    
    if (props.dsn) {
      script.dataset.dsn = props.dsn;
    }
    
    script.onerror = () => {
      const errorMessage = isDevelopment() 
        ? "Please check if any ad blockers are enabled and try again." 
        : "Be sure to enable Web Analytics for your project and deploy again. See https://vercel.com/docs/analytics/quickstart for more information.";
      console.log(
        `[Vercel Web Analytics] Failed to load script from ${src}. ${errorMessage}`
      );
    };
    
    if (isDevelopment() && props.debug === false) {
      script.dataset.debug = "false";
    }
    
    document.head.appendChild(script);
  }

  // Initialize analytics when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      inject({ mode: 'auto' });
    });
  } else {
    inject({ mode: 'auto' });
  }
})();
