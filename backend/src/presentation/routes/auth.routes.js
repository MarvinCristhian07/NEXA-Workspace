/**
 * Routes: Autenticação e Onboarding
 * @security Rate limiting aplicado
 */

import { Router } from 'express';
import { RegisterController } from '../controllers/RegisterController.js';
import { validateRequest } from '../middlewares/requestValidator.js';
import { registerSchema } from '../validators/registerSchema.js';
import { registerLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

/**
 * POST /api/auth/register
 * @description Cadastro de nova organização (Onboarding B2B)
 * @security Rate limited, validação em múltiplas camadas
 */
router.post(
    '/register',
    registerLimiter,
    validateRequest(registerSchema),
    RegisterController.handle
);

export default router;