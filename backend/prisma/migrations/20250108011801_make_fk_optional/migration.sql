-- DropForeignKey
ALTER TABLE "Device" DROP CONSTRAINT "Device_topologyId_fkey";

-- DropForeignKey
ALTER TABLE "Device" DROP CONSTRAINT "Device_userId_fkey";

-- AlterTable
ALTER TABLE "Device" ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "topologyId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_topologyId_fkey" FOREIGN KEY ("topologyId") REFERENCES "Topology"("id") ON DELETE SET NULL ON UPDATE CASCADE;
