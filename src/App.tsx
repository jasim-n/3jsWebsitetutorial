import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll } from '@react-three/drei';
import Scene from './components/Scene';
import './App.css';

function App() {
  return (
    <div className="canvas-container">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <color attach="background" args={['#050505']} />
        
        <ScrollControls pages={4} damping={0.25}>
          
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
            </main>
          </Scroll>
        </ScrollControls>
        
      </Canvas>
    </div>
  );
}

export default App;
