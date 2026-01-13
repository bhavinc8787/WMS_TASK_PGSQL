import { Request, Response } from 'express';
import path from 'path';
import { prisma } from '../config';
import { Prisma, WarehouseStatus } from '@prisma/client';

// GET ALL WAREHOUSES (exclude in_active)
 
export const getAllWarehouses = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 7;
    const skip = (page - 1) * limit;

    const where: Prisma.WarehouseWhereInput = {
      status: { not: WarehouseStatus.in_active },
    };

    const total = await prisma.warehouse.count({ where });

    const warehouses = await prisma.warehouse.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }
      ],
    });

    res.json({
      success: true,
      data: warehouses,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET WAREHOUSE BY ID
 
export const getWarehouseById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const warehouse = await prisma.warehouse.findFirst({
      where: {
        id,
        status: { not: WarehouseStatus.in_active },
      },
    });

    if (!warehouse) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }

    res.json({ success: true, data: warehouse });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE WAREHOUSE

export const createWarehouse = async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    const missing: string[] = [];
    if (!payload.warehouse_name) missing.push('warehouse_name');
    if (!payload.address1) missing.push('address1');
    if (!payload.areaLocality) missing.push('areaLocality');
    if (!payload.state) missing.push('state');
    if (!payload.city) missing.push('city');
    if (!payload.pincode) missing.push('pincode');
    if (!payload.totalLotArea) missing.push('totalLotArea');
    if (!payload.coveredArea) missing.push('coveredArea');

    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missing,
      });
    }


    // Map uploaded files to fixed slots (0: Front, 1: Docks/Gate, 2: Covered, 3: Outside)
    const files = (req.files as Express.Multer.File[]) || [];
    if (files.length > 4) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 4 images allowed',
      });
    }
    // Always return an array of 4 slots (empty string if not provided)
    const warehouseImages = Array(4).fill('').map((_, i) =>
      files[i] ? `/uploads/warehouses/${path.basename(files[i].path)}` : ''
    );

    const warehouse = await prisma.warehouse.create({
      data: {
        warehouseId: `WH-${Date.now()}`,
        warehouse_name: payload.warehouse_name,
        address1: payload.address1,
        address2: payload.address2,
        areaLocality: payload.areaLocality,
        state: payload.state,
        city: payload.city,
        pincode: payload.pincode,
        gstno: payload.gstno,
        totalLotArea: Number(payload.totalLotArea),
        coveredArea: Number(payload.coveredArea),
        noOfDocs: payload.noOfDocs ? Number(payload.noOfDocs) : undefined,
        noOfGate: payload.noOfGate ? Number(payload.noOfGate) : undefined,
        storageHeight: payload.storageHeight ? Number(payload.storageHeight) : undefined,
        parkingArea: payload.parkingArea ? Number(payload.parkingArea) : undefined,
        status: payload.status ?? WarehouseStatus.unpublish,
        warehouseImages,
      },
    });

    res.status(201).json({ success: true, data: warehouse });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE WAREHOUSE

export const updateWarehouse = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const payload = req.body;

    const existing = await prisma.warehouse.findFirst({
      where: { id, status: { not: WarehouseStatus.in_active } },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }


    // Map uploaded files to fixed slots (0: Front, 1: Docks/Gate, 2: Covered, 3: Outside)
    const files = (req.files as Express.Multer.File[]) || [];
    // If no new files, keep existing images
    let warehouseImages = existing.warehouseImages || Array(4).fill('');
    if (files.length > 0) {
      warehouseImages = Array(4).fill('').map((_, i) =>
        files[i] ? `/uploads/warehouses/${path.basename(files[i].path)}` : (existing.warehouseImages[i] || '')
      );
    }

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: {
        warehouse_name: payload.warehouse_name,
        address1: payload.address1,
        address2: payload.address2,
        areaLocality: payload.areaLocality,
        state: payload.state,
        city: payload.city,
        pincode: payload.pincode,
        gstno: payload.gstno,
        totalLotArea: payload.totalLotArea ? Number(payload.totalLotArea) : undefined,
        coveredArea: payload.coveredArea ? Number(payload.coveredArea) : undefined,
        noOfDocs: payload.noOfDocs ? Number(payload.noOfDocs) : undefined,
        noOfGate: payload.noOfGate ? Number(payload.noOfGate) : undefined,
        storageHeight: payload.storageHeight ? Number(payload.storageHeight) : undefined,
        parkingArea: payload.parkingArea ? Number(payload.parkingArea) : undefined,
        warehouseImages,
      },
    });

    res.json({ success: true, data: warehouse });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// SOFT DELETE
 
export const deleteWarehouse = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid warehouse id',
      });
    }

    const existing = await prisma.warehouse.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found',
      });
    }

    await prisma.warehouse.update({
      where: { id },
      data: { status: 'in_active' },
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};




// SEARCH WAREHOUSES (FIXED)

export const searchWarehouses = async (req: Request, res: Response) => {
  try {
    const q = req.query.q?.toString();
    const state = req.query.state?.toString();
    const city = req.query.city?.toString();

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 7;
    const skip = (page - 1) * limit;

    const andConditions: Prisma.WarehouseWhereInput[] = [];

    if (state) {
      andConditions.push({ state: { equals: state, mode: 'insensitive' } });
    }

    if (city) {
      andConditions.push({ city: { contains: city, mode: 'insensitive' } });
    }

    if (q) {
      andConditions.push({
        OR: [
          { warehouse_name: { contains: q, mode: 'insensitive' } },
          { areaLocality: { contains: q, mode: 'insensitive' } },
          { city: { contains: q, mode: 'insensitive' } },
          { state: { contains: q, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.WarehouseWhereInput = {
      status: { not: WarehouseStatus.in_active },
      AND: andConditions.length ? andConditions : undefined,
    };

    const total = await prisma.warehouse.count({ where });

    const warehouses = await prisma.warehouse.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }
      ],
    });

    res.json({
      success: true,
      data: warehouses,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE STATUS
 
export const updateWarehouseStatus = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (![WarehouseStatus.publish, WarehouseStatus.unpublish].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: { status },
    });

    res.json({ success: true, data: warehouse });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
