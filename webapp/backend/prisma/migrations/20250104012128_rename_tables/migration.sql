/*
  Warnings:

  - You are about to drop the `device` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `topology` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "device" DROP CONSTRAINT "device_topologyId_fkey";

-- DropForeignKey
ALTER TABLE "device" DROP CONSTRAINT "device_userId_fkey";

-- DropForeignKey
ALTER TABLE "topology" DROP CONSTRAINT "topology_userId_fkey";

-- DropTable
DROP TABLE "device";

-- DropTable
DROP TABLE "topology";

-- DropTable
DROP TABLE "user";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR NOT NULL,
    "email" VARCHAR NOT NULL,
    "password" VARCHAR NOT NULL,
    "accountType" "AccountType" NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topology" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" VARCHAR NOT NULL,
    "thumbnail" BYTEA NOT NULL,
    "reactFlowState" JSONB NOT NULL,
    "expiresOn" TIMESTAMP(6) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "topologyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "ipAddress" VARCHAR(32),
    "description" TEXT,
    "password" TEXT,
    "username" TEXT,
    "secretPassword" TEXT,
    "ports" TEXT NOT NULL,
    "type" "DeviceType" NOT NULL,
    "icon" "IconType" NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Topology" ADD CONSTRAINT "Topology_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_topologyId_fkey" FOREIGN KEY ("topologyId") REFERENCES "Topology"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
