import app from './app';
import {execSync} from "child_process";

const PORT = process.env.PORT || 3000;

function start() {
    try {
        console.log('Checking and applying database migrations...');
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
        console.log('Migrations applied successfully.');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

start();