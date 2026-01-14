import { Router } from 'express';
import { register, login, verifyToken } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/signup', register);
router.post('/login', login);
router.get('/verify', authMiddleware, verifyToken);

export default router;
