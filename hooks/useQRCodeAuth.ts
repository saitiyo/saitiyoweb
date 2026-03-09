// hooks/useQRCodeAuth.ts

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { gql} from "@apollo/client";
import { useSubscription } from "@apollo/client/react";
import { AuthTokenManager, SessionValidator, AuthLogger, ErrorMessages } from "../utils/authutils";

// GraphQL Subscription
export const NEW_QR_CODE_SCANNED_SUBSCRIPTION = gql`
  subscription OnNewQRCodeScanned {
    newQRCodeScanned {
      session_id
      token
    }
  }
`;

/**
 * Status type for QR authentication
 */
export type QRAuthStatus = "waiting" | "scanning" | "success" | "error";

/**
 * Return type for useQRCodeAuth hook
 */
export interface UseQRCodeAuthReturn {
  status: QRAuthStatus;
  errorMessage: string;
  isAuthenticating: boolean;
  isSubscriptionLoading: boolean;
  handleQRCodeScanned: (payload: { session_id: string; token: string }) => void;
  resetError: () => void;
  timeRemaining: number;
}

/**
 * Custom hook for QR code authentication flow
 * 
 * Usage:
 * ```typescript
 * const {
 *   status,
 *   errorMessage,
 *   isAuthenticating,
 *   timeRemaining,
 *   handleQRCodeScanned,
 *   resetError,
 * } = useQRCodeAuth({
 *   webSessionId,
 *   expiresAt,
 *   onSuccess: () => router.push("/profile"),
 *   onError: (error) => console.error(error),
 * });
 * ```
 */
export const useQRCodeAuth = ({
  webSessionId,
  expiresAt,
  onSuccess,
  onError,
}: {
  webSessionId: string | null;
  expiresAt: number | null;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}): UseQRCodeAuthReturn => {
  const router = useRouter();
  const [status, setStatus] = useState<QRAuthStatus>("waiting");
  const [errorMessage, setErrorMessage] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes default

  // Subscribe to QR code scans
  const { data: subscriptionData, loading: subscriptionLoading, error: subscriptionError } = useSubscription<any>(
    NEW_QR_CODE_SCANNED_SUBSCRIPTION,
    {
      skip: !webSessionId,
      onData: ({ data }) => {
        if (data.data?.newQRCodeScanned) {
          handleQRCodeScanned(data.data.newQRCodeScanned);
        }
      },
      onError: (err) => {
        AuthLogger.logError("SUBSCRIPTION_ERROR", err);
        handleError(ErrorMessages.CONNECTION_LOST);
        onError?.(ErrorMessages.CONNECTION_LOST);
      },
    }
  );

  /**
   * Handle incoming QR code scan event
   */
  const handleQRCodeScanned = useCallback(
    (payload: { session_id: string; token: string }) => {
      try {
        AuthLogger.logQRCodeScanned(webSessionId || "", payload.session_id);

        // Validate session ID match
        if (!SessionValidator.isSessionIdMatch(payload.session_id, webSessionId || "")) {
          handleError(ErrorMessages.SESSION_MISMATCH);
          onError?.(ErrorMessages.SESSION_MISMATCH);
          return;
        }

        // Session IDs match - authentication successful
        setIsAuthenticating(true);
        setStatus("scanning");

        // Store token
        if (payload.token) {
          const success = AuthTokenManager.setAuthToken(
            payload.token,
            payload.session_id
          );

          if (!success) {
            handleError(ErrorMessages.STORAGE_ERROR);
            onError?.(ErrorMessages.STORAGE_ERROR);
            return;
          }

          AuthLogger.logTokenStored(payload.session_id);

          // Mark as successful
          setStatus("success");

          // Redirect after brief delay
          setTimeout(() => {
            onSuccess?.();
            router.push("/profile");
          }, 800);
        } else {
          handleError(ErrorMessages.TOKEN_GENERATION_FAILED);
          onError?.(ErrorMessages.TOKEN_GENERATION_FAILED);
        }
      } catch (error) {
        AuthLogger.logError("SCAN_HANDLER_ERROR", error);
        handleError(ErrorMessages.AUTHENTICATION_FAILED);
        onError?.(ErrorMessages.AUTHENTICATION_FAILED);
        setIsAuthenticating(false);
      }
    },
    [webSessionId, onSuccess, onError, router]
  );

  /**
   * Set error state and message
   */
  const handleError = (message: string) => {
    setErrorMessage(message);
    setStatus("error");
  };

  /**
   * Reset error state
   */
  const resetError = useCallback(() => {
    setErrorMessage("");
    setStatus("waiting");
  }, []);

  /**
   * Check QR code expiration
   */
  useEffect(() => {
    if (!expiresAt) return;

    const checkExpiration = () => {
      if (SessionValidator.isQRExpired(expiresAt)) {
        setStatus("error");
        setErrorMessage(ErrorMessages.QR_EXPIRED);
      } else {
        const remaining = SessionValidator.getTimeRemaining(expiresAt);
        setTimeRemaining(remaining);
      }
    };

    // Check immediately
    checkExpiration();

    // Check every second
    const interval = setInterval(checkExpiration, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  /**
   * Log session start
   */
  useEffect(() => {
    if (webSessionId) {
      AuthLogger.logSessionStart(webSessionId);
    }
  }, [webSessionId]);

  return {
    status,
    errorMessage,
    isAuthenticating,
    isSubscriptionLoading: subscriptionLoading,
    handleQRCodeScanned,
    resetError,
    timeRemaining,
  };
};

/**
 * Hook for checking if user is authenticated
 */
export const useIsAuthenticated = (): boolean => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = AuthTokenManager.getAuthToken();
    setIsAuthenticated(token !== null && token !== "");
  }, []);

  return isAuthenticated;
};

/**
 * Hook for checking authentication status
 */
export const useAuthStatus = () => {
  const [token, setToken] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = AuthTokenManager.getAuthToken();
    const sessionId = AuthTokenManager.getSessionId();
    setToken(token);
    setSessionId(sessionId);
    setIsReady(true);
  }, []);

  return {
    token,
    sessionId,
    isAuthenticated: token !== null,
    isReady,
  };
};

/**
 * Hook for handling logout
 */
export const useLogout = () => {
  const router = useRouter();

  const logout = useCallback(async () => {
    AuthTokenManager.clearAuthData();
    AuthLogger.logSessionEnd(
      AuthTokenManager.getSessionId() || "unknown",
      "User logout"
    );
    await router.push("/login");
  }, [router]);

  return logout;
};

/**
 * Hook for protected routes
 * Redirects to login if not authenticated
 */
export const useProtectedRoute = () => {
  const router = useRouter();
  const { isAuthenticated, isReady } = useAuthStatus();

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isReady, router]);

  return { isLoading: !isReady, isAuthenticated };
};

/**
 * Hook for adding auth token to Apollo cache
 */
export const useSetAuthToken = () => {
  const setToken = useCallback((token: string, sessionId: string) => {
    AuthTokenManager.setAuthToken(token, sessionId);
  }, []);

  return setToken;
};