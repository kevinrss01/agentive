import { Router } from 'express';
import transcribeRoutes from './transcribe.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import conversationsRoutes from './conversations.routes';
import knowledgeRoutes from './knowledge.routes';

const router: Router = Router();

// Health check route
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

router.use('/transcribe', transcribeRoutes);
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/conversations', conversationsRoutes);
router.use('/knowledge', knowledgeRoutes);

export default router;
