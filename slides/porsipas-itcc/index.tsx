import {
  type DesignSystem,
  type Page,
  type SlideMeta,
  type SlideTransition,
  Step,
  Steps,
  useIsActivePage,
  useSlidePageNumber,
} from '@open-slide/core';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

import dashboardSppg from './assets/dashboard-sppg-beranda.png';
import shotAdmin from './assets/shot-admin.png';
import shotFeedback from './assets/shot-feedback.png';
import shotHome from './assets/shot-home.jpg';
import shotKiosk from './assets/shot-kiosk.png';
import shotKoordinator from './assets/shot-koordinator.png';
import shotLogin from './assets/shot-login.jpg';
import shotPenyalur from './assets/shot-penyalur.png';

/* ══════════════════════════════════════════════════════════
   PorsiPas - Sistem Umpan Balik Program Makan Bergizi Gratis
   Lomba UX Design ITCC 2026 · Subtema Smart Public Service
   ERRIC · Politeknik Elektronika Negeri Surabaya

   Port of the bolt-slides deck to open-slide: 16 pages on a
   fixed 1920×1080 canvas. All px values are the 1920×1080
   readings of the original clamp() fluid tokens.
   ══════════════════════════════════════════════════════════ */

/* ── Design system (tweakable from the Design panel) ─────── */
/* Deck identity: editorial cream/navy with a deep-orange accent,
   deliberately distinct from the pastel product UI in DESIGN.md,
   so the deck reads as a presentation, not a product screen.
   Dials: ENERGY 2 / RHYTHM 3 / MOTION 1: varied composition,
   a single gradient reserved for the cover wordmark, motion only
   where it guides attention (CountUp, 260 ms page rise). */
export const design: DesignSystem = {
  palette: { bg: '#fbf8f4', text: '#1e2f40', accent: '#a9501b' },
  fonts: {
    display:
      '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
    body: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
  },
  typeScale: { hero: 116, body: 25 },
  radius: 24,
};

/* Webfont - injected once at module top level, keyed to this
   slide id (the home page mounts every slide at once). */
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';
const FONT_LINK_ID = 'osd-webfont-porsipas-itcc';
if (typeof document !== 'undefined') {
  let link = document.getElementById(FONT_LINK_ID) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.id = FONT_LINK_ID;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  if (link.href !== FONT_HREF) link.href = FONT_HREF;
}

/* ── Palette & Bento design tokens ───────────────────────── */
/* The deck's single gradient moment: the cover wordmark.
   Stops verified >= 3:1 on the cream canvas for large text. */
const ACCENT_GRAD =
  'linear-gradient(115deg, #cc6b28 0%, #b4591b 52%, #8f3f0c 100%)';
const ink = {
  fg: '#1e2f40',
  muted: '#4a5b6c',
  faint: '#5b6774',
  hair: 'rgba(30, 47, 64, 0.14)',
  hair2: 'rgba(30, 47, 64, 0.08)',
  surface: 'rgba(30, 47, 64, 0.035)',
  surface2: 'rgba(30, 47, 64, 0.06)',
};
const bento = {
  bg: '#f2eee7',
  bgAccent: '#1e2f40',
  border: '#e4dcd0',
  borderAccent: 'rgba(255, 255, 255, 0.12)',
  badgeBg: '#eae2d5',
  badgeBorder: '#d8cfc2',
  radius: 24,
  radiusSm: 16,
};
const FONT_MONO = '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace';
const SHADOW = '0 32px 64px -32px rgba(30, 47, 64, 0.25)';
const EASE_IN = 'cubic-bezier(0.4, 0, 1, 1)';
const EASE_OUT = 'cubic-bezier(0, 0, 0.2, 1)';

/* One motion DNA for the whole deck (RISE, 260 ms). */
export const transition: SlideTransition = {
  duration: 260,
  exit: { duration: 260, easing: EASE_IN, keyframes: [{ opacity: 1 }, { opacity: 1 }] },
  enter: {
    duration: 260,
    easing: EASE_OUT,
    keyframes: [
      { opacity: 0, transform: 'translateY(6px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
  },
};

/* ── Shared atoms ────────────────────────────────────────── */

/* Full-canvas page root */
const fill: CSSProperties = {
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  background: 'var(--osd-bg)',
  color: 'var(--osd-text)',
  fontFamily: 'var(--osd-font-body)',
  boxShadow: 'inset 0 0 220px 50px rgba(30, 47, 64, 0.06)',
  WebkitFontSmoothing: 'antialiased',
};

const Atmos = () => (
  <div
    aria-hidden
    style={{
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none',
      background:
        'radial-gradient(44% 50% at 24% 16%, rgba(169, 80, 27, 0.09), transparent 60%), radial-gradient(50% 56% at 82% 88%, rgba(30, 47, 64, 0.06), transparent 62%)',
    }}
  />
);

/* Content sits above atmosphere. */
const content: CSSProperties = {
  position: 'relative',
  zIndex: 1,
  width: '100%',
  maxWidth: 1440,
  margin: '0 auto',
  height: '100%',
};

/* Accent word inside headlines: solid deep-orange, contrast-safe
   on every surface it sits on. The gradient is reserved for the
   cover wordmark (WordAcc below). */
const Acc = ({ children }: { children: ReactNode }) => (
  <span style={{ color: 'var(--osd-accent)' }}>{children}</span>
);

/* Wordmark gradient: the one gradient moment in the deck. */
const WordAcc = ({ children }: { children: ReactNode }) => (
  <span
    style={{
      background: ACCENT_GRAD,
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
    }}
  >
    {children}
  </span>
);

/* Bento Card: rounded 24px container with light background and crisp border */
const Mat = ({
  variant = 'default',
  style,
  children,
}: {
  variant?: 'default' | 'accent' | 'ghost';
  style?: CSSProperties;
  children: ReactNode;
}) => {
  const isAccent = variant === 'accent';
  const isGhost = variant === 'ghost';
  return (
    <div
      style={{
        position: 'relative',
        borderRadius: bento.radius,
        background: isAccent ? bento.bgAccent : isGhost ? 'transparent' : bento.bg,
        border: `1px solid ${isAccent ? bento.borderAccent : bento.border}`,
        color: isAccent ? '#fbf8f4' : 'inherit',
        boxShadow: isGhost ? 'none' : '0 12px 32px -16px rgba(30, 47, 64, 0.06)',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* Small accent index bar. */
const Tick = () => (
  <span
    style={{
      display: 'block',
      width: 22,
      height: 3,
      borderRadius: 2,
      background: 'var(--osd-accent)',
      flexShrink: 0,
    }}
  />
);

/* Pill badge (Unity deck style) */
const Chip = ({ children, accent }: { children: ReactNode; accent?: boolean }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 14px',
      borderRadius: 999,
      fontFamily: FONT_MONO,
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: accent ? 'var(--osd-accent)' : ink.fg,
      background: accent ? 'rgba(169, 80, 27, 0.12)' : bento.badgeBg,
      border: `1px solid ${accent ? 'rgba(169, 80, 27, 0.28)' : bento.badgeBorder}`,
    }}
  >
    {children}
  </span>
);

/* Type atoms at the 1920px reading of the fluid scale. */
const kicker: CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: ink.faint,
};
const headline: CSSProperties = {
  fontFamily: 'var(--osd-font-display)',
  fontWeight: 800,
  letterSpacing: '-0.035em',
  lineHeight: 1.05,
  fontSize: 60,
  color: 'var(--osd-text)',
};
const lead: CSSProperties = {
  fontSize: 26,
  color: ink.muted,
  lineHeight: 1.5,
};
const foot: CSSProperties = {
  fontSize: 16,
  color: ink.faint,
};

/* Page-number footer, read from the framework (never hardcoded). */
const Footer = () => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={{
        position: 'absolute',
        left: 115,
        right: 115,
        bottom: 56,
        zIndex: 2,
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: FONT_MONO,
        fontSize: 16,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: ink.faint,
        pointerEvents: 'none',
      }}
    >
      <span>PorsiPas · ITCC 2026</span>
      <span>
        {String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>
    </div>
  );
};

/* Number that animates 0 → to while this page is the active one;
   renders the final value in thumbnails, grid, and PDF export. */
function CountUp({
  to,
  prefix = '',
  suffix = '',
  duration = 1500,
  decimals = 0,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimals?: number;
}) {
  const active = useIsActivePage();
  const [val, setVal] = useState(to);

  useEffect(() => {
    if (!active) {
      setVal(to);
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVal(to);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    setVal(0);
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      setVal(to * (1 - Math.pow(1 - p, 5)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, to, duration]);

  return (
    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
      {prefix +
        val.toLocaleString('id-ID', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }) +
        suffix}
    </span>
  );
}

/* Framed prototype screenshot. */
function Shot({
  src,
  alt,
  caption,
  ratio = '16 / 9',
}: {
  src: string;
  alt: string;
  caption?: string;
  ratio?: string;
}) {
  return (
    <figure style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
      <img
        src={src}
        alt={alt}
        style={{
          display: 'block',
          width: '100%',
          aspectRatio: ratio,
          objectFit: 'cover',
          objectPosition: 'center top',
          borderRadius: 'var(--osd-radius)',
          border: `1px solid ${ink.hair}`,
          background: ink.surface2,
          boxShadow: SHADOW,
        }}
      />
      {caption && (
        <figcaption style={{ ...foot, fontSize: 13, textAlign: 'center' }}>{caption}</figcaption>
      )}
    </figure>
  );
}

/* Browser chrome for a screenshot. */
const BarArrow = ({ back }: { back?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    width={15}
    height={15}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {back ? <path d="M15 6l-6 6 6 6" /> : <path d="M9 6l6 6-6 6" />}
  </svg>
);
const Lock = () => (
  <svg
    viewBox="0 0 24 24"
    width={11}
    height={11}
    fill="none"
    stroke="currentColor"
    strokeWidth={2.4}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ color: 'var(--osd-accent)', flexShrink: 0 }}
  >
    <rect x="5" y="11" width="14" height="9" rx="2.2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

function BrowserFrame({ url, children, maxWidth = 1380 }: { url: string; children: ReactNode; maxWidth?: number | string }) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth,
        borderRadius: bento.radius,
        overflow: 'hidden',
        border: `1px solid ${bento.border}`,
        boxShadow: `${SHADOW}, inset 0 1px 0 rgba(30, 47, 64, 0.06)`,
        background: bento.bg,
      }}
    >
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 18px',
          background: 'rgba(30, 47, 64, 0.04)',
          borderBottom: `1px solid ${bento.border}`,
        }}
      >
        <span style={{ display: 'flex', gap: 7 }}>
          <i style={{ width: 11, height: 11, borderRadius: '50%', background: '#d8cfc2' }} />
          <i style={{ width: 11, height: 11, borderRadius: '50%', background: '#d8cfc2' }} />
          <i style={{ width: 11, height: 11, borderRadius: '50%', background: '#d8cfc2' }} />
        </span>
        <span style={{ display: 'flex', gap: 4, color: ink.faint, opacity: 0.7 }}>
          <BarArrow back />
          <BarArrow />
        </span>
        <span
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            fontFamily: FONT_MONO,
            fontSize: 12.5,
            color: ink.muted,
            background: '#fbf8f4',
            border: `1px solid ${bento.border}`,
            borderRadius: 999,
            padding: '5px 14px',
          }}
        >
          <Lock />
          {url}
        </span>
        <span style={{ width: 52, flexShrink: 0 }} aria-hidden />
      </div>
      <div style={{ background: '#ffffff' }}>{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Pages
   ══════════════════════════════════════════════════════════ */

/* 1 - Cover: Clean editorial typography with floating badge and team card */
const CoverPage: Page = () => (
  <div style={{ ...fill, padding: '80px 115px' }}>
    <Atmos />
    <div
      style={{
        ...content,
        height: '100%',
        display: 'grid',
        gridTemplateColumns: '1.2fr 0.8fr',
        gap: 48,
        alignItems: 'center',
      }}
    >
      {/* Left: Free editorial typography (NO card wrapper) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Chip accent>ITCC 2026</Chip>
          <Chip>Lomba UX Design</Chip>
          <span style={{ fontSize: 16, color: ink.faint, fontFamily: FONT_MONO }}>· Subtema Smart Public Service</span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--osd-font-display)',
            fontWeight: 800,
            letterSpacing: '-0.045em',
            lineHeight: 0.95,
            fontSize: 124,
            margin: 0,
            color: ink.fg,
          }}
        >
          Porsi<WordAcc>Pas</WordAcc>
        </h1>

        <p
          style={{
            fontSize: 28,
            color: ink.muted,
            lineHeight: 1.45,
            maxWidth: '32ch',
            margin: 0,
          }}
        >
          Sistem umpan balik Program Makan Bergizi Gratis: anonim, tuntas 5–10 detik, dan langsung jadi dasar keputusan menu di SPPG.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
          <Tick />
          <span style={{ fontSize: 18, color: ink.muted, fontWeight: 500 }}>
            Inovasi Umpan Balik Tertutup Multi-Role
          </span>
        </div>
      </div>

      {/* Right: Asymmetric bento stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Mat
          variant="accent"
          style={{
            padding: '36px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 20,
          }}
        >
          <div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 15, letterSpacing: '0.12em', color: '#e2913f', textTransform: 'uppercase', marginBottom: 10 }}>
              Fokus Kompetisi
            </div>
            <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.3, margin: 0, color: '#fbf8f4' }}>
              Smart Public Service &amp; Smart Waste &amp; Resource Optimization
            </h2>
          </div>
          <div style={{ fontSize: 16, color: '#aab6c2', borderTop: '1px solid rgba(255,255,255,0.14)', paddingTop: 14 }}>
            Politeknik Elektronika Negeri Surabaya · 2026
          </div>
        </Mat>

        <Mat
          style={{
            padding: '30px 36px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 15, color: ink.faint, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Tim ERRIC
            </span>
            <Chip accent>3 Pengembang</Chip>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 17, fontWeight: 600, color: ink.fg, background: '#fbf8f4', border: `1px solid ${bento.border}`, padding: '6px 14px', borderRadius: 999 }}>
              Chery Ardin Dimalta
            </span>
            <span style={{ fontSize: 17, fontWeight: 600, color: ink.fg, background: '#fbf8f4', border: `1px solid ${bento.border}`, padding: '6px 14px', borderRadius: 999 }}>
              Muhammad Rizieq Anwar
            </span>
            <span style={{ fontSize: 17, fontWeight: 600, color: ink.fg, background: '#fbf8f4', border: `1px solid ${bento.border}`, padding: '6px 14px', borderRadius: 999 }}>
              Reyvan Andycka Farrel Alinskie
            </span>
          </div>
        </Mat>
      </div>
    </div>
  </div>
);

/* 2 - BigNumber: Free headline + isolated stat bento pair */
const BigNumberPage: Page = () => (
  <div style={{ ...fill, padding: '72px 115px 96px' }}>
    <Atmos />
    <div style={{ ...content, display: 'flex', flexDirection: 'column', gap: 36 }}>
      {/* Top: Free typography banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ ...kicker, marginBottom: 10 }}>Urgensi Nasional</div>
          <h2 style={{ ...headline, fontSize: 58, margin: 0, maxWidth: '24ch' }}>
            Food Loss &amp; Waste di Indonesia.
          </h2>
        </div>
        <Chip accent>Sumber: Bappenas, 2021</Chip>
      </div>

      {/* Middle: Bento highlights matching reference */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.95fr', gap: 28, alignItems: 'stretch' }}>
        {/* Giant Stat Tile */}
        <Mat style={{ padding: '38px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, color: 'var(--osd-accent)', letterSpacing: '0.08em' }}>
              AKUMULASI TAHUNAN
            </span>
            <Chip>Bappenas RI</Chip>
          </div>

          <div>
            <div
              style={{
                fontFamily: 'var(--osd-font-display)',
                fontWeight: 800,
                letterSpacing: '-0.05em',
                lineHeight: 0.9,
                fontSize: 150,
                color: 'var(--osd-accent)',
              }}
            >
              <CountUp to={48} prefix="23–" />
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: ink.fg, marginTop: 12 }}>
              Juta ton pangan terbuang / tahun
            </div>
          </div>

          <div style={{ fontSize: 18, color: ink.muted, borderTop: `1px solid ${bento.border}`, paddingTop: 16 }}>
            Setara kerugian ekonomi Rp213–551 triliun setiap tahunnya (4–5% PDB nasional).
          </div>
        </Mat>

        {/* Right Stack: 2 Clean bento cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Mat style={{ flex: 1, padding: '28px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: ink.faint }}>01 · TAHAP KONSUMSI</span>
              <Chip accent>Paling Kritis</Chip>
            </div>
            <div style={{ fontSize: 34, fontWeight: 800, color: ink.fg, letterSpacing: '-0.02em' }}>
              5–19 Juta Ton
            </div>
            <p style={{ fontSize: 17, color: ink.muted, lineHeight: 1.45, margin: 0 }}>
              Porsi sampah makanan terbesar timbul langsung pada tahap konsumen akhir, termasuk sisa makanan di sekolah.
            </p>
          </Mat>

          <Mat style={{ flex: 1, padding: '28px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: ink.faint }}>02 · BEBAN INDIVIDUAL</span>
              <Chip>Per Kapita</Chip>
            </div>
            <div style={{ fontSize: 34, fontWeight: 800, color: ink.fg, letterSpacing: '-0.02em' }}>
              115–184 kg / th
            </div>
            <p style={{ fontSize: 17, color: ink.muted, lineHeight: 1.45, margin: 0 }}>
              Rata-rata setiap individu di Indonesia membuang lebih dari 100 kg pangan per tahun tanpa disadari.
            </p>
          </Mat>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

/* 3 - Latar Belakang: Big open narrative + 3 horizontal bento pillars at bottom */
const BackgroundPage: Page = () => (
  <div style={{ ...fill, padding: '72px 115px 96px' }}>
    <Atmos />
    <div style={{ ...content, display: 'flex', flexDirection: 'column', gap: 40 }}>
      {/* Top: Free open editorial typography */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 40, alignItems: 'flex-start' }}>
        <div>
          <div style={{ ...kicker, marginBottom: 10 }}>Latar Belakang Masalah</div>
          <h2 style={{ ...headline, fontSize: 56, margin: 0 }}>
            Sisa di kelas berarti <Acc>anggaran terbuang.</Acc>
          </h2>
        </div>
        <p style={{ fontSize: 22, color: ink.muted, lineHeight: 1.55, margin: 0, paddingTop: 32 }}>
          Program MBG adalah intervensi gizi terbesar di Indonesia yang sepenuhnya ditanggung anggaran negara. Makanan yang tersisa bukan sekadar piring penuh: itu bahan pangan dan dana rakyat yang lenyap tanpa evaluasi penyebab objektif.
        </p>
      </div>

      {/* Bottom: 3 Bento pill cards (like reference slide 2 & 3) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        <Mat style={{ padding: '30px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 16, fontWeight: 800, color: 'var(--osd-accent)' }}>01</span>
            <Chip>Kehadiran</Chip>
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: ink.fg }}>Porsi vs Kehadiran</h3>
          <p style={{ fontSize: 17, color: ink.muted, lineHeight: 1.45, margin: 0 }}>
            Jumlah porsi seringkali tidak disesuaikan dengan fluktuasi siswa yang hadir di sekolah hari itu.
          </p>
          <div style={{ borderTop: `1px solid ${bento.border}`, paddingTop: 10, fontSize: 14, color: ink.faint }}>
            Sumber: Triastuty, 2025
          </div>
        </Mat>

        <Mat style={{ padding: '30px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 16, fontWeight: 800, color: 'var(--osd-accent)' }}>02</span>
            <Chip>Logistik</Chip>
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: ink.fg }}>Distribusi &amp; Waktu</h3>
          <p style={{ fontSize: 17, color: ink.muted, lineHeight: 1.45, margin: 0 }}>
            Pengiriman terlambat dari dapur ke titik sekolah mengganggu jeda makan terjadwal para siswa.
          </p>
          <div style={{ borderTop: `1px solid ${bento.border}`, paddingTop: 10, fontSize: 14, color: ink.faint }}>
            Sumber: Bappenas, 2021
          </div>
        </Mat>

        <Mat style={{ padding: '30px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 16, fontWeight: 800, color: 'var(--osd-accent)' }}>03</span>
            <Chip accent>Tantangan Inti</Chip>
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: ink.fg }}>Evaluasi Manual</h3>
          <p style={{ fontSize: 17, color: ink.muted, lineHeight: 1.45, margin: 0 }}>
            SPPG belum memiliki saluran digital cepat &amp; terstruktur untuk mengukur daya terima menu harian.
          </p>
          <div style={{ borderTop: `1px solid ${bento.border}`, paddingTop: 10, fontSize: 14, color: ink.faint }}>
            Ketiadaan Data Umpan Balik
          </div>
        </Mat>
      </div>
    </div>
    <Footer />
  </div>
);

/* 4 - StatGrid: Big headline + 4 distinct stat cards */
const StatCard = ({
  value,
  label,
  caption,
  chip,
}: {
  value: ReactNode;
  label: string;
  caption: string;
  chip?: string;
}) => (
  <Mat
    style={{
      padding: '32px 24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: 24,
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Tick />
      {chip && <Chip accent>{chip}</Chip>}
    </div>
    <div>
      <div
        style={{
          fontFamily: 'var(--osd-font-display)',
          fontSize: 44,
          fontWeight: 800,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          fontFeatureSettings: "'tnum' 1",
          color: 'var(--osd-accent)',
          marginBottom: 6,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: ink.fg, lineHeight: 1.3 }}>{label}</div>
    </div>
    <div style={{ fontSize: 16, color: ink.muted, lineHeight: 1.4, borderTop: `1px solid ${bento.border}`, paddingTop: 12 }}>
      {caption}
    </div>
  </Mat>
);

const StatsPage: Page = () => (
  <div style={{ ...fill, padding: '72px 115px 96px' }}>
    <Atmos />
    <div style={{ ...content, display: 'flex', flexDirection: 'column', gap: 64 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ ...kicker, marginBottom: 10 }}>Konteks Skala</div>
          <h2 style={{ ...headline, fontSize: 64, margin: 0, maxWidth: '24ch' }}>
            Empat angka yang menaruh masalah ini di depan mata.
          </h2>
        </div>
        <Chip accent>Data Nasional 2026</Chip>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr 1fr 1fr', gap: 32 }}>
        <StatCard
          value={<CountUp to={49.05} decimals={2} />}
          chip="Juta Jiwa"
          label="Penerima manfaat MBG"
          caption="Dari target 82,9 juta jiwa pada 2026 · BGN, 2026"
        />
        <StatCard
          value={<CountUp to={213} suffix="–551 T" />}
          chip="Rupiah"
          label="Kerugian ekonomi tahunan"
          caption="Setara 4–5% PDB nasional akibat makanan terbuang · Bappenas"
        />
        <StatCard
          value="7,29%"
          chip="Emisi GRK"
          label="Porsi emisi nasional"
          caption="1.702,9 Mt CO₂-eq berasal dari food loss &amp; waste · Bappenas"
        />
        <StatCard
          value={<CountUp to={42} suffix="%" />}
          chip="Tingkat Sisa"
          label="Siswa habiskan makanan"
          caption="Data sisa kini indikator utama evaluasi menu · BGN Jateng"
        />
      </div>
    </div>
    <Footer />
  </div>
);

/* 5 - Pain points: Open headline + 4 compact horizontal bento cards */
const BentoTile = ({
  num,
  title,
  body,
}: {
  num: string;
  title: string;
  body: string;
}) => (
  <Mat
    style={{
      padding: '28px 30px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: 14,
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontFamily: FONT_MONO, fontSize: 16, fontWeight: 800, color: 'var(--osd-accent)' }}>
        {num}
      </span>
      <Chip>Temuan Kualitatif</Chip>
    </div>
    <div>
      <h3 style={{ fontSize: 23, fontWeight: 700, letterSpacing: '-0.02em', color: ink.fg, margin: '0 0 8px' }}>
        {title}
      </h3>
      <p style={{ fontSize: 17, color: ink.muted, lineHeight: 1.45, margin: 0 }}>
        {body}
      </p>
    </div>
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <Tick />
      <span style={{ fontSize: 12, color: ink.faint, fontFamily: FONT_MONO, textTransform: 'uppercase' }}>
        Masalah Validasi
      </span>
    </div>
  </Mat>
);

const PainPointsPage: Page = () => (
  <div style={{ ...fill, padding: '72px 115px 96px' }}>
    <Atmos />
    <div style={{ ...content, display: 'flex', flexDirection: 'column', gap: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ ...kicker, marginBottom: 10 }}>Empathize · Wawancara SPPG &amp; Ahli Gizi</div>
          <h2 style={{ ...headline, fontSize: 54, margin: 0, maxWidth: '25ch' }}>
            Empat keluhan yang berujung pada “tidak tahu”.
          </h2>
        </div>
        <Chip accent>Fase 01: Empathize</Chip>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <BentoTile
          num="01"
          title="Penyebab sisa tidak diketahui"
          body="Sulit mengetahui mengapa makanan tidak dihabiskan siswa: apakah karena rasa, tekstur, atau porsi yang terlalu banyak?"
        />
        <BentoTile
          num="02"
          title="Data belum terstruktur"
          body="Belum ada pemisahan analitik antara menu yang disukai siswa dan menu yang paling banyak tersisa di piring."
        />
        <BentoTile
          num="03"
          title="Evaluasi masih manual"
          body="Formulir kertas, kolom saran, dan komentar media sosial memakan waktu berhari-hari untuk direkap dan dianalisis."
        />
        <BentoTile
          num="04"
          title="Ganti menu tanpa alasan"
          body="Keputusan mengganti menu hanya didasarkan pada perkiraan kasat mata banyaknya sisa makanan, bukan faktor objektif."
        />
      </div>
    </div>
    <Footer />
  </div>
);

/* 6 - Define: Open headline + 3 structured cards (like reference slide 3) */
const DefineRow = ({ n, t, d }: { n: string; t: string; d: string }) => (
  <Step>
    <Mat
      style={{
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        width: '100%',
      }}
    >
      <span
        style={{
          fontFamily: FONT_MONO,
          fontSize: 24,
          fontWeight: 800,
          color: 'var(--osd-accent)',
          background: 'rgba(169, 80, 27, 0.1)',
          padding: '10px 16px',
          borderRadius: bento.radiusSm,
          flexShrink: 0,
        }}
      >
        {n}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: ink.fg, marginBottom: 4 }}>
          {t}
        </div>
        <div style={{ fontSize: 17, color: ink.muted, lineHeight: 1.45 }}>
          {d}
        </div>
      </div>
    </Mat>
  </Step>
);

const DefinePage: Page = () => (
  <div style={{ ...fill, padding: '72px 115px 96px' }}>
    <Atmos />
    <div style={{ ...content, display: 'flex', flexDirection: 'column', gap: 36 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ ...kicker, marginBottom: 10 }}>Fase 02 · Define</div>
          <h2 style={{ ...headline, fontSize: 54, margin: 0, maxWidth: '24ch' }}>
            Tiga kendala utama yang harus diselesaikan.
          </h2>
        </div>
        <Chip accent>Rumusan Masalah</Chip>
      </div>

      <Steps>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
          <DefineRow
            n="01"
            t="Ketiadaan Data Penerimaan Menu Cepat &amp; Terstruktur"
            d="SPPG tidak memiliki akses langsung ke feedback riil harian dari siswa penerima manfaat di sekolah."
          />
          <DefineRow
            n="02"
            t="Komunikasi Evaluasi Manual Tanpa Rekap Otomatis"
            d="Umpan balik tersebar di chat personal dan catatan fisik, tanpa sistem rekap terpusat yang bisa langsung ditindaklanjuti."
          />
          <DefineRow
            n="03"
            t="Perubahan Menu Subjektif Tanpa Analisis Akar Masalah"
            d="Penggantian menu dilakukan secara reaktif tanpa mengetahui indikator spesifik: apakah rasa, porsi, atau kondisi makanan."
          />
        </div>
      </Steps>
    </div>
    <Footer />
  </div>
);

/* 7 - Section divider: Clean brutalist editorial, no card boundary */
const SectionPage: Page = () => (
  <div style={{ ...fill, padding: '80px 115px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Atmos />
    <div
      style={{
        ...content,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 0,
          fontFamily: 'var(--osd-font-display)',
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: '-0.06em',
          fontSize: 440,
          fontFeatureSettings: "'tnum' 1",
          color: 'transparent',
          WebkitTextStroke: '2px rgba(30, 47, 64, 0.06)',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        02
      </div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <Chip accent>Fase 03 · Solusi Desain</Chip>
        <h2
          style={{
            fontFamily: 'var(--osd-font-display)',
            fontSize: 116,
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            color: ink.fg,
            margin: '12px 0 16px',
          }}
        >
          Solusi: <Acc>PorsiPas</Acc>
        </h2>
        <p style={{ fontSize: 26, color: ink.muted, maxWidth: '38ch', lineHeight: 1.5, margin: 0 }}>
          Sistem Umpan Balik Tertutup dan Terintegrasi untuk Program Makan Bergizi Gratis.
        </p>
      </div>
    </div>
  </div>
);

/* 8 - Closed loop: Open headline + 4 focused role cards */
const LoopTile = ({
  n,
  role,
  title,
  desc,
}: {
  n: string;
  role: string;
  title: string;
  desc: string;
}) => (
  <Mat
    style={{
      padding: '28px 30px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: 14,
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontFamily: FONT_MONO, fontSize: 16, fontWeight: 800, color: 'var(--osd-accent)' }}>
        {n}
      </span>
      <Chip>{role}</Chip>
    </div>
    <div>
      <h3 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: ink.fg, margin: '0 0 8px' }}>
        {title}
      </h3>
      <p style={{ margin: 0, fontSize: 17, color: ink.muted, lineHeight: 1.45 }}>
        {desc}
      </p>
    </div>
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <Tick />
      <span style={{ fontSize: 12, color: ink.faint, fontFamily: FONT_MONO }}>ALUR TERPADU</span>
    </div>
  </Mat>
);

const LoopPage: Page = () => (
  <div style={{ ...fill, padding: '72px 115px 96px' }}>
    <Atmos />
    <div style={{ ...content, display: 'flex', flexDirection: 'column', gap: 36 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ ...kicker, marginBottom: 10 }}>Ideate · Pembagian Fungsi &amp; Alur</div>
          <h2 style={{ ...headline, fontSize: 52, margin: 0 }}>
            Empat sisi, satu lingkar umpan balik tertutup.
          </h2>
        </div>
        <Chip accent>Arsitektur Solusi</Chip>
      </div>

      <Steps>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
          <Step>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, width: '100%' }}>
              <LoopTile
                n="01"
                role="Siswa"
                title="Ulasan Anonim 5–10 Detik"
                desc="Masuk lewat Kode Akses tanpa registrasi akun. Menjawab 3 indikator: rasa, porsi, dan kondisi makanan dengan ikon interaktif."
              />
              <LoopTile
                n="02"
                role="Koordinator Titik"
                title="Kode Sesi &amp; Feedback Perwakilan"
                desc="Menyiapkan kode harian, mengaktifkan Mode Kiosk, dan memvalidasi laporan sensitif dari kelas."
              />
            </div>
          </Step>

          <Step>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, width: '100%' }}>
              <LoopTile
                n="03"
                role="Penyalur"
                title="Status Distribusi Real-time"
                desc="Memperbarui progres harian: diproses di dapur, dalam perjalanan, tiba di sekolah, hingga terverifikasi."
              />
              <LoopTile
                n="04"
                role="SPPG"
                title="Menu Acceptance Dashboard"
                desc="Analitik penerimaan menu, persentase sisa piring, keluhan dominan, dan rekomendasi AI Insight."
              />
            </div>
          </Step>

          <Step>
            <div style={{ background: '#fbf8f4', border: `1px solid ${bento.border}`, borderRadius: bento.radiusSm, padding: '14px 20px', textAlign: 'center' }}>
              <span style={{ fontSize: 17, fontWeight: 600, color: ink.fg }}>
                Lingkar Tertutup: Data penerimaan menu kembali menjadi dasar objektif bagi SPPG dalam menyusun menu dan alokasi bahan pangan berikutnya.
              </span>
            </div>
          </Step>
        </div>
      </Steps>
    </div>
    <Footer />
  </div>
);

/* 9 - Prototype siswa: Beranda Siswa */
const StudentHomePage: Page = () => (
  <div style={{ ...fill, padding: '48px 115px 72px' }}>
    <Atmos />
    <div style={{ ...content, width: '100%', maxWidth: 1520, margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ ...kicker, marginBottom: 6 }}>Prototype · Sisi Siswa</div>
          <h2 style={{ ...headline, fontSize: 40, margin: 0 }}>
            Beranda Siswa: Masuk dengan <Acc>Kode Sesi</Acc> Tanpa Akun.
          </h2>
        </div>
        <Chip accent>Anonim &amp; Inklusif</Chip>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BrowserFrame url="app.porsipas.id">
          <img
            src={shotHome}
            alt="Beranda Siswa PorsiPas"
            style={{ display: 'block', width: '100%', height: 'auto', maxHeight: 680, objectFit: 'cover' }}
          />
        </BrowserFrame>
      </div>
    </div>
    <Footer />
  </div>
);

/* 10 - Prototype siswa: Masuk Staf Multi-Role */
const StaffLoginPage: Page = () => (
  <div style={{ ...fill, padding: '48px 115px 72px' }}>
    <Atmos />
    <div style={{ ...content, width: '100%', maxWidth: 1520, margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ ...kicker, marginBottom: 6 }}>Prototype · Akses Pengelola</div>
          <h2 style={{ ...headline, fontSize: 40, margin: 0 }}>
            Masuk Staf: Verifikasi OTP &amp; <Acc>Pengalihan Peran Otomatis.</Acc>
          </h2>
        </div>
        <Chip accent>Multi-Role Access</Chip>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BrowserFrame url="app.porsipas.id/login">
          <img
            src={shotLogin}
            alt="Masuk Staf PorsiPas"
            style={{ display: 'block', width: '100%', height: 'auto', maxHeight: 680, objectFit: 'cover' }}
          />
        </BrowserFrame>
      </div>
    </div>
    <Footer />
  </div>
);

/* 11 - Prototype siswa: Micro-Feedback 5-10 Detik */
const FeedbackQuestionPage: Page = () => (
  <div style={{ ...fill, padding: '48px 115px 72px' }}>
    <Atmos />
    <div style={{ ...content, width: '100%', maxWidth: 1520, margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ ...kicker, marginBottom: 6 }}>Prototype · Micro-Feedback</div>
          <h2 style={{ ...headline, fontSize: 40, margin: 0 }}>
            Micro-Feedback Siswa: Selesai dalam <Acc>5–10 Detik</Acc> Berbasis Ikon.
          </h2>
        </div>
        <Chip accent>Desain Khusus Anak</Chip>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BrowserFrame url="app.porsipas.id/feedback">
          <img
            src={shotFeedback}
            alt="Micro-Feedback Siswa PorsiPas"
            style={{ display: 'block', width: '100%', height: 'auto', maxHeight: 680, objectFit: 'cover' }}
          />
        </BrowserFrame>
      </div>
    </div>
    <Footer />
  </div>
);

/* 12 - Prototype siswa: Mode Kiosk Tablet Kelas */
const KioskModePage: Page = () => (
  <div style={{ ...fill, padding: '48px 115px 72px' }}>
    <Atmos />
    <div style={{ ...content, width: '100%', maxWidth: 1520, margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ ...kicker, marginBottom: 6 }}>Prototype · Mode Kiosk</div>
          <h2 style={{ ...headline, fontSize: 40, margin: 0 }}>
            Mode Kiosk: Solusi <Acc>1 Tablet Bersama</Acc> untuk Satu Kelas.
          </h2>
        </div>
        <Chip accent>Inklusivitas SD</Chip>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BrowserFrame url="app.porsipas.id/kiosk">
          <img
            src={shotKiosk}
            alt="Mode Kiosk PorsiPas"
            style={{ display: 'block', width: '100%', height: 'auto', maxHeight: 680, objectFit: 'cover' }}
          />
        </BrowserFrame>
      </div>
    </div>
    <Footer />
  </div>
);

/* 13 - Dashboard SPPG */
const DashboardPage: Page = () => (
  <div style={{ ...fill, padding: '48px 115px 72px' }}>
    <Atmos />
    <div style={{ ...content, width: '100%', maxWidth: 1520, margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ ...kicker, marginBottom: 6 }}>Prototype · Dasbor Analitik SPPG</div>
          <h2 style={{ ...headline, fontSize: 40, margin: 0 }}>
            Dari ulasan siswa menjadi <Acc>keputusan menu berbasis data.</Acc>
          </h2>
        </div>
        <Chip accent>Menu Acceptance Dashboard</Chip>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BrowserFrame url="app.porsipas.id/sppg/dashboard">
          <img
            src={dashboardSppg}
            alt="Dashboard SPPG PorsiPas"
            style={{ display: 'block', width: '100%', height: 'auto', maxHeight: 680, objectFit: 'cover' }}
          />
        </BrowserFrame>
      </div>
    </div>
    <Footer />
  </div>
);

/* 14 - Tim: Koordinator Titik */
const KoordinatorPage: Page = () => (
  <div style={{ ...fill, padding: '48px 115px 72px' }}>
    <Atmos />
    <div style={{ ...content, width: '100%', maxWidth: 1520, margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ ...kicker, marginBottom: 6 }}>Prototype · Sisi Koordinator Titik</div>
          <h2 style={{ ...headline, fontSize: 40, margin: 0 }}>
            Koordinator Titik: Kelola <Acc>Kode Sesi</Acc> &amp; Feedback Perwakilan.
          </h2>
        </div>
        <Chip accent>Koordinator Titik</Chip>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BrowserFrame url="app.porsipas.id/koordinator">
          <img
            src={shotKoordinator}
            alt="Dashboard Koordinator Titik PorsiPas"
            style={{ display: 'block', width: '100%', height: 'auto', maxHeight: 680, objectFit: 'cover' }}
          />
        </BrowserFrame>
      </div>
    </div>
    <Footer />
  </div>
);

/* 15 - Tim: Penyalur */
const PenyalurPage: Page = () => (
  <div style={{ ...fill, padding: '48px 115px 72px' }}>
    <Atmos />
    <div style={{ ...content, width: '100%', maxWidth: 1520, margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ ...kicker, marginBottom: 6 }}>Prototype · Sisi Penyalur</div>
          <h2 style={{ ...headline, fontSize: 40, margin: 0 }}>
            Penyalur: Status Distribusi <Acc>Real-Time</Acc> Per Titik Sekolah.
          </h2>
        </div>
        <Chip accent>Penyalur MBG</Chip>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BrowserFrame url="app.porsipas.id/penyalur">
          <img
            src={shotPenyalur}
            alt="Dashboard Penyalur PorsiPas"
            style={{ display: 'block', width: '100%', height: 'auto', maxHeight: 680, objectFit: 'cover' }}
          />
        </BrowserFrame>
      </div>
    </div>
    <Footer />
  </div>
);

/* 16 - Tim: Admin SPPG */
const AdminPage: Page = () => (
  <div style={{ ...fill, padding: '48px 115px 72px' }}>
    <Atmos />
    <div style={{ ...content, width: '100%', maxWidth: 1520, margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ ...kicker, marginBottom: 6 }}>Prototype · Sisi Admin</div>
          <h2 style={{ ...headline, fontSize: 40, margin: 0 }}>
            Admin SPPG: Kelola Akun, Penugasan, &amp; <Acc>Wilayah Distribusi.</Acc>
          </h2>
        </div>
        <Chip accent>Admin SPPG</Chip>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BrowserFrame url="app.porsipas.id/admin">
          <img
            src={shotAdmin}
            alt="Dashboard Admin PorsiPas"
            style={{ display: 'block', width: '100%', height: 'auto', maxHeight: 680, objectFit: 'cover' }}
          />
        </BrowserFrame>
      </div>
    </div>
    <Footer />
  </div>
);
/* 17 - Metodologi: Lima tahap Design Thinking (Horizontal Stepper Flow) */
const ProcessStepCard = ({
  n,
  phase,
  title,
  body,
  tag,
  deliverable,
  isLast = false,
}: {
  n: string;
  phase: string;
  title: string;
  body: string;
  tag: string;
  deliverable: string;
  isLast?: boolean;
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minWidth: 0 }}>
    {/* Stepper Header Node with connecting line */}
    <div style={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative' }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 999,
          fontFamily: FONT_MONO,
          fontWeight: 800,
          fontSize: 18,
          color: 'var(--osd-accent)',
          background: '#fbf8f4',
          border: '2px solid var(--osd-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(169, 80, 27, 0.15)',
          zIndex: 2,
          flexShrink: 0,
        }}
      >
        {n}
      </div>

      {!isLast && (
        <div
          style={{
            flex: 1,
            height: 2,
            background: `linear-gradient(90deg, var(--osd-accent) 0%, ${bento.border} 100%)`,
            marginLeft: 8,
            marginRight: -4,
            zIndex: 1,
          }}
        />
      )}
    </div>

    {/* Content Card (Natural Height, No Excessive Blank Space) */}
    <Mat
      style={{
        padding: '26px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        background: '#ffffff',
        border: `1px solid ${bento.border}`,
        boxShadow: '0 10px 24px -12px rgba(30, 47, 64, 0.08)',
        borderRadius: 20,
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: 'var(--osd-accent)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {phase}
          </span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: ink.faint, background: 'rgba(30, 47, 64, 0.05)', padding: '3px 8px', borderRadius: 4 }}>
            {tag}
          </span>
        </div>

        <h3 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: ink.fg, margin: '0 0 10px', lineHeight: 1.2 }}>
          {title}
        </h3>

        <p style={{ fontSize: 16, color: ink.muted, lineHeight: 1.5, margin: 0 }}>
          {body}
        </p>
      </div>

      <div style={{ borderTop: `1px solid ${bento.border}`, paddingTop: 14 }}>
        <div style={{ fontSize: 11.5, fontFamily: FONT_MONO, color: ink.faint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
          Artefak Hasil
        </div>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: ink.fg, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Tick />
          {deliverable}
        </div>
      </div>
    </Mat>
  </div>
);

const MethodologyPage: Page = () => (
  <div style={{ ...fill, padding: '72px 115px 96px' }}>
    <Atmos />
    <div style={{ ...content, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ ...kicker, marginBottom: 8 }}>Metodologi Desain</div>
          <h2 style={{ ...headline, fontSize: 48, margin: 0 }}>
            Lima tahap pendekatan Design Thinking.
          </h2>
        </div>
        <Chip accent>Framework Kerja</Chip>
      </div>

      {/* Stepper Flow Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 20,
          width: '100%',
          alignItems: 'start',
          margin: 'auto 0',
        }}
      >
        <ProcessStepCard
          n="01"
          phase="Tahap 01"
          title="Empathize"
          body="Wawancara mendalam dengan SPPG, guru, dan ahli gizi untuk memetakan alur evaluasi menu MBG hari ini."
          tag="Riset"
          deliverable="User Journey Map"
        />
        <ProcessStepCard
          n="02"
          phase="Tahap 02"
          title="Define"
          body="Merumuskan tiga kendala utama dari data temuan lapangan, bukan asumsi tim semata."
          tag="Framing"
          deliverable="Core Problem Statements"
        />
        <ProcessStepCard
          n="03"
          phase="Tahap 03"
          title="Ideate"
          body="Membagi sistem ke 4 peran terintegrasi dan merancang alur feedback 5–10 detik berbasis ikon."
          tag="Solusi"
          deliverable="Closed-Loop Ecosystem"
        />
        <ProcessStepCard
          n="04"
          phase="Tahap 04"
          title="Prototype"
          body="Lo-Fi untuk mengunci alur, High-Fi untuk memvalidasi kontras visual dan Mode Kiosk satu tablet."
          tag="Desain"
          deliverable="Figma High-Fi Prototype"
        />
        <ProcessStepCard
          n="05"
          phase="Tahap 05"
          title="Testing"
          body="Usability testing terarah kepada 5 partisipan riil lintas jenjang (SD, SMP, SMA, dan SPPG)."
          tag="Validasi"
          deliverable="Temuan & Iterasi Desain"
          isLast
        />
      </div>

      {/* Bottom Context Banner */}
      <Mat
        style={{
          padding: '16px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(30, 47, 64, 0.03)',
          border: `1px solid ${bento.border}`,
          borderRadius: 16,
        }}
      >
        <span style={{ fontSize: 16, color: ink.muted, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--osd-accent)' }} />
          <strong>Iteratif &amp; Berbasis Bukti:</strong> Setiap tahap menghasilkan output nyata sebelum melangkah ke tahap berikutnya.
        </span>
        <span style={{ fontFamily: FONT_MONO, fontSize: 13, color: ink.faint }}>
          Standard ISO 9241-210 (Human-Centered Design)
        </span>
      </Mat>
    </div>
    <Footer />
  </div>
);
/* 18 - Usability testing: Temuan & Perbaikan Desain */
const UsabilityPage: Page = () => {
  const issues = [
    {
      no: '01',
      problem: 'Tombol aksi utama kurang kontras dengan latar belakang sehingga sulit ditemukan siswa saat pengisian pertama kali.',
      severity: 'Tinggi',
      solution: 'Menaikkan rasio kontras tombol ke standard WCAG AA (≥ 4.5:1) dengan warna brand tegas dan label berbobot tebal.',
      role: 'Siswa SD / SMP',
      resolved: true,
    },
    {
      no: '02',
      problem: 'Alur formulir umpan balik berbeda di setiap mode, sehingga guru pendamping bingung mengarahkan siswa saat giliran kelas.',
      severity: 'Tinggi',
      solution: 'Menyeragamkan struktur 3 pertanyaan (rasa, porsi, kondisi) secara identik di Mode Kiosk, Mandiri, maupun Perwakilan.',
      role: 'Koordinator Titik',
      resolved: true,
    },
    {
      no: '03',
      problem: 'Duplikasi label di ringkasan aktivitas dasbor: label “Total Porsi Hari Ini” muncul dua kali dengan nilai metrik berbeda (3.250 & 12).',
      severity: 'Sedang',
      solution: 'Memperbaiki label metrik kedua menjadi “Total Titik Aktif Hari Ini” untuk mengeliminasi kebingungan pembacaan data SPPG.',
      role: 'Admin SPPG',
      resolved: true,
    },
  ];

  return (
    <div style={{ ...fill, padding: '56px 115px 72px' }}>
      <Atmos />
      <div style={{ ...content, display: 'flex', flexDirection: 'column', gap: 28, height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ ...kicker, marginBottom: 8 }}>Fase 05 · Evaluasi Usabilitas</div>
            <h2 style={{ ...headline, fontSize: 44, margin: 0 }}>
              Tiga temuan kritis, dan ketiganya <Acc>tuntas diperbaiki.</Acc>
            </h2>
          </div>
          <Chip accent>5 Pengguna Riil · Moderated</Chip>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          {/* Table Container Card */}
          <Mat style={{ overflow: 'hidden', border: `1px solid ${bento.border}`, boxShadow: '0 8px 30px -15px rgba(30, 47, 64, 0.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(30, 47, 64, 0.04)', borderBottom: `2px solid ${bento.border}` }}>
                  <th style={{ padding: '16px 20px', fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, color: ink.faint, letterSpacing: '0.08em', textTransform: 'uppercase', width: 64, textAlign: 'center' }}>
                    No
                  </th>
                  <th style={{ padding: '16px 24px', fontSize: 14, fontWeight: 700, color: ink.fg, letterSpacing: '0.06em', textTransform: 'uppercase', width: '38%' }}>
                    Kendala Pengguna
                  </th>
                  <th style={{ padding: '16px 20px', fontSize: 14, fontWeight: 700, color: ink.fg, letterSpacing: '0.06em', textTransform: 'uppercase', width: 170, textAlign: 'center' }}>
                    Tingkat Keparahan
                  </th>
                  <th style={{ padding: '16px 24px', fontSize: 14, fontWeight: 700, color: ink.fg, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Solusi &amp; Tindak Lanjut Desain
                  </th>
                </tr>
              </thead>
              <tbody>
                {issues.map((item, idx) => (
                  <tr
                    key={item.no}
                    style={{
                      borderBottom: idx < issues.length - 1 ? `1px solid ${bento.border}` : 'none',
                      background: idx % 2 === 0 ? 'transparent' : 'rgba(30, 47, 64, 0.015)',
                    }}
                  >
                    <td style={{ padding: '24px 20px', textAlign: 'center', verticalAlign: 'middle', fontFamily: FONT_MONO, fontSize: 18, fontWeight: 800, color: 'var(--osd-accent)' }}>
                      {item.no}
                    </td>
                    <td style={{ padding: '24px 24px', verticalAlign: 'middle' }}>
                      <div style={{ fontSize: 18, fontWeight: 600, color: ink.fg, lineHeight: 1.45, marginBottom: 6 }}>
                        {item.problem}
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontFamily: FONT_MONO, color: ink.faint, background: 'rgba(30, 47, 64, 0.05)', padding: '3px 8px', borderRadius: 4 }}>
                        Ditemukan pada: {item.role}
                      </div>
                    </td>
                    <td style={{ padding: '24px 20px', textAlign: 'center', verticalAlign: 'middle' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          padding: '6px 14px',
                          borderRadius: 999,
                          fontFamily: FONT_MONO,
                          fontSize: 13,
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          background: item.severity === 'Tinggi' ? 'rgba(180, 35, 24, 0.1)' : 'rgba(181, 71, 8, 0.1)',
                          color: item.severity === 'Tinggi' ? '#b42318' : '#b54708',
                          border: `1px solid ${item.severity === 'Tinggi' ? 'rgba(180, 35, 24, 0.25)' : 'rgba(181, 71, 8, 0.25)'}`,
                        }}
                      >
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: item.severity === 'Tinggi' ? '#b42318' : '#b54708' }} />
                        {item.severity}
                      </span>
                    </td>
                    <td style={{ padding: '24px 24px', verticalAlign: 'middle' }}>
                      <div style={{ fontSize: 17.5, color: ink.muted, lineHeight: 1.5, marginBottom: 8 }}>
                        {item.solution}
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#15803d' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Terverifikasi di Prototype High-Fi
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Mat>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', fontSize: 15, color: ink.faint }}>
            <span>Metode: In-Person Moderated (Surabaya) &amp; Remote Moderated Usability Testing</span>
            <span>Target: Siswa, Koordinator Sekolah, dan Tim SPPG</span>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

/* 15 - SWOT: Open headline + 4 structured quadrant cards */
const SwotItem = ({ t }: { t: string }) => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
    <Tick />
    <span style={{ fontSize: 21, lineHeight: 1.45, color: ink.fg, fontWeight: 500 }}>{t}</span>
  </div>
);

const SwotQuadrant = ({
  code,
  name,
  idn,
  children,
  mitigasi,
}: {
  code: string;
  name: string;
  idn: string;
  children: ReactNode;
  mitigasi?: string;
}) => (
  <Mat
    style={{
      padding: '34px 36px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: 16,
    }}
  >
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 800, color: 'var(--osd-accent)' }}>
            {code}
          </span>
          <span style={{ fontSize: 25, fontWeight: 700, color: ink.fg }}>
            {name}
          </span>
        </div>
        <Chip>{idn}</Chip>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {children}
      </div>
    </div>

    {mitigasi && (
      <div style={{ fontSize: 16, color: ink.muted, background: '#fbf8f4', border: `1px solid ${bento.border}`, borderRadius: 8, padding: '10px 14px' }}>
        <strong style={{ color: ink.fg }}>Mitigasi:</strong> {mitigasi}
      </div>
    )}
  </Mat>
);

const SwotPage: Page = () => (
  <div style={{ ...fill, padding: '72px 115px 96px' }}>
    <Atmos />
    <div style={{ ...content, display: 'flex', flexDirection: 'column', gap: 36 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ ...kicker, marginBottom: 10 }}>Evaluasi Strategis</div>
          <h2 style={{ ...headline, fontSize: 52, margin: 0 }}>
            Analisis SWOT PorsiPas.
          </h2>
        </div>
        <Chip accent>Kesiapan Solusi</Chip>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, flex: 1, gridAutoRows: '1fr' }}>
        <SwotQuadrant code="S" name="Strength" idn="Kekuatan">
          <SwotItem t="Ulasan super cepat 5–10 detik tanpa unduh aplikasi" />
          <SwotItem t="Empat peran terhubung dalam satu lingkar data tertutup" />
          <SwotItem t="Mode Kiosk ramah anak untuk satu perangkat kelas bersama" />
        </SwotQuadrant>
        <SwotQuadrant
          code="W"
          name="Weakness"
          idn="Kelemahan"
          mitigasi="Dukungan antrean offline di Mode Kiosk, sinkronisasi otomatis saat online."
        >
          <SwotItem t="Membutuhkan koneksi internet saat submit feedback" />
          <SwotItem t="Format harian berpotensi monoton jika tanpa variasi visual" />
        </SwotQuadrant>
        <SwotQuadrant code="O" name="Opportunity" idn="Peluang">
          <SwotItem t="Ekspansi skala nasional Program MBG mencakup puluhan juta siswa" />
          <SwotItem t="Integrasi data dengan Badan Gizi Nasional (BGN)" />
          <SwotItem t="Urgensi target net zero emission & pengurangan food waste" />
        </SwotQuadrant>
        <SwotQuadrant code="T" name="Threat" idn="Tantangan">
          <SwotItem t="Kesenjangan infrastruktur perangkat antar sekolah daerah" />
          <SwotItem t="Keengganan staf sekolah dalam mengadopsi prosedur digital baru" />
        </SwotQuadrant>
      </div>
    </div>
    <Footer />
  </div>
);

/* 16 - Kesimpulan: Open free headline left + Compact link cards right */
const LinkRow = ({ l, u, href }: { l: string; u: string; href: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      padding: '16px 20px',
      background: '#fbf8f4',
      border: `1px solid ${bento.border}`,
      borderRadius: bento.radiusSm,
      textDecoration: 'none',
      transition: 'border-color 0.2s',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <Tick />
      <span style={{ fontSize: 18, fontWeight: 700, color: ink.fg }}>{l}</span>
    </div>
    <span style={{ fontFamily: FONT_MONO, fontSize: 14, color: 'var(--osd-accent)', fontWeight: 600 }}>{u} ↗</span>
  </a>
);

const ClosingPage: Page = () => (
  <div style={{ ...fill, padding: '72px 115px 96px' }}>
    <Atmos />
    <div style={{ ...content, height: '100%', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 48, alignItems: 'center' }}>
      {/* Left: Free open conclusion typography (NO card) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Chip accent>Kesimpulan &amp; Dampak</Chip>
        <h2
          style={{
            fontFamily: 'var(--osd-font-display)',
            fontSize: 76,
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            color: ink.fg,
            margin: 0,
          }}
        >
          Umpan balik <Acc>5–10 detik</Acc> yang langsung berdampak nyata.
        </h2>
        <p style={{ fontSize: 23, color: ink.muted, lineHeight: 1.5, margin: 0, maxWidth: '32ch' }}>
          PorsiPas mentransformasi sisa makanan di kelas dari limbah tak terpantau menjadi data keputusan menu yang presisi bagi SPPG: mengoptimalkan gizi anak dan menyelamatkan anggaran negara.
        </p>

        <div style={{ borderTop: `1px solid ${bento.border}`, paddingTop: 20 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: ink.fg, marginBottom: 4 }}>
            Terima Kasih · Dewan Juri ITCC 2026
          </div>
          <div style={{ fontSize: 15, color: ink.muted }}>
            Tim ERRIC · Politeknik Elektronika Negeri Surabaya
          </div>
        </div>
      </div>

      {/* Right: Clean links bento box */}
      <Mat style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 14, color: ink.fg, fontWeight: 700, textTransform: 'uppercase' }}>
            Dokumentasi &amp; Prototype
          </span>
          <Chip accent>Figma</Chip>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <LinkRow
            l="Prototype Interaktif"
            u="figma.com/proto"
            href="https://www.figma.com/proto/1KE3SRtmHF0lo3H1mgCwIQ/PorsiPas?node-id=263-2813"
          />
          <LinkRow
            l="Moodboard &amp; Inspirasi"
            u="figma.com/design"
            href="https://www.figma.com/design/1KE3SRtmHF0lo3H1mgCwIQ/PorsiPas?node-id=909-3691"
          />
          <LinkRow
            l="Style Guide UI"
            u="figma.com/design"
            href="https://www.figma.com/design/1KE3SRtmHF0lo3H1mgCwIQ/PorsiPas?node-id=215-1879"
          />
          <LinkRow
            l="Design System"
            u="figma.com/design"
            href="https://www.figma.com/design/1KE3SRtmHF0lo3H1mgCwIQ/PorsiPas?node-id=215-1880"
          />
        </div>

        <div style={{ textAlign: 'center', fontSize: 14, color: ink.faint, borderTop: `1px solid ${bento.border}`, paddingTop: 14 }}>
          Klik tautan di atas untuk menguji coba interaksi langsung di Figma.
        </div>
      </Mat>
    </div>
    <Footer />
  </div>
);

/* ══════════════════════════════════════════════════════════
   Module exports
   ══════════════════════════════════════════════════════════ */
export const meta: SlideMeta = {
  title: 'PorsiPas: Sistem Umpan Balik MBG · ITCC 2026',
  createdAt: '2026-10-07T22:26:36.750Z',
};

export const notes: (string | undefined)[] = [
  'Perkenalkan tim ERRIC dari PENS 2026. PorsiPas adalah sistem umpan balik untuk program Makan Bergizi Gratis. Satu kalimat pembuka: pemborosan makanan adalah masalah anggaran, bukan sekadar piring penuh.',
  'Angka nasional ini yang membuat kami memilih food waste sebagai subtema. Sebut sumbernya, lalu langsung ke konteks MBG.',
  'Tiga keluhan lapangan ini kami temui langsung dari SPPG. Tekankan bahwa masalahnya ada di data, bukan di niat.',
  'Empat angka ini yang kami bawa ke juri. Jangan dibaca semua: pilih yang paling relevan dengan pertanyaan mereka.',
  'Semua keluhan ini berujung pada kata yang sama: tidak tahu. Berhenti sebentar setelah slide ini.',
  'Ini tiga kendala yang kami bawa ke tahap ideasi. Klik satu per satu, lalu diam sebentar sebelum pindah.',
  'Beralih dari masalah ke solusi.',
  'Empat sisi, satu lingkar. Tekankan bahwa data kembali menjadi acuan menu berikutnya: di situlah lingkarnya tertutup.',
  'Halaman beranda siswa: masuk cukup dengan kode sesi 6 digit harian tanpa email atau registrasi akun.',
  'Halaman masuk staf: verifikasi via OTP nomor HP yang langsung mendeteksi peran dan mengarahkan ke dasbor terkait.',
  'Form micro-feedback: 3 pertanyaan rasa, porsi, kondisi dengan ikon ramah anak, selesai dalam 5–10 detik.',
  'Mode Kiosk: solusi praktis untuk kelas SD di mana 1 tablet dipakai bergantian oleh seluruh siswa tanpa keluar aplikasi.',
  'Menu Acceptance Dashboard SPPG: analitik penerimaan menu, persentase sisa piring, keluhan dominan, dan AI Insight.',
  'Dashboard Koordinator Titik: guru/staf sekolah menyiapkan kode sesi harian dan mengisi validasi feedback perwakilan.',
  'Dashboard Penyalur: pembaruan status distribusi real-time dari dapur pengolahan hingga tiba dan diverifikasi di sekolah.',
  'Dashboard Admin SPPG: manajemen data pengguna terpusat, pembuatan akun SPPG dan koordinator titik.',
  'Lima tahap Design Thinking, masing-masing menghasilkan artefak yang bisa ditunjukkan.',
  'Tiga temuan, dua di antaranya severity tinggi: ketiganya sudah kami perbaiki. Tunjuk barisnya, jangan dibaca.',
  'Evaluasi jujur: kekuatan, kelemahan, peluang, ancaman. Sorot satu kuadran per kalimat, jangan baca semua.',
  'Tutup dengan ajakan konkret: buka prototype-nya. Biarkan tautan tetap terlihat saat sesi tanya jawab.',
];

export default [
  CoverPage,
  BigNumberPage,
  BackgroundPage,
  StatsPage,
  PainPointsPage,
  DefinePage,
  SectionPage,
  LoopPage,
  StudentHomePage,
  StaffLoginPage,
  FeedbackQuestionPage,
  KioskModePage,
  DashboardPage,
  KoordinatorPage,
  PenyalurPage,
  AdminPage,
  MethodologyPage,
  UsabilityPage,
  SwotPage,
  ClosingPage,
] satisfies Page[];
