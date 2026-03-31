import { useEffect, useRef } from 'react';
import { scrollStore } from '../scrollStore';

const TESTIMONIALS = [
  { company: "AMD",        text: '"Noomo does such incredible and thoughtful work. I have been at this almost 25 years and have never been more impressed with an agency."', author: "WALLIS MILLS — Director of Marketing" },
  { company: "Salesforce", text: '"I\'ve been very impressed with how the Noomo team has worked quickly to immerse themselves in the narrative of our products."',           author: "JONNY FRUITS — Sr. Creative Director" },
  { company: "Red Bull",   text: '"The entire Noomo team have been an exceptional and trusted creative partner in shaping our global digital products."',                  author: "DAVID GRAU — Director Global Product Design" },
  { company: "coinbase",   text: '"Noomo demonstrates an abundance of creativity and ambition when it comes to complex Web3 projects."',                                  author: "ERIC DAVIES — Senior Producer" },
  { company: "Intel",      text: '"Their innovative use of WebGL at AWS re:Invent created an experience that truly showcased what modern web can do."',                  author: "TEAM INTEL — AI Experience" },
];

// We need enough physical cards to fill a 1920px screen + scrolling leeway.
// Since 5 cards * 304px = ~1520px, we duplicate the array so there are no empty gaps when it loops.
const DISPLAY_ITEMS = [...TESTIMONIALS, ...TESTIMONIALS];

const CARD_W    = 280;
const SPACING   = CARD_W + 24;
const AMPLITUDE = 80;
const FREQUENCY = 0.0035;

export function SineCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const cards = Array.from(track.children) as HTMLElement[];
    const totalW = SPACING * cards.length;

    // How many scroll pages the testimonials section occupies
    // ScrollControls has pages=5, testimonials start at page 4 (offset 0.8):
    const SECTION_START = 0.8;
    const SECTION_END   = 1.0;

    // Smoothed carousel offset (lerp target)
    let smoothOffset = 0;

    function tick() {
      // Map scroll.offset within [0.8, 1.0] → [0, totalW]
      const raw = scrollStore.offset;
      const t   = Math.max(0, Math.min(1, (raw - SECTION_START) / (SECTION_END - SECTION_START)));
      const targetOffset = t * totalW;

      // Smooth lerp so motion feels fluid, not snappy
      smoothOffset += (targetOffset - smoothOffset) * 0.1;

      cards.forEach((card, i) => {
        let x = (i * SPACING - smoothOffset + totalW * 2) % totalW;
        const centredX = x - totalW / 2;
        const y = Math.sin(centredX * FREQUENCY) * AMPLITUDE;
        card.style.transform = `translate(${centredX + totalW / 2}px, ${y}px)`;
        // Fade cards near the edges
        const dist = Math.abs(centredX) / (totalW / 2);
        card.style.opacity = String(Math.max(0.3, 1 - dist * 0.85));
      });

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
    }}>
      {/* Big background text */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: 'clamp(3rem, 8vw, 7rem)',
        fontWeight: 900,
        color: 'rgba(0,0,0,0.07)',
        lineHeight: 0.9,
        textAlign: 'center',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        pointerEvents: 'none',
        letterSpacing: '-0.03em',
      }}>
        GREAT WORK<br />CAN'T HAPPEN<br />WITHOUT TEAM A.
      </div>

      {/* The sine-wave track */}
      <div
        ref={trackRef}
        style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          width: '100%',
          height: 0,
        }}
      >
        {DISPLAY_ITEMS.map((td, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: CARD_W,
              background: 'rgba(240,245,255,0.78)',
              backdropFilter: 'blur(18px) saturate(1.5)',
              WebkitBackdropFilter: 'blur(18px) saturate(1.5)',
              border: '1px solid rgba(255,255,255,0.55)',
              borderRadius: 16,
              padding: '24px 22px',
              boxSizing: 'border-box',
              boxShadow: '0 8px 40px rgba(0,0,40,0.10), inset 0 1px 0 rgba(255,255,255,0.7)',
              transform: `translate(${i * SPACING}px, 0px)`,
              transition: 'opacity 0.3s',
              willChange: 'transform, opacity',
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0a0a0a', marginBottom: 12, letterSpacing: '-0.01em' }}>
              {td.company}
            </div>
            <div style={{ fontSize: 12, color: '#1a1a1a', lineHeight: 1.6, marginBottom: 20 }}>
              {td.text}
            </div>
            <div style={{ fontSize: 10, color: '#666', lineHeight: 1.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {td.author}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
