// lib/authUtils.ts

/**
 * Authentication Utility Functions
 * Handle token storage, session validation, and security checks
 */

export const AuthTokenManager = {
  /**
   * Store authentication token and related data
   */
  setAuthToken: (token: string, sessionId: string) => {
    try {
      localStorage.setItem("authToken", token);
      localStorage.setItem("sessionId", sessionId);
      localStorage.setItem("loginTimestamp", new Date().toISOString());
      return true;
    } catch (error) {
      console.error("Failed to store auth token:", error);
      return false;
    }
  },

  /**
   * Retrieve stored authentication token
   */
  getAuthToken: (): string | null => {
    try {
      return localStorage.getItem("authToken");
    } catch (error) {
      console.error("Failed to retrieve auth token:", error);
      return null;
    }
  },

  /**
   * Retrieve stored session ID
   */
  getSessionId: (): string | null => {
    try {
      return localStorage.getItem("sessionId");
    } catch (error) {
      console.error("Failed to retrieve session ID:", error);
      return null;
    }
  },

  /**
   * Check if token exists and is valid
   */
  isTokenValid: (): boolean => {
    const token = AuthTokenManager.getAuthToken();
    return token !== null && token !== undefined && token !== "";
  },

  /**
   * Clear all authentication data
   */
  clearAuthData: () => {
    try {
      localStorage.removeItem("authToken");
      localStorage.removeItem("sessionId");
      localStorage.removeItem("loginTimestamp");
      return true;
    } catch (error) {
      console.error("Failed to clear auth data:", error);
      return false;
    }
  },

  /**
   * Get time elapsed since login
   */
  getLoginAge: (): number | null => {
    try {
      const timestamp = localStorage.getItem("loginTimestamp");
      if (!timestamp) return null;
      return Date.now() - new Date(timestamp).getTime();
    } catch (error) {
      console.error("Failed to get login age:", error);
      return null;
    }
  },
};

/**
 * Session Validation Functions
 */
export const SessionValidator = {
  /**
   * Validate that received session ID matches expected session ID
   */
  isSessionIdMatch: (receivedId: string, expectedId: string): boolean => {
    if (!receivedId || !expectedId) {
      console.warn("Session validation: Missing session ID");
      return false;
    }
    const isMatch = receivedId === expectedId;
    if (!isMatch) {
      console.warn(
        "Session ID mismatch - Received:",
        receivedId,
        "Expected:",
        expectedId
      );
    }
    return isMatch;
  },

  /**
   * Check if QR code has expired
   */
  isQRExpired: (expiresAt: number): boolean => {
    const timeLeft = expiresAt - Date.now();
    return timeLeft <= 0;
  },

  /**
   * Get time remaining for QR code in seconds
   */
  getTimeRemaining: (expiresAt: number): number => {
    const timeLeft = expiresAt - Date.now();
    return Math.max(0, Math.ceil(timeLeft / 1000));
  },

  /**
   * Get time remaining as formatted string
   */
  getTimeRemainingFormatted: (expiresAt: number): string => {
    const seconds = SessionValidator.getTimeRemaining(expiresAt);
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  },
};

/**
 * Device Fingerprinting (Optional security enhancement)
 */
export const DeviceFingerprint = {
  /**
   * Generate a basic device fingerprint
   */
  generate: (): string => {
    const userAgent = navigator.userAgent;
    const language = navigator.language;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const screen = `${window.screen.width}x${window.screen.height}`;
    
    const fingerprint = `${userAgent}|${language}|${timezone}|${screen}`;
    return btoa(fingerprint); // Base64 encode
  },

  /**
   * Store device fingerprint
   */
  store: () => {
    try {
      const fingerprint = DeviceFingerprint.generate();
      localStorage.setItem("deviceFingerprint", fingerprint);
    } catch (error) {
      console.error("Failed to store device fingerprint:", error);
    }
  },

  /**
   * Verify device fingerprint matches stored one
   */
  verify: (): boolean => {
    try {
      const stored = localStorage.getItem("deviceFingerprint");
      const current = DeviceFingerprint.generate();
      return stored === current;
    } catch (error) {
      console.error("Failed to verify device fingerprint:", error);
      return false;
    }
  },
};

/**
 * Error Message Utilities
 */
const errorMessagesMap = {
  SESSION_MISMATCH: "Session ID mismatch. Please scan the QR code again.",
  QR_EXPIRED: "QR code has expired. Refreshing...",
  TOKEN_GENERATION_FAILED: "Failed to generate authentication token.",
  CONNECTION_LOST: "Connection lost. Please refresh and try again.",
  AUTHENTICATION_FAILED: "Authentication failed. Please try again.",
  STORAGE_ERROR: "Failed to store authentication data.",
  UNKNOWN_ERROR: "An unexpected error occurred.",
};

export const ErrorMessages = {
  ...errorMessagesMap,

  /**
   * Get user-friendly error message
   */
  get: (type: string): string => {
    return (errorMessagesMap as Record<string, string>)[type] || errorMessagesMap.UNKNOWN_ERROR;
  },
};

/**
 * Logging Utilities (for debugging)
 */
export const AuthLogger = {
  logSessionStart: (sessionId: string) => {
    console.log("🔐 Auth Session Started:", {
      sessionId,
      timestamp: new Date().toISOString(),
    });
  },

  logSessionEnd: (sessionId: string, reason: string) => {
    console.log("🔐 Auth Session Ended:", {
      sessionId,
      reason,
      timestamp: new Date().toISOString(),
    });
  },

  logQRCodeScanned: (sessionId: string, receivedSessionId: string) => {
    console.log("📱 QR Code Scanned:", {
      expected: sessionId,
      received: receivedSessionId,
      match: sessionId === receivedSessionId,
      timestamp: new Date().toISOString(),
    });
  },

  logTokenStored: (sessionId: string) => {
    console.log("💾 Token Stored:", {
      sessionId,
      timestamp: new Date().toISOString(),
    });
  },

  logError: (errorType: string, error: any) => {
    console.error("❌ Auth Error:", {
      type: errorType,
      error: error?.message || error,
      timestamp: new Date().toISOString(),
    });
  },
};

/**
 * API Request Utilities
 * Add auth token to requests
 */
export const AuthAPIClient = {
  /**
   * Create headers with auth token
   */
  getAuthHeaders: (): Record<string, string> => {
    const token = AuthTokenManager.getAuthToken();
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  },

  /**
   * Make authenticated fetch request
   */
  fetch: async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const headers = {
      ...AuthAPIClient.getAuthHeaders(),
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  },

  /**
   * Make authenticated GET request
   */
  get: async (url: string): Promise<any> => {
    const response = await AuthAPIClient.fetch(url, {
      method: "GET",
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  },

  /**
   * Make authenticated POST request
   */
  post: async (url: string, data: any): Promise<any> => {
    const response = await AuthAPIClient.fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  },
};

/**
 * Protected Route Helper
 * Redirect to login if not authenticated
 */
export const requireAuth = (callback: () => void) => {
  if (!AuthTokenManager.isTokenValid()) {
    window.location.href = "/login";
    return;
  }
  callback();
};

/**
 * Clean session on logout
 */
export const logout = async (router: any) => {
  AuthTokenManager.clearAuthData();
  await router.push("/login");
};