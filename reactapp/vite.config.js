import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [plugin()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        proxy: {
            '^/weatherforecast': {
                target: 'https://localhost:7229/',
                secure: false
            }
        },
        port: 5173,
        https: process.env.CI ? false : {
            key: fs.readFileSync(path.join(baseFolder, `${certificateName}.key`)),
            cert: fs.readFileSync(path.join(baseFolder, `${certificateName}.pem`)),
        }
    }
});
