/*
  Warnings:

  - You are about to drop the column `capacity` on the `Warehouse` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Warehouse` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Warehouse` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[warehouseId]` on the table `Warehouse` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `address1` to the `Warehouse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `areaLocality` to the `Warehouse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Warehouse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coveredArea` to the `Warehouse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pincode` to the `Warehouse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Warehouse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalLotArea` to the `Warehouse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `warehouseId` to the `Warehouse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `warehouse_name` to the `Warehouse` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WarehouseStatus" AS ENUM ('publish', 'unpublish', 'in_active');

-- AlterTable
ALTER TABLE "Warehouse" DROP COLUMN "capacity",
DROP COLUMN "location",
DROP COLUMN "name",
ADD COLUMN     "address1" TEXT NOT NULL,
ADD COLUMN     "address2" TEXT,
ADD COLUMN     "areaLocality" TEXT NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "coveredArea" INTEGER NOT NULL,
ADD COLUMN     "gstno" TEXT,
ADD COLUMN     "noOfDocs" INTEGER,
ADD COLUMN     "noOfGate" INTEGER,
ADD COLUMN     "parkingArea" INTEGER,
ADD COLUMN     "pincode" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "status" "WarehouseStatus" NOT NULL DEFAULT 'unpublish',
ADD COLUMN     "storageHeight" INTEGER,
ADD COLUMN     "totalLotArea" INTEGER NOT NULL,
ADD COLUMN     "warehouseId" TEXT NOT NULL,
ADD COLUMN     "warehouseImages" TEXT[],
ADD COLUMN     "warehouse_name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_warehouseId_key" ON "Warehouse"("warehouseId");
