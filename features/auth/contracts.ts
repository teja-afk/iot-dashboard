/**
 * Server-side boundary for the future authentication provider.
 * Implementations should use the MySQL repository and MSG91 server credentials;
 * neither database access nor SMS credentials belong in browser code.
 */
export type OtpChallenge = {
  challengeId: string;
  maskedMobile: string;
  expiresAt: string;
};

export type AuthenticatedUser = {
  id: string;
  mobile: string;
};

export interface AuthService {
  requestOtp(input: {
    mobile: string;
    password: string;
  }): Promise<OtpChallenge>;
  verifyOtp(input: {
    challengeId: string;
    code: string;
  }): Promise<AuthenticatedUser>;
  getSession(): Promise<AuthenticatedUser | null>;
  signOut(): Promise<void>;
}
