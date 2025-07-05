import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router: Router = Router();
const authController = new AuthController();

// Public routes
router.get('/google', asyncHandler(authController.loginGoogle));
router.post('/callback', asyncHandler(authController.callback));
router.post('/login', asyncHandler(authController.login));

// Protected routes
router.get('/user/:id', authenticateToken, asyncHandler(authController.getUser));
router.post('/logout', authenticateToken, asyncHandler(authController.logout));

export default router;
