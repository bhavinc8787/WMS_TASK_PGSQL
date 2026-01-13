import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: './uploads/warehouses',
  filename: (req, file, cb) => {
    // Use Date.now and a random string for uniqueness
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `WHIMG-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

export const uploadWarehouseImages = multer({
  storage,
  fileFilter,
  limits: { files: 4, fileSize: 5 * 1024 * 1024 },
}).array('warehouseImages[]', 4);
