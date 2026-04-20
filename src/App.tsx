import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Scene from './components/Scene';
import { scrollStore } from './scrollStore';
import * as THREE from 'three';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

function BackgroundColor() {
  const { scene } = useThree();
  const colorDark = new THREE.Color('#050505');
  const colorLight = new THREE.Color('#dce8f5');
  const current = useRef(new THREE.Color('#050505'));

  useFrame(() => {
    const p1 = Math.max(0, Math.min(1, (scrollStore.offset - 0.55) / 0.1));
    current.current.lerpColors(colorDark, colorLight, p1);
    scene.background = current.current;
  });

  return null;
}

function App() {
  const scrollRootRef = useRef<HTMLDivElement>(null);

  // Drive scrollStore.offset from native scroll via GSAP ScrollTrigger
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: scrollRootRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.25,
      onUpdate: (self) => {
        scrollStore.offset = self.progress;
      },
    });

    return () => trigger.kill();
  }, []);

  // GSAP reveal animations for HTML section text
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.section-content').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              end: 'top 50%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, scrollRootRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* Fixed 3D canvas always behind */}
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 0, 8], fov: 55 }}>
          <Suspense fallback={null}>
            <BackgroundColor />
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      {/* Scrollable page — 6.45 pages tall, sections stacked */}
      <div ref={scrollRootRef} style={{ position: 'relative', height: '645vh' }}>
        <main className="content">
          <section className="section hero">
            <div className="section-content">
              <h1>Immersive Digital Experiences</h1>
              <p>Craft and narrative become one.</p>
            </div>
          </section>

          <section className="section about">
            <div className="section-content">
              <h2>The Story Dictates the Medium</h2>
              <p>From 3D websites to cinematic videos.</p>
            </div>
          </section>

          <section className="section work">
            <div className="section-content">
              <h2>Innovative Work</h2>
              <p>Pushing what is possible in digital design.</p>
            </div>
          </section>

          <section className="section contact">
            <div className="section-content">
              <h2>Let's Talk About You</h2>
              <p>Ready to collaborate.</p>
            </div>
          </section>

          <section className="section testimonials">
            <div className="section-content" />
          </section>

          <section
            className="section text-block"
            style={{ minHeight: '45vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
          >
            <div
              className="section-content"
              style={{ background: 'rgba(255,255,255,0.85)', padding: '2rem 3rem', borderRadius: '24px', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
            >
              <h2>Interactive Discoveries</h2>
              <p style={{ margin: 0 }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
              </p>
            </div>
          </section>

          <section className="section glassglob" style={{ height: '100vh', pointerEvents: 'none' }} />
        </main>
      </div>
    </>
  );
}

export default App;
