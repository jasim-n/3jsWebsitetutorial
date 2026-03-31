import { useRef } from 'react';
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
    // Transition to light when in the testimonial section (offset > 0.75)
    const p = Math.max(0, Math.min(1, (scroll.offset - 0.75) / 0.1));
    current.current.lerpColors(colorDark, colorLight, p);
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
    <ScrollControls pages={5} damping={0.25}>
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
        </main>
      </Scroll>
    </ScrollControls>
  );
}

function App() {
  return (
    <div className="canvas-container">
      <Canvas camera={{ position: [0, 0, 8], fov: 55 }}>
        <AppInner />
      </Canvas>
    </div>
  );
}

export default App;
