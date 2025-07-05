import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { TranscribeController } from '@/controllers/transcribe.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import multer from 'multer';

const router: Router = Router();
const transcribeController = new TranscribeController();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

router.post(
  '/',
  authenticateJWT,
  upload.single('audio'),
  asyncHandler(transcribeController.process)
);

// router.get('/:id', asyncHandler(transcribeController.getById));
// router.post('/', asyncHandler(transcribeController.create));
// router.put('/:id', asyncHandler(transcribeController.update));
// router.delete('/:id', asyncHandler(exampleController.delete));

export default router;
