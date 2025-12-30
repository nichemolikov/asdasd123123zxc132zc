/**
 * Facebook SDK initialization utility
 * Initializes the Facebook SDK with environment variables
 */

/**
 * Initialize Facebook SDK
 * Call this once when your app loads
 */
export const initFacebookSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
    const apiVersion = 'v18.0';

    if (!appId) {
      console.warn('⚠️ Facebook SDK: VITE_FACEBOOK_APP_ID not configured. Facebook features will be disabled.');
      resolve();
      return;
    }

    // Check if SDK is already loaded
    if (window.FB) {
      try {
        window.FB.init({
          appId: appId,
          cookie: true,
          xfbml: true,
          version: apiVersion,
        });

        window.FB.AppEvents.logPageView();
        console.log('✅ Facebook SDK initialized');
        resolve();
      } catch (error) {
        console.error('❌ Error initializing Facebook SDK:', error);
        reject(error);
      }
      return;
    }

    // Wait for SDK to load via event or polling
    const initSDK = () => {
      if (window.FB) {
        try {
          window.FB.init({
            appId: appId,
            cookie: true,
            xfbml: true,
            version: apiVersion,
          });

          window.FB.AppEvents.logPageView();
          console.log('✅ Facebook SDK initialized');
          resolve();
        } catch (error) {
          console.error('❌ Error initializing Facebook SDK:', error);
          reject(error);
        }
      }
    };

    // Listen for SDK ready event
    window.addEventListener('fb-sdk-ready', initSDK, { once: true });

    // Also poll as fallback
    const checkSDK = setInterval(() => {
      if (window.FB) {
        clearInterval(checkSDK);
        window.removeEventListener('fb-sdk-ready', initSDK);
        initSDK();
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkSDK);
      window.removeEventListener('fb-sdk-ready', initSDK);
      if (!window.FB) {
        const error = new Error('Facebook SDK failed to load within 10 seconds');
        console.error('❌', error);
        reject(error);
      }
    }, 10000);
  });
};

/**
 * Check if Facebook SDK is initialized
 */
export const isFacebookSDKReady = (): boolean => {
  return typeof window.FB !== 'undefined' && window.FB !== null;
};

/**
 * Get Facebook SDK instance
 */
export const getFacebookSDK = () => {
  if (!isFacebookSDKReady()) {
    throw new Error('Facebook SDK is not initialized. Call initFacebookSDK() first.');
  }
  return window.FB!;
};

