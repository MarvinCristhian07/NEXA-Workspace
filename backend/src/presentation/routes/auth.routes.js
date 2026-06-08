/**
 * Routes: Autenticação e Onboarding
 * @security Rate limiting aplicado
 */

import { Router } from 'express';
import { RegisterController } from '../controllers/RegisterController.js';
import { AuthController } from '../controllers/AuthController.js';
import { validateRequest } from '../middlewares/requestValidator.js';
import { registerSchema } from '../validators/registerSchema.js';
import { loginSchema } from '../validators/loginSchema.js';
import { loginLimiter, registerLimiter } from '../middlewares/rateLimiter.js';

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

/**
 * POST /api/auth/login
 * @description Autenticação de usuário e emissão de JWT
 * @security Rate limited, timing-safe, sem enumeração de usuários
 */
router.post(
    '/login',
    loginLimiter,
    validateRequest(loginSchema),
    AuthController.login
)

export default router;