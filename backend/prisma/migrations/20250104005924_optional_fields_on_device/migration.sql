-- AlterTable
ALTER TABLE "device" ALTER COLUMN "ipAddress" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "username" DROP NOT NULL,
ALTER COLUMN "secretPassword" DROP NOT NULL,
ALTER COLUMN "icon" DROP NOT NULL;
