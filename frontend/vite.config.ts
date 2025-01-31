import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

const plugins = [react(), svgr()];

export default defineConfig(({ command }) => {
  if (command === 'build') {
    return {
      plugins,
    }
  } else {
    return {
      server: {
        proxy: {
          '/api': {
            target: 'http://localhost:3000',
            changeOrigin: true,
            secure: false,
            ws: true,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            configure: (proxy, _options) => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              proxy.on('error', (err, _req, _res) => {
                console.error('proxy error', err);
              });
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              proxy.on('proxyReq', (_proxyReq, req, _res) => {
                console.log('Sending request to the Target:', req.method, req.url)
              });
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              proxy.on('proxyRes', (proxyRes, req, _res) => {
                console.log('Received response from the Target:', proxyRes.statusCode, req.url)
              });
            }
          },
          '/interconnect': {
            target: 'http://localhost:4000',
            changeOrigin: true,
            secure: false,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            configure: (proxy, _options) => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              proxy.on('error', (err, _req, _res) => {
                console.error('proxy error', err);
              });
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              proxy.on('proxyReq', (_proxyReq, req, _res) => {
                console.log('Sending request to the Target:', req.method, req.url)
              });
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              proxy.on('proxyRes', (proxyRes, req, _res) => {
                console.log('Received response from the Target:', proxyRes.statusCode, req.url)
              });
            }
          }
        }
      },
      plugins
    }
  }
})