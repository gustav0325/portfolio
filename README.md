# Portfólio

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · GSAP + ScrollTrigger.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm run start
```

## Hero

Implementado a partir do frame **Hero** (1440×1175) do Figma.

- `src/components/hero/` — componentes do Hero e a geometria em `hero.module.css`
  (coordenadas do Figma convertidas em `cqw/cqh`).
- `src/lib/animations/heroParallax.ts` — parallax com scroll (profundidades em `DEPTH`).
- `public/hero/` — camadas e ícones exportados do Figma.

## Configuração pendente

As URLs das redes sociais ficam em `src/config/site.ts` (`socialLinks[].href`).
Enquanto estiverem vazias, os ícones aparecem, mas os links ficam desabilitados.
