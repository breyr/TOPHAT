/*
  Warnings:

  - You are about to drop the column `created_at` on the `topology` table. All the data in the column will be lost.
  - You are about to drop the column `expires_on` on the `topology` table. All the data in the column will be lost.
  - You are about to drop the column `react_flow_state` on the `topology` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `topology` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `topology` table. All the data in the column will be lost.
  - You are about to drop the column `account_type` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `user` table. All the data in the column will be lost.
  - Added the required column `expiresOn` to the `topology` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reactFlowState` to the `topology` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `topology` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `topology` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountType` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdAt` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ix_topology_user_id";

-- DropIndex
DROP INDEX "ix_user_username";

-- AlterTable
ALTER TABLE "topology" DROP COLUMN "created_at",
DROP COLUMN "expires_on",
DROP COLUMN "react_flow_state",
DROP COLUMN "updated_at",
DROP COLUMN "user_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expiresOn" TIMESTAMP(6) NOT NULL,
ADD COLUMN     "reactFlowState" JSONB NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "account_type",
DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "accountType" VARCHAR NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(6) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(6) NOT NULL;

-- CreateTable
CREATE TABLE "device" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "topologyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "ipAddress" VARCHAR(32) NOT NULL,
    "description" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "secretPassword" TEXT NOT NULL,
    "ports" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "icon" TEXT NOT NULL,

    CONSTRAINT "device_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "topology" ADD CONSTRAINT "topology_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device" ADD CONSTRAINT "device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device" ADD CONSTRAINT "device_topologyId_fkey" FOREIGN KEY ("topologyId") REFERENCES "topology"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
