import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import * as argon2 from 'argon2';

/**
 * Argon2id password hashing. Parameters are deliberately explicit so
 * deployment changes are reviewed and tested rather than silently inherited.
 */
@Injectable()
export class PasswordHasherService {
  private readonly dummyHash = argon2.hash(
    randomBytes(32),
    {
      type: argon2.argon2id,
      memoryCost: 19_456,
      timeCost: 2,
      parallelism: 1,
    },
  );

  async hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19_456,
      timeCost: 2,
      parallelism: 1,
    });
  }

  async verify(encodedHash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(encodedHash, password);
    } catch {
      return false;
    }
  }

  async verifyDummy(password: string): Promise<void> {
    const encodedHash = await this.dummyHash;
    await this.verify(encodedHash, password);
  }
}
