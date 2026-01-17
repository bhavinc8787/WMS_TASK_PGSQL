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


/**
 * @swagger
 * tags:
 *   name: Warehouses
 *   description: Warehouse management endpoints
 */
const router = Router();


/**
 * @swagger
 * /api/warehouses:
 *   get:
 *     summary: Get all warehouses
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of warehouses
 */
router.get('/', authMiddleware, getAllWarehouses);
/**
 * @swagger
 * /api/warehouses/search:
 *   get:
 *     summary: Search warehouses
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search keyword
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: State
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: City
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', authMiddleware, searchWarehouses);
/**
 * @swagger
 * /api/warehouses/{id}:
 *   get:
 *     summary: Get warehouse by ID
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Warehouse data
 */
router.get('/:id', authMiddleware, getWarehouseById);
/**
 * @swagger
 * /api/warehouses:
 *   post:
 *     summary: Create a warehouse
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - warehouse_name
 *               - address1
 *               - areaLocality
 *               - state
 *               - city
 *               - pincode
 *               - totalLotArea
 *               - coveredArea
 *             properties:
 *               warehouse_name:
 *                 type: string
 *                 example: My Warehouse
 *               address1:
 *                 type: string
 *                 example: 123 Main St
 *               address2:
 *                 type: string
 *                 example: Suite 100
 *               areaLocality:
 *                 type: string
 *                 example: Downtown
 *               state:
 *                 type: string
 *                 example: Gujarat
 *               city:
 *                 type: string
 *                 example: Ahmedabad
 *               pincode:
 *                 type: string
 *                 example: 380001
 *               gstno:
 *                 type: string
 *                 example: 24ABCDE1234F2Z5
 *               totalLotArea:
 *                 type: number
 *                 example: 10000
 *               coveredArea:
 *                 type: number
 *                 example: 8000
 *               noOfDocs:
 *                 type: number
 *                 example: 2
 *               noOfGate:
 *                 type: number
 *                 example: 1
 *               storageHeight:
 *                 type: number
 *                 example: 20
 *               parkingArea:
 *                 type: number
 *                 example: 500
 *               status:
 *                 type: string
 *                 enum: [publish, unpublish]
 *                 example: unpublish
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Up to 4 images
 *     responses:
 *       201:
 *         description: Warehouse created
 */
router.post('/', authMiddleware, uploadWarehouseImages, createWarehouse);
/**
 * @swagger
 * /api/warehouses/{id}:
 *   put:
 *     summary: Update a warehouse
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               warehouse_name:
 *                 type: string
 *               address1:
 *                 type: string
 *               address2:
 *                 type: string
 *               areaLocality:
 *                 type: string
 *               state:
 *                 type: string
 *               city:
 *                 type: string
 *               pincode:
 *                 type: string
 *               gstno:
 *                 type: string
 *               totalLotArea:
 *                 type: number
 *               coveredArea:
 *                 type: number
 *               noOfDocs:
 *                 type: number
 *               noOfGate:
 *                 type: number
 *               storageHeight:
 *                 type: number
 *               parkingArea:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [publish, unpublish]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Up to 4 images
 *     responses:
 *       200:
 *         description: Warehouse updated
 */
router.put('/:id', authMiddleware, uploadWarehouseImages, updateWarehouse);
/**
 * @swagger
 * /api/warehouses/{id}:
 *   delete:
 *     summary: Delete a warehouse
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Warehouse deleted
 */
router.delete('/:id', authMiddleware, deleteWarehouse);
/**
 * @swagger
 * /api/warehouses/{id}/status:
 *   patch:
 *     summary: Update warehouse status
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [publish, unpublish]
 *                 example: publish
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/:id/status', authMiddleware, updateWarehouseStatus);

export default router;
