import { defineConfig } from 'vite';
import { existsSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { MATERIAL_PADRAO } from './src/config.js';

// O video do hero e opcional. Em vez de sondar por rede em runtime (que gera
// 404 no console quando o arquivo nao existe), o build detecta a presenca do
// arquivo e o JS so tenta carregar quando ele realmente esta la.
// Basta colocar hero.mp4 em public/assets/video/ e publicar: o deploy da Vercel
// roda o build de novo e o video passa a entrar sozinho.
const TEM_VIDEO = existsSync('public/assets/video/hero.mp4');

// Com MATERIAL_PADRAO preenchido, a raiz do site publicado e a /entrega:
// o link puro do dominio abre direto o quiz do material. Os assets usam
// caminho absoluto (/assets/...), entao a mesma pagina funciona nos dois
// enderecos. Em `npm run dev` a raiz continua sendo a home.
const raizEntrega = {
  name:'raiz-entrega',
  apply:'build',
  closeBundle(){
    if(!MATERIAL_PADRAO) return;
    copyFileSync(resolve(process.cwd(),'dist/entrega/index.html'), resolve(process.cwd(),'dist/index.html'));
  }
};

export default defineConfig({
  plugins:[raizEntrega],
  // Multipagina: sem fallback de SPA, senao /entrega cai na home silenciosamente.
  appType:'mpa',
  define:{ __TEM_VIDEO__: JSON.stringify(TEM_VIDEO) },
  build:{
    target:'es2020',
    cssCodeSplit:false,
    assetsInlineLimit:2048,
    rollupOptions:{
      // Multipagina: a home e a pagina de entrega do funil organico.
      input:{
        main:    resolve(process.cwd(),'index.html'),
        entrega: resolve(process.cwd(),'entrega/index.html')
      },
      output:{ manualChunks:{ motion:['gsap','lenis'] } }
    }
  }
});
