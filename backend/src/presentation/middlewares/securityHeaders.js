/**
 * Middleware: Headers de Segurança
 *
 * @security Helmet configurado com políticas estritas
 * @security Headers customizados para fingerprinting protection
 */

import helmet from 'helmet';

export const securityHeaders = [
  // Helmet com configuração completa
  helmet({
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ['\'self\''],
        scriptSrc: ['\'self\''],
        styleSrc: ['\'self\'', '\'unsafe-inline\''],
        imgSrc: ['\'self\'', 'data:', 'https:'],
        connectSrc: ['\'self\''],
        fontSrc: ['\'self\''],
        objectSrc: ['\'none\''],
        mediaSrc: ['\'none\''],
        frameSrc: ['\'none\''],
        frameAncestors: ['\'none\'']
      }
    },

    // HTTP Strict Transport Security
    hsts: {
      maxAge: 31_536_000, // 1 ano
      includeSubDomains: true,
      preload: true
    },

    // Não detectar MIME type automaticamente
    noSniff: true,

    // Bloquear iframe embedding
    frameguard: { action: 'deny' },

    // Remover header X-Powered-By (fingerprinting)
    hidePoweredBy: true,

    // XSS Protection (para browsers antigos)
    xssFilter: true,

    // Referrer Policy
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

    // Permissions Policy (bloqueia APIs desnecessárias)
    permittedCrossDomainPolicies: false
  }),

  // Header customizado — identifica a API sem revelar tecnologia
  (req, res, next) => {
    res.setHeader('X-API-Version', '1.0');
    res.removeHeader('X-Powered-By'); // Garante remoção
    next();
  }
];