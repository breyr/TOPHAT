/*
  Warnings:

  - Added the required column `accountStatus` to the `AppUser` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('NOTCREATED', 'PENDING', 'ACCEPTED');

-- AlterTable
ALTER TABLE "AppUser" ADD COLUMN     "accountStatus" "AccountStatus" NOT NULL;
