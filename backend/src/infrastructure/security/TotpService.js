import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { config } from '../../config/environment.js';
import { AppError } from '../../shared/errors/AppError.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

export class TotpService {
  static generateSecret() {
    return new OTPAuth.Secret({ size: 20 }).base32;
  }

  static encryptSecret(secret) {
    const key = Buffer.from(config.security.mfaEncryptionKey, 'hex');
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv); // ← Cipher, não Decipher
    const encrypted = Buffer.concat([
      cipher.update(secret, 'utf8'),
      cipher.final()
    ]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  static decryptSecret(encryptedSecret) {
    try {
      const [ivHex, tagHex, encryptedHex] = encryptedSecret.split(':');
      const key = Buffer.from(config.security.mfaEncryptionKey, 'hex');
      const iv = Buffer.from(ivHex, 'hex');
      const tag = Buffer.from(tagHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(tag);
      return decipher.update(encrypted, undefined, 'utf8') + decipher.final('utf8');
    } catch {
      throw new AppError('Erro ao processar MFA', 500, 'MFA_DECRYPT_ERROR');
    }
  }

  static generateOtpauthUrl(secret, email) {
    const totp = new OTPAuth.TOTP({
      issuer: 'NEXA Workspace',
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret)
    });
    return totp.toString();
  }

  static async generateQRCode(otpauthUrl) {
    return QRCode.toDataURL(otpauthUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 256,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' }
    });
  }

  static validateToken(token, encryptedSecret) {
    try {
      const secret = TotpService.decryptSecret(encryptedSecret);
      const totp = new OTPAuth.TOTP({
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret)
      });
      const delta = totp.validate({ token, window: 1 });
      return delta !== null;
    } catch {
      return false;
    }
  }

  static generateBackupCodes() {
    return Array.from({ length: 8 }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase()
        .match(/.{4}/g).join('-')
    );
  }
}