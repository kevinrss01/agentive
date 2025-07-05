import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ConversationsController } from '@/controllers/conversations.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router: Router = Router();
const conversationsController = new ConversationsController();

// Protected routes
router.get('/', authenticateJWT, asyncHandler(conversationsController.index));
router.get('/:conversationUUID', authenticateJWT, asyncHandler(conversationsController.show));

// router.post('/conversations', authenticateToken, asyncHandler(authController.logout));

export default router;
