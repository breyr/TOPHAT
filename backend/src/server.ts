import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import app from './app';

const PORT = process.env.PORT || 3000;

async function ensureRecordExists() {
    const prisma = new PrismaClient();
    const key = 'OnboardComplete';
    const value = 'false';

    const record = await prisma.appConfig.findUnique({
        where: { key },
    });

    if (!record) {
        await prisma.appConfig.create({
            data: { key, value },
        });
        console.log(`Record with key ${key} added to AppConfig table.`);
    } else {
        console.log(`Record with key ${key} already exists in AppConfig table.`);
    }

    // close this connection because we only want one connection open and that is in DIContainer
    prisma.$disconnect();
}

async function start() {
    try {
        console.log('Checking and applying database migrations...');
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
        console.log('Migrations applied successfully.');

        await ensureRecordExists();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

start();