import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import commonjs from '@rollup/plugin-commonjs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    commonjs(),
    {
      name: "error-reporter",

      // ref: https://vite.dev/guide/api-plugin.html#transformindexhtml
      transformIndexHtml(html) {
        return [
          {
            tag: "script",
            attrs: { type: "module" },
            injectTo: "head",
            children: `
            // Report any logs, errors, etc to the parent app context
            for (const method of ['log', 'debug', 'info', 'error', 'warn']) {
              const originalFn = console[method];
              console[method] = function(...args) {
                window.parent.postMessage({ type: 'console', method, args: args.map(a => \`\${a}\`) }, '*');
                return originalFn(...args);
              };
            }

            // Report any thrown errors / promise rejections so they show up in the logs
            window.addEventListener('error', (e) => {
              if (window.parent) {
                window.parent.postMessage({ type: 'error', stack: e.error.stack }, '*');
              }
            });
            window.addEventListener('unhandledrejection', (e) => {
              if (window.parent) {
                window.parent.postMessage({ type: 'unhandledrejection', reason: e.reason }, '*');
              }
            });

            // Report URL change event from iframe
            const originalPushState = history.pushState;
            const originalReplaceState = history.replaceState;

            const notifyParent = () => {
              window.parent.postMessage({ type: 'iframe_url_changed', url: window.location.href }, '*');
            };

            history.pushState = function (...args) {
              originalPushState.apply(this, args);
              notifyParent();
            };

            history.replaceState = function (...args) {
              originalReplaceState.apply(this, args);
              notifyParent();
            };

            window.addEventListener('popstate', notifyParent);
            window.addEventListener('hashchange', notifyParent);
          `,
          },
        ];
      },

      transform(src: string, id: string) {
        if (id === "/app/src/main.tsx") {
          return `
            ${src}
            if (process.env.NODE_ENV === 'development') {
              // Report any vite-hmr errors up to the parent app context
              // Full event list: https://vite.dev/guide/api-hmr.html
              if (import.meta.hot) {
                import.meta.hot.on('vite:error', (data) => {
                  if (window.parent) {
                    window.parent.postMessage({ type: 'vite:hmr:error', data }, '*');
                  }
                });
                import.meta.hot.on('vite:beforeUpdate', (data) => {
                  if (window.parent) {
                    window.parent.postMessage({ type: 'vite:hmr:beforeUpdate', data }, '*');
                  }
                });
                import.meta.hot.on('vite:afterUpdate', (data) => {
                  if (window.parent) {
                    window.parent.postMessage({ type: 'vite:hmr:afterUpdate', data }, '*');
                  }
                });
              }
            }
          `;
        }
      },
    },
  ],
  server: {
    allowedHosts: true,
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  optimizeDeps: {
    exclude: [],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  define: {
    'process.env': {},
    'process.browser': true,
  },
});
