/*
  Warnings:

  - Changed the type of `type` on the `device` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `icon` to the `device` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `accountType` on the `user` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('LAB', 'INTERCONNECT');

-- CreateEnum
CREATE TYPE "IconType" AS ENUM ('ROUTER', 'SWITCH', 'EXTERNAL', 'SERVER');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "device" DROP COLUMN "type",
ADD COLUMN     "type" "DeviceType" NOT NULL,
DROP COLUMN "icon",
ADD COLUMN     "icon" "IconType" NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "accountType",
ADD COLUMN     "accountType" "AccountType" NOT NULL;
