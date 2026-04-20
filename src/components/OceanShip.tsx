import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Float } from '@react-three/drei';
import { useControls } from 'leva';
import * as THREE from 'three';
import { scrollStore } from '../scrollStore';

// ─── Simple Wave Function for Ship Bobbing ───────────────────────────────────
// We use this to calculate physics heights. 
// If the water model is static, we'll try to match its scale.
function getWaveHeight(x: number, z: number, time: number) {
  const scale = 0.4;
  const speed = 1.2;
  return (
    Math.sin((x * 0.4) + time * speed) * scale +
    Math.cos((z * 0.3) + time * speed * 0.8) * scale +
    Math.sin((x * 0.2 + z * 0.5) + time * 1.5) * scale * 0.5
  );
}

export function OceanShip() {
  const shipGroupRef = useRef<THREE.Group>(null);
  const shipBobRef = useRef<THREE.Group>(null);

  const { viewport } = useThree();

  // 1. Load Models 
  // Spaceship GLTF (Standard)
  const ship = useGLTF('/modals/spaceship/scene.gltf');
  // Water GLB (Large 163MB)
  // const water = useGLTF('/modals/water_waves.glb');

  // 2. Leva Controls
  const { showWater, shipScale, oceanY } = useControls('Scene Controls', {
    showWater: false,
    shipScale: { value: 0.8, min: 0.1, max: 2.0, step: 0.1 },
    oceanY: { value: -2.5, min: -10, max: 0, step: 0.1 }
  });

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const offset = scrollStore.offset;

    // ─── Ship Scroll Path (Horizontal Sweep) ───
    if (shipGroupRef.current) {
      const edgeX = (viewport.width / 2) - 3.0;
      const targetPos = new THREE.Vector3();
      let targetBaseScale = shipScale;

      // Section 1: Right -> Left
      if (offset < 0.25) {
        const p = offset / 0.25;
        targetPos.lerpVectors(new THREE.Vector3(edgeX, 0, 0), new THREE.Vector3(-edgeX, -0.5, 2), p);
      }
      // Section 2: Left -> Right
      else if (offset < 0.5) {
        const p = (offset - 0.25) / 0.25;
        targetPos.lerpVectors(new THREE.Vector3(-edgeX, -0.5, 2), new THREE.Vector3(edgeX, 0, -2), p);
      }
      // Section 3: Right -> Center
      else if (offset < 0.75) {
        const p = (offset - 0.5) / 0.25;
        targetPos.lerpVectors(new THREE.Vector3(edgeX, 0, -2), new THREE.Vector3(0, 0.5, -4), p);
        targetBaseScale *= (1.0 - (0.4 * p));
      }
      // Section 4: Exit
      else {
        const p = (offset - 0.75) / 0.25;
        targetPos.lerpVectors(new THREE.Vector3(0, 0.5, -4), new THREE.Vector3(-edgeX * 2, 2, -10), p);
        targetBaseScale *= (0.6 - (0.4 * p));
      }

      shipGroupRef.current.position.copy(targetPos);
      shipGroupRef.current.scale.setScalar(targetBaseScale);

      // Facing logic
      const lookDelta = Math.sin(time * 0.5) * 0.1;
      shipGroupRef.current.rotation.y = targetPos.x > 0 ? -1.57 + lookDelta : 1.57 + lookDelta;
    }

    // ─── Buoyancy Logic ───
    if (shipGroupRef.current && shipBobRef.current) {
      const sx = shipGroupRef.current.position.x;
      const sz = shipGroupRef.current.position.z;

      const shipY = getWaveHeight(sx, sz, time);
      shipBobRef.current.position.y = shipY;

      const dx = getWaveHeight(sx + 0.1, sz, time) - shipY;
      const dz = getWaveHeight(sx, sz + 0.1, time) - shipY;

      shipBobRef.current.rotation.z = -dx * 6; // Roll
      shipBobRef.current.rotation.x = dz * 6;  // Pitch
    }
  });

  return (
    <group>
      {/* ─── High Quality Ocean Model ─── */}
      {/* {showWater && (
        <primitive 
          object={water.scene} 
          position={[0, oceanY, -5]} 
          scale={[2, 1, 2]} 
        />
      )} */}

      {/* ─── Spaceship Model ─── */}
      <group ref={shipGroupRef}>
        <group ref={shipBobRef}>
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            {/* Standard GLTF from Sketchfab usually needs height adjustment */}
            <primitive object={ship.scene} position={[0, 0, 0]} />
          </Float>
        </group>
      </group>
    </group>
  );
}

// Preload to avoid mounting jank
useGLTF.preload('/modals/spaceship/scene.gltf');
// useGLTF.preload('/modals/water_waves.glb');
