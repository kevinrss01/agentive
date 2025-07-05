import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { KnowledgeController } from '@/controllers/knowledge.controller';

const router: Router = Router();
const knowledgeController = new KnowledgeController();

router.post('/knowledge', authenticateJWT, asyncHandler(knowledgeController.knowledgeInsert));

export default router;
