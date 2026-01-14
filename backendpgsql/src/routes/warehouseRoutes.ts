import { Router } from 'express';
import {
	getAllWarehouses,
	getWarehouseById,
	createWarehouse,
	updateWarehouse,
	deleteWarehouse,
	searchWarehouses,
	updateWarehouseStatus
} from '../controllers/warehouseController';
import { uploadWarehouseImages } from '../middleware/upload';
import { authMiddleware } from '../middleware/auth';

const router = Router();


router.get('/', authMiddleware, getAllWarehouses);
router.get('/search', authMiddleware, searchWarehouses);
router.get('/:id', authMiddleware, getWarehouseById);
router.post('/', authMiddleware, uploadWarehouseImages, createWarehouse);
router.put('/:id', authMiddleware, uploadWarehouseImages, updateWarehouse);
router.delete('/:id', authMiddleware, deleteWarehouse);
router.patch('/:id/status', authMiddleware, updateWarehouseStatus);

export default router;
