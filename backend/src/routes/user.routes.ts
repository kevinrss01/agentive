import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { UserController } from '../controllers/user.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router: Router = Router();
const userController = new UserController();

router.post('/settings', authenticateJWT, asyncHandler(userController.settingsSave));

export default router;
