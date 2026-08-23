/**
 * Routes: Autenticação e Onboarding
 * @security Rate limiting aplicado
 */

import { Router } from 'express';
import { RegisterController } from '../controllers/RegisterController.js';
import { AuthController } from '../controllers/AuthController.js';
import { MfaController } from '../controllers/MfaController.js';
import { validateRequest } from '../middlewares/requestValidator.js';
import { authenticate } from '../middlewares/authenticate.js';
import { registerSchema } from '../validators/registerSchema.js';
import { loginSchema } from '../validators/loginSchema.js';
import { mfaTokenSchema, mfaValidateSchema } from '../validators/mfaSchema.js';
import { loginLimiter, registerLimiter, mfaLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// Onboarding
router.post('/register',
  registerLimiter,
  validateRequest(registerSchema),
  RegisterController.handle
);

// Login
router.post('/login',
  loginLimiter,
  validateRequest(loginSchema),
  AuthController.login
);

// MFA Setup (requer autenticação completa)
router.get('/mfa/setup',
  authenticate,
  MfaController.setup
);

router.post('/mfa/verify-setup',
  authenticate,
  mfaLimiter,
  validateRequest(mfaTokenSchema),
  MfaController.verifySetup
);

// MFA Validação no login (usa mfaToken temporário)
router.post('/mfa/validate',
  mfaLimiter,
  validateRequest(mfaValidateSchema),
  MfaController.validate
);

export default router;