-- CreateTable
CREATE TABLE "Connection" (
    "id" SERIAL NOT NULL,
    "labDeviceName" TEXT NOT NULL,
    "labDevicePort" TEXT NOT NULL,
    "interconnectDeviceName" TEXT NOT NULL,
    "interconnectDevicePort" TEXT NOT NULL,

    CONSTRAINT "Connection_pkey" PRIMARY KEY ("id")
);
