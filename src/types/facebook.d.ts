/**
 * Facebook SDK TypeScript definitions
 */

declare global {
  interface Window {
    FB?: {
      init: (config: {
        appId: string;
        cookie?: boolean;
        xfbml?: boolean;
        version: string;
      }) => void;
      AppEvents: {
        logPageView: () => void;
        logEvent: (eventName: string, params?: any) => void;
      };
      getLoginStatus: (callback: (response: FacebookLoginStatusResponse) => void) => void;
      login: (callback: (response: FacebookLoginResponse) => void, options?: { scope?: string }) => void;
      logout: (callback: (response: FacebookResponse) => void) => void;
      api: (path: string, callback: (response: any) => void, params?: any) => void;
      ui: (params: FacebookUIParams, callback?: (response: any) => void) => void;
    };
    fbAsyncInit?: () => void;
  }
}

export interface FacebookLoginStatusResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: {
    accessToken: string;
    expiresIn: number;
    signedRequest: string;
    userID: string;
  };
}

export interface FacebookLoginResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: {
    accessToken: string;
    expiresIn: number;
    signedRequest: string;
    userID: string;
  };
}

export interface FacebookResponse {
  status?: string;
  [key: string]: any;
}

export interface FacebookUIParams {
  method: string;
  [key: string]: any;
}

export {};

