import { gsap } from "gsap";
import { HOVER_MOTION as M, PROJECT_LINK_HOVER as P, SUNSET } from "./hoverConfig";

/*
 * Motor das microinterações (valores em hoverConfig.ts).
 *
 * Um único conjunto de listeners no documento (delegação): nenhum componente
 * precisa virar Client Component para ganhar hover. O elemento interativo é
 * marcado com `data-hover`, e as partes dentro dele dizem o que acontece:
 *
 *   data-magnetic="social|link"  atração em direção ao ponteiro
 *                                (move [data-magnetic-inner], ou o próprio)
 *   [data-fill]                  disco que cresce do ponto de entrada
 *   [data-roll]                  texto/ícone que rola dentro da máscara
 *                                ("icon" e "project" usam valores próprios)
 *   [data-underline]             sublinhado: retrai e redesenha (--line)
 *   [data-line-draw]             sublinhado que se desenha e recolhe (--draw)
 *   [data-arrow]                 seta ↗ que sai e entra de novo
 *   [data-shift]                 deslocamento horizontal curto
 *   data-spotlight               reflexo radial + zoom de [data-zoom]
 *   data-hover-track             pode subir por baixo do mouse parado (palco
 *                                dos projetos): conferido a cada quadro
 *   data-react="chave"           elementos fora dele com data-react-to="chave"
 *                                também reagem ([data-line-fill], [data-glow-react])
 *
 * Cada animação de hover mexe só em camadas internas criadas para isso —
 * nunca nos elementos que o scroll, o parallax ou as entradas animam.
 * Só roda com mouse (hover: hover, pointer: fine) e sem movimento reduzido;
 * ao ser desfeito, tudo volta ao estado do CSS.
 */

const { ease } = M;
type QuickTo = ReturnType<typeof gsap.quickTo>;

export function createHoverEngine() {
  const pointer = { x: 0, y: 0 };
  let active: HTMLElement | null = null;

  // Propriedades que o motor animou em cada elemento, para desfazer no fim.
  const owned = new Map<HTMLElement, Set<string>>();
  const own = (el: HTMLElement, ...props: string[]) => {
    let set = owned.get(el);
    if (!set) owned.set(el, (set = new Set()));
    props.forEach((p) => set.add(p));
  };

  // ---------- Magnetismo ----------

  type Magnet = { target: HTMLElement; max: number; x: QuickTo; y: QuickTo };
  const magnets = new WeakMap<HTMLElement, Magnet>();

  const magnetFor = (root: HTMLElement) => {
    let magnet = magnets.get(root);
    if (!magnet) {
      const target = root.querySelector<HTMLElement>("[data-magnetic-inner]") ?? root;
      const opts = { duration: M.magnetic.duration, ease };
      magnet = {
        target,
        max: root.dataset.magnetic === "social" ? M.magnetic.socialMax : M.magnetic.linkMax,
        x: gsap.quickTo(target, "x", opts),
        y: gsap.quickTo(target, "y", opts),
      };
      magnets.set(root, magnet);
      own(target, "x", "y");
    }
    return magnet;
  };

  const magnetMove = (root: HTMLElement) => {
    const magnet = magnetFor(root);
    const box = root.getBoundingClientRect();
    // Se o próprio elemento se move, desconta o deslocamento atual.
    const offX = magnet.target === root ? Number(gsap.getProperty(root, "x")) : 0;
    const offY = magnet.target === root ? Number(gsap.getProperty(root, "y")) : 0;
    const cx = box.left - offX + box.width / 2;
    const cy = box.top - offY + box.height / 2;
    const clamp = gsap.utils.clamp(-1, 1);
    magnet.x(clamp((pointer.x - cx) / (box.width / 2)) * magnet.max);
    magnet.y(clamp((pointer.y - cy) / (box.height / 2)) * magnet.max);
  };

  const magnetReset = (root: HTMLElement) => {
    const magnet = magnets.get(root);
    magnet?.x(0);
    magnet?.y(0);
  };

  // ---------- Preenchimento circular ----------

  /*
   * O disco ([data-fill]) cresce com scale a partir do ponto de entrada. A
   * pintura dentro dele ([data-fill-paint]) tem o tamanho do botão e escala
   * ao contrário, então o degradê fica sempre parado no botão (não "anda"
   * com o disco) e termina idêntico de qualquer lado que se entre.
   */
  const fillTo = (root: HTMLElement, to: 0 | 1) => {
    const disc = root.querySelector<HTMLElement>("[data-fill]");
    const paint = disc?.querySelector<HTMLElement>("[data-fill-paint]");
    const box = disc?.parentElement;
    if (!disc || !paint || !box) return;
    own(disc, "x", "y", "scale", "width", "height");
    own(paint, "x", "y", "scale", "width", "height", "transformOrigin");

    const scale = Number(gsap.getProperty(disc, "scale"));
    // Reposiciona no ponteiro só quando o disco está parado (vazio, ou cheio
    // ao sair); no meio de uma transição continua de onde está.
    if ((to === 1 && scale < 0.02) || (to === 0 && scale > 0.98)) {
      const rect = box.getBoundingClientRect();
      const px = pointer.x - rect.left;
      const py = pointer.y - rect.top;
      // Raio que cobre o botão a partir de qualquer ponto (com folga, para a
      // saída um pouco fora da borda).
      const r = Math.hypot(rect.width, rect.height) + 12;
      gsap.set(disc, { width: 2 * r, height: 2 * r, x: px - r, y: py - r });
      gsap.set(paint, {
        width: rect.width,
        height: rect.height,
        x: r - px,
        y: r - py,
        transformOrigin: `${px}px ${py}px`,
      });
    }
    gsap.to(disc, {
      scale: to,
      duration: to ? M.fill.duration : M.fill.leaveDuration,
      ease,
      overwrite: true,
      onUpdate: () => {
        const s = Number(gsap.getProperty(disc, "scale"));
        gsap.set(paint, { scale: 1 / Math.max(s, 0.01) });
      },
    });
  };

  // ---------- Rolagem de texto e ícones ----------

  const rollTo = (roll: HTMLElement, on: boolean) => {
    const units = roll.querySelectorAll<HTMLElement>("[data-roll-unit]");
    if (!units.length) return;
    units.forEach((unit) => own(unit, "yPercent"));
    const variant = roll.dataset.roll;
    const each =
      variant === "icon" ? M.social.iconDuration : variant === "project" ? P.duration : M.textRoll.duration;
    const [stagger, max] =
      variant === "project" ? [P.letterStagger, P.maxStagger] : [M.textRoll.stagger, M.textRoll.maxStagger];
    const amount = Math.min((units.length - 1) * stagger, max);
    // Em repouso aparece o texto original (com kerning); durante o hover,
    // a versão dividida em letras.
    if (on) roll.dataset.rolling = "";
    gsap.to(units, {
      yPercent: on ? -100 : 0,
      duration: each,
      ease: variant === "project" ? P.ease : ease,
      stagger: { amount },
      overwrite: true,
      onComplete: () => {
        if (!on && roll.closest("[data-hover]") !== active) delete roll.dataset.rolling;
      },
    });
  };

  // ---------- Sublinhado ----------

  const underlines = new WeakMap<HTMLElement, gsap.core.Timeline>();
  const redrawUnderline = (line: HTMLElement) => {
    // Uma passada por vez: termina antes de poder começar outra (sem saltos).
    if (underlines.get(line)?.isActive()) return;
    own(line, "--line", "--line-origin");
    const tl = gsap
      .timeline()
      .set(line, { "--line-origin": "right" })
      .fromTo(line, { "--line": 1 }, { "--line": 0, duration: M.underline.retract, ease: "power2.in" })
      .set(line, { "--line-origin": "left" })
      .to(line, { "--line": 1, duration: M.underline.draw, ease });
    underlines.set(line, tl);
  };

  // ---------- Sublinhado que se desenha (títulos dos projetos) ----------

  /*
   * Entra: cresce da esquerda (scaleX via --draw). Sai: se já estava inteiro,
   * recolhe para a direita; se ainda crescia, volta pelo mesmo lado — a origem
   * só muda com a linha parada, então nunca salta.
   */
  const drawLine = (line: HTMLElement, on: boolean) => {
    own(line, "--draw", "--draw-origin");
    const value = parseFloat(String(gsap.getProperty(line, "--draw"))) || 0;
    if (on && value < 0.01) gsap.set(line, { "--draw-origin": "left" });
    if (!on && value > 0.99) gsap.set(line, { "--draw-origin": "right" });
    gsap.fromTo(
      line,
      { "--draw": value },
      { "--draw": on ? 1 : 0, duration: P.underlineDuration, ease: P.ease, overwrite: true },
    );
  };

  // ---------- Seta ↗ ----------

  const arrowTo = (arrow: HTMLElement, on: boolean) => {
    const a = arrow.querySelector<HTMLElement>("[data-arrow-a]");
    const b = arrow.querySelector<HTMLElement>("[data-arrow-b]");
    if (!a || !b) return;
    own(a, "x", "y", "opacity");
    own(b, "x", "y", "opacity");
    const project = arrow.dataset.arrow === "project";
    const d = project ? P.arrowDistance : M.arrow.offset;
    const delay = project ? P.arrowDelay : M.arrow.delay;
    const motion = {
      duration: project ? P.arrowDuration : M.arrow.duration,
      ease,
      overwrite: true as const,
    };
    if (on) {
      // A cópia parte de baixo/esquerda se ainda não estiver a caminho.
      if (Number(gsap.getProperty(b, "opacity")) < 0.01) gsap.set(b, { x: -d, y: d });
      gsap.to(a, { x: d, y: -d, opacity: 0, delay, ...motion });
      gsap.to(b, { x: 0, y: 0, opacity: 1, delay, ...motion });
    } else {
      gsap.to(a, { x: 0, y: 0, opacity: 1, ...motion });
      gsap.to(b, { x: -d, y: d, opacity: 0, ...motion });
    }
  };

  // ---------- Reações fora do elemento (Contato) ----------

  const reactTo = (el: HTMLElement, on: boolean) => {
    if (el.hasAttribute("data-line-fill")) {
      own(el, "scaleX");
      gsap.to(el, {
        scaleX: on ? 1 : 0,
        duration: M.contactLine.fillDuration,
        ease,
        overwrite: true,
      });
    }
    if (el.hasAttribute("data-glow-react")) {
      // Só intensidade e escala da camada externa: as timelines dos loops
      // (respiração, anéis, pêssego) continuam no mesmo ritmo.
      const { scale, boost, ringColor, duration } = M.contactGlow;
      own(el, "scale", "--glow-boost", "--ring-color");
      gsap.to(el, {
        scale: on ? scale : 1,
        "--glow-boost": on ? boost : 0,
        "--ring-color": on ? ringColor : SUNSET.rose,
        duration,
        ease: "sine.inOut",
        overwrite: true,
      });
    }
  };

  // ---------- Spotlight + zoom dos projetos ----------

  type Spot = { glow: HTMLElement; zoom: HTMLElement | null; x: QuickTo; y: QuickTo };
  const spots = new WeakMap<HTMLElement, Spot>();
  let tracked: HTMLElement | null = null;

  // Elementos do palco dos projetos podem subir por baixo do mouse parado
  // (scroll e scrub): enquanto um deles está em hover, confere a cada quadro
  // se o ponteiro ainda está em cima (senão encerra o hover) e leva o reflexo
  // junto. Só roda durante esse hover.
  const trackTick = () => {
    if (!tracked) return;
    const rect = tracked.getBoundingClientRect();
    const x = pointer.x - rect.left;
    const y = pointer.y - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      leave(tracked);
      return;
    }
    const spot = spots.get(tracked);
    spot?.x(x);
    spot?.y(y);
  };

  const track = (root: HTMLElement, on: boolean) => {
    if (on) {
      tracked = root;
      gsap.ticker.add(trackTick);
    } else if (tracked === root) {
      gsap.ticker.remove(trackTick);
      tracked = null;
    }
  };

  const spotlightTo = (root: HTMLElement, on: boolean) => {
    let spot = spots.get(root);
    if (!spot) {
      const glow = root.querySelector<HTMLElement>("[data-spotlight-glow]");
      if (!glow) return;
      const opts = { duration: M.project.spotlightFollow, ease };
      spot = {
        glow,
        zoom: root.querySelector<HTMLElement>("[data-zoom]"),
        x: gsap.quickTo(glow, "x", opts),
        y: gsap.quickTo(glow, "y", opts),
      };
      spots.set(root, spot);
      own(glow, "x", "y", "opacity");
      if (spot.zoom) own(spot.zoom, "scale");
    }
    const motion = { duration: M.project.duration, ease, overwrite: "auto" as const };
    if (on && Number(gsap.getProperty(spot.glow, "opacity")) < 0.01) {
      const rect = root.getBoundingClientRect();
      spot.x(pointer.x - rect.left, pointer.x - rect.left);
      spot.y(pointer.y - rect.top, pointer.y - rect.top);
    }
    gsap.to(spot.glow, { opacity: on ? M.project.spotlightOpacity : 0, ...motion });
    if (spot.zoom) gsap.to(spot.zoom, { scale: on ? M.project.zoom : 1, ...motion });
  };

  // ---------- Entrar / sair ----------

  const parts = (root: HTMLElement, selector: string) => {
    const found = Array.from(root.querySelectorAll<HTMLElement>(selector));
    return root.matches(selector) ? [root, ...found] : found;
  };

  const run = (root: HTMLElement, on: boolean) => {
    if (root.dataset.magnetic && !on) magnetReset(root);
    fillTo(root, on ? 1 : 0);
    parts(root, "[data-roll]").forEach((roll) => rollTo(roll, on));
    if (on) parts(root, "[data-underline]").forEach(redrawUnderline);
    parts(root, "[data-line-draw]").forEach((line) => drawLine(line, on));
    parts(root, "[data-arrow]").forEach((arrow) => arrowTo(arrow, on));
    parts(root, "[data-shift]").forEach((el) => {
      own(el, "x");
      gsap.to(el, {
        x: on ? M.contactLine.shift : 0,
        duration: M.contactLine.duration,
        ease,
        overwrite: "auto",
      });
    });
    const key = root.dataset.react;
    if (key) {
      document
        .querySelectorAll<HTMLElement>(`[data-react-to="${key}"]`)
        .forEach((el) => reactTo(el, on));
    }
    if (root.hasAttribute("data-spotlight")) spotlightTo(root, on);
    if (root.hasAttribute("data-spotlight") || root.hasAttribute("data-hover-track")) track(root, on);
  };

  const enter = (root: HTMLElement) => {
    active = root;
    run(root, true);
  };

  function leave(root: HTMLElement) {
    if (active === root) active = null;
    run(root, false);
  }

  // ---------- Listeners (únicos, no documento) ----------

  const isMouse = (e: PointerEvent) => e.pointerType === "mouse";

  const onMove = (e: PointerEvent) => {
    if (!isMouse(e)) return;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    if (active?.dataset.magnetic) magnetMove(active);
  };

  const onOver = (e: PointerEvent) => {
    if (!isMouse(e)) return;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    const root = (e.target as Element).closest<HTMLElement>("[data-hover]");
    if (root && root !== active) {
      if (active) leave(active);
      enter(root);
    }
  };

  const onOut = (e: PointerEvent) => {
    if (!isMouse(e)) return;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    // Saiu do elemento (ou da janela: relatedTarget nulo).
    const to = e.relatedTarget as Node | null;
    if (active && !(to && active.contains(to))) leave(active);
  };

  // Aba escondida ou janela sem foco: encerra o hover.
  const onAway = () => {
    if (document.visibilityState === "visible" && document.hasFocus()) return;
    if (active) leave(active);
  };

  const passive = { passive: true };
  document.addEventListener("pointermove", onMove, passive);
  document.addEventListener("pointerover", onOver, passive);
  document.addEventListener("pointerout", onOut, passive);
  document.addEventListener("visibilitychange", onAway);
  window.addEventListener("blur", onAway);

  return {
    destroy() {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      document.removeEventListener("visibilitychange", onAway);
      window.removeEventListener("blur", onAway);
      gsap.ticker.remove(trackTick);
      // Tudo de volta ao estado do CSS.
      owned.forEach((props, el) => {
        const list = Array.from(props);
        gsap.killTweensOf(el, list.join(","));
        const vars = list.filter((p) => p.startsWith("--"));
        vars.forEach((v) => el.style.removeProperty(v));
        const rest = list.filter((p) => !p.startsWith("--"));
        const transform = ["x", "y", "scale", "scaleX", "yPercent"];
        const clear = new Set(rest.map((p) => (transform.includes(p) ? "transform" : p)));
        if (clear.size) gsap.set(el, { clearProps: Array.from(clear).join(",") });
      });
      document.querySelectorAll<HTMLElement>("[data-rolling]").forEach((el) => {
        delete el.dataset.rolling;
      });
      owned.clear();
      active = null;
    },
  };
}

/**
 * Clique em [data-press] (botões, CTAs): 1 → 0,97 → 1 em [data-press-target]
 * (ou no próprio). Vale também para toque; não roda com movimento reduzido.
 */
export function createPressFeedback() {
  const touched = new Set<HTMLElement>();
  const onDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    const el = (e.target as Element).closest<HTMLElement>("[data-press]");
    if (!el) return;
    const target = el.querySelector<HTMLElement>("[data-press-target]") ?? el;
    touched.add(target);
    gsap
      .timeline()
      .to(target, { scale: M.press.scale, duration: M.press.down, ease: "power2.out", overwrite: "auto" })
      .to(target, { scale: 1, duration: M.press.up, ease });
  };
  document.addEventListener("pointerdown", onDown, { passive: true });
  return () => {
    document.removeEventListener("pointerdown", onDown);
    touched.forEach((el) => {
      gsap.killTweensOf(el, "scale");
      gsap.set(el, { clearProps: "scale" });
    });
  };
}
