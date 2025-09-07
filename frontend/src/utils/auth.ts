// Authentication utilities for session management
export interface UserData {
  id: string;
  username: string;
  email: string;
  is_approved: boolean;
  is_active: boolean;
  is_blocked: boolean;
  is_accessible: boolean;
  account_status: string;
  created_at: string;
  message?: string;
}
const LOG_TOKEN_KEY = "log_token";

export interface AuthSession {
  access_token: string;
  token_type: string;
  user: UserData;
}

// Session storage keys
const AUTH_TOKEN_KEY = "auth_token";
const USER_DATA_KEY = "user_data";
const AUTH_SESSION_KEY = "auth_session";

export class AuthManager {
  // Store complete authentication session
  static setAuthSession(authData: AuthSession): void {
    try {
      sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(authData));
      sessionStorage.setItem(AUTH_TOKEN_KEY, authData.access_token);
      sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(authData.user));
    } catch (error) {
      console.error("Failed to store auth session:", error);
    }
  }

  // Get complete authentication session
  static getAuthSession(): AuthSession | null {
    try {
      const sessionData = sessionStorage.getItem(AUTH_SESSION_KEY);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error("Failed to retrieve auth session:", error);
      return null;
    }
  }

  // Get just the access token
  static getAccessToken(): string | null {
    try {
      return sessionStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error("Failed to retrieve access token:", error);
      return null;
    }
  }

  // Get user data
  static getUserData(): UserData | null {
    try {
      const userData = sessionStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Failed to retrieve user data:", error);
      return null;
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // Check if user is approved
  static isUserApproved(): boolean {
    const userData = this.getUserData();
    return userData?.is_approved || false;
  }

  // Check if user has access
  static hasAccess(): boolean {
    const userData = this.getUserData();
    return userData?.is_accessible || false;
  }

  // Get user status
  static getUserStatus(): string {
    const userData = this.getUserData();
    return userData?.account_status || "unknown";
  }

  // Clear all authentication data
  static clearAuth(): void {
    try {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      sessionStorage.removeItem(USER_DATA_KEY);
    } catch (error) {
      console.error("Failed to clear auth data:", error);
    }
  }

  // Get authorization header for API requests
  static getAuthHeader(): { Authorization: string } | {} {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Update user data (useful after profile updates)
  static updateUserData(userData: UserData): void {
    try {
      sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));

      // Update the full session as well
      const session = this.getAuthSession();
      if (session) {
        session.user = userData;
        sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
      }
    } catch (error) {
      console.error("Failed to update user data:", error);
    }
  }

  static setLogToken(token: string): void {
    try {
      sessionStorage.setItem(LOG_TOKEN_KEY, token);
    } catch (error) {
      console.error("Failed to store log token:", error);
    }
  }

  // Get the log token
  static getLogToken(): string | null {
    try {
      return sessionStorage.getItem(LOG_TOKEN_KEY);
    } catch (error) {
      console.error("Failed to retrieve log token:", error);
      return null;
    }
  }

  // Clear log token
  static clearLogToken(): void {
    try {
      sessionStorage.removeItem(LOG_TOKEN_KEY);
    } catch (error) {
      console.error("Failed to clear log token:", error);
    }
  }

  // Get auth header for log API
  static getLogAuthHeader(): { Authorization: string } | {} {
    const token = this.getLogToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}
