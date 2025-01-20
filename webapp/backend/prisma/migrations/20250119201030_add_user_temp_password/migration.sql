/*
  Warnings:

  - Added the required column `tempPassword` to the `AppUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AppUser" ADD COLUMN     "tempPassword" VARCHAR NOT NULL;
