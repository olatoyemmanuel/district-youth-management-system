export interface AuthActor {
  userAccountId: string;
  sessionId: string;
  loginIdentifier: string;
}

export interface AuthCredentials {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
  csrfToken: string;
  account: {
    id: string;
    loginIdentifier: string;
    status: string;
  };
}

export interface AccessTokenClaims {
  iss: 'dyms-api';
  sub: string;
  sid: string;
  iat: number;
  exp: number;
  jti: string;
}
