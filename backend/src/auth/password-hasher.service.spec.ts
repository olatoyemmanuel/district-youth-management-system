import { PasswordHasherService } from './password-hasher.service.js';

describe('PasswordHasherService', () => {
  const service = new PasswordHasherService();

  it('creates an Argon2id hash and verifies the original password', async () => {
    const password = 'Correct horse battery staple 2026!';
    const hash = await service.hash(password);

    expect(hash.startsWith('$argon2id$')).toBe(true);
    expect(hash).not.toContain(password);
    await expect(service.verify(hash, password)).resolves.toBe(true);
    await expect(service.verify(hash, 'incorrect password')).resolves.toBe(false);
  });

  it('rejects malformed password hashes without leaking parser errors', async () => {
    await expect(service.verify('not-a-valid-hash', 'password')).resolves.toBe(
      false,
    );
  });
});
