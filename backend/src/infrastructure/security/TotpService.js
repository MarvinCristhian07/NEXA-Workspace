/**
 * TOTP Service - Time-based One-Time Password
 * 
 * @standard RFC 6238 (TOTP) + RFC 4226 (HOTP)
 * @security Secrets criptografados com AES-256-GCM antes de persistir
 * @security Window de ± 1 step (30s) para tolerência de clock skew
 * @security Secret nunca exposto após setup - só hash no banco
 */

import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { config } from '../../config/environment.js';
import { AppError } from '../../shared/errors/AppError.js';

// Configuração de TOTP
authenticator.options = {
    window: 1,        // Aceita código do step anterior e próximo (tolerância de clock)
    step: 30,         // Código muda a cada 30 segundos (padrão RFC 6238)
    digits: 6,        // 6 dígitos (padrão Google Authenticator)
    algorithm: 'sha1' // SHA-1 (compatível com todos os apps de autenticação)
};

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

export class TotpService {
    /**
     * Gera um novo secret TOTP
     * @returns {string} Secret em Base32
     */
    static generateSecret() {
        return authenticator.generateSecret(32); // 32 chars = 160 bits de entropia
    }

    /**
     * Criptografa o secret antes de salvar no banco
     * @param {string} secret - Secret em Base32
     * @returns {string} Secret criptografado (hex)
     * @security AES-256-GCM com IV aleatório por operação
     */
    static encryptSecret(secret) {
        const key = Buffer.from(config.security.mfaEncryptionKey, 'hex');
        const iv = crypto.randomBytes(IV_LENGTH);

        const cipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        const encrypted = Buffer.concat([
            cipher.update(secret, 'utf-8'),
            cipher.final()
        ]);
        const tag = cipher.getAuthTag();

        // Formato: iv:tag:encrypted (tudo em hex)
        return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
    }

    /**
     * Descriptografa o secret do banco
     * @param {string} encryptedSecret - Secret criptografado
     * @returns {string} Secret em Base32
     */
    static decryptSecret(encryptedSecret) {
        try {
            const [ivHex, tagHex, encryptedHex] = encryptedSecret.split(':');

            const key = Buffer.from(config.security.mfaEncryptionKey, 'hex');
            const iv = Buffer.from(ivHex, 'hex');
            const tag = Buffer.from(tagHex, 'hex');
            const encrypted = Buffer.from(encryptedHex, 'hex');

            const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
            decipher.setAuthTag(tag);

            return decipher.update(encrypted) + decipher.final('utf-8');
        } catch {
            throw new AppError('Erro ao processar MFA', 500, 'MFA_DECRYPT_ERROR');
        }
    }

    /**
     * Gera URL otpauth para QR Code
     * @param {string} secret - Secret em Base32
     * @param {string} email - Email do usuário
     * @returns {string} URL otpauth://
     */
    static generateOtpauthUrl(secret, email) {
        return authenticator.keyuri(
            email,
            'NEXA Workspace',
            secret
        );
    }

    /**
     * Gera QR Code como Data URL (base64)
     * @param {string} otpauthUrl - URL otpauth://
     * @returns {Promise<string>} QR Code em base64
     */
    static async generateQRCode(otpauthUrl) {
        return QRCode.toDataURL(otpauthUrl, {
            errorCorrectionLevel: 'H', // Alta correção de erros
            type: 'image/png',
            width: 256,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
    }

    /**
     * Valida um código TOTP
     * @param {string} token - Código de 6 dígitos
     * @param {string} encryptedSecret - Secret criptografado do banco
     * @returns {boolean} True se válido
     */
    static validateToken(token, encryptedSecret) {
        try {
            const secret = TotpService.decryptSecret(encryptedSecret);
            return authenticator.verify({ token, secret });
        } catch {
            return false;
        }
    }

    /**
     * Gera tokens de backup (one-time use)
     * @returns {string[]} 8 códigos de backup
     */
    static generateBackupCodes() {
        return Array.from({ length: 8 }, () =>
            crypto.randomBytes(4).toString('hex').toUpperCase()
                .match(/.{4}/g).join('-') // Formato: XXXX-XXXX
        );
    }
}