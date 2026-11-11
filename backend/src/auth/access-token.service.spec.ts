import { ConfigService } from '@nestjs/config';

import { AccessTokenService } from './access-token.service.js';

describe('AccessTokenService', () => {
  const service = new AccessTokenService(
    new ConfigService({
      AUTH_ACCESS_TOKEN_SECRET:
        'test-access-token-secret-that-is-long-enough-for-hmac',
    }),
  );

  it('issues a verifiable 15-minute access token', () => {
    const issued = service.issue(
      '7f1b1f2c-1d7d-4b14-9f52-7a5b19e6d2a1',
      'f7a1e4f8-4f9b-4f6b-9d8a-9a1a7b4c3d2e',
    );
    const claims = service.verify(issued.token);

    expect(claims?.sub).toBe('7f1b1f2c-1d7d-4b14-9f52-7a5b19e6d2a1');
    expect(claims?.sid).toBe('f7a1e4f8-4f9b-4f6b-9d8a-9a1a7b4c3d2e');
    expect(issued.expiresAt.getTime() - claims!.iat * 1000).toBe(15 * 60 * 1000);
  });

  it('rejects a modified signature and malformed tokens', () => {
    const issued = service.issue(
      '7f1b1f2c-1d7d-4b14-9f52-7a5b19e6d2a1',
      'f7a1e4f8-4f9b-4f6b-9d8a-9a1a7b4c3d2e',
    );

    expect(service.verify(`${issued.token.slice(0, -1)}x`)).toBeNull();
    expect(service.verify('not.a.jwt')).toBeNull();
  });
});
