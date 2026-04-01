import { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ScrollControls, Scroll, useScroll } from '@react-three/drei';
import Scene from './components/Scene';
import { scrollStore } from './scrollStore';
import * as THREE from 'three';
import './App.css';

// Controls the canvas background color based on scroll position
function BackgroundColor() {
  const scroll = useScroll();
  const { scene } = useThree();
  const colorDark = new THREE.Color('#050505');
  const colorLight = new THREE.Color('#dce8f5');
  const current = useRef(new THREE.Color('#050505'));

  useFrame(() => {
    // Fade to light when entering testimonial section (offset > 0.55) and stay light
    const p1 = Math.max(0, Math.min(1, (scroll.offset - 0.55) / 0.1));
    
    current.current.lerpColors(colorDark, colorLight, p1);
    scene.background = current.current;
  });

  return null;
}

// Publishes scroll offset to the shared store every frame
function ScrollTracker() {
  const scroll = useScroll();
  useFrame(() => { scrollStore.offset = scroll.offset; });
  return null;
}

function AppInner() {
  return (
    <ScrollControls pages={6.45} damping={0.25}>
      <ScrollTracker />
      <BackgroundColor />
      <Scene />
      <Scroll html style={{ width: '100vw' }}>
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
          <section className="section text-block" style={{ minHeight: '45vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.0)' }}>
            <div className="section-content" style={{ background: 'rgba(255,255,255,0.85)', padding: '2rem 3rem', borderRadius: '24px', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <h2>Interactive Discoveries</h2>
              <p style={{ margin: 0 }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
            </div>
          </section>
          <section className="section glassglob" style={{ height: '100vh', pointerEvents: 'none' }}></section>
        </main>
      </Scroll>
    </ScrollControls>
  );
}

function App() {
  return (
    <div className="canvas-container">
      <Canvas camera={{ position: [0, 0, 8], fov: 55 }}>
        <Suspense fallback={null}>
          <AppInner />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default App;
