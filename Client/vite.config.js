import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      plugins: [
        {
          name: 'html-loader',
          transform(code, id) {
            if (id.endsWith('.html')) {
              return `export default ${JSON.stringify(code)}`;
            }
          },
        },
      ],
    },
  },

  server:{
    proxy:{
      '/api':'http://localhost:8000'

      }
      
    },

});
