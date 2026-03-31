import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll, Float } from '@react-three/drei';
import * as THREE from 'three';

// ─── Simple Wave Function ────────────────────────────────────────────────────
function getWaveHeight(x: number, z: number, time: number) {
  // Sum of overlapping sine waves to create chaotic but smooth ocean ripples
  const scale = 0.4;
  const speed = 1.2;
  return (
    Math.sin((x * 0.4) + time * speed) * scale +
    Math.cos((z * 0.3) + time * speed * 0.8) * scale +
    Math.sin((x * 0.2 + z * 0.5) + time * 1.5) * scale * 0.5
  );
}

// ─── Procedural Placeholder Ship ─────────────────────────────────────────────
// Later, this can be swapped with a loaded GLTF model.
function PlaceholderShip(props: any) {
  return (
    <group {...props}>
      {/* Hull */}
      <mesh position={[0, -0.1, 0]}>
        {/* A simple stretched and tapered shape mimicking a low-poly hull */}
        <cylinderGeometry args={[0.6, 0.4, 1.8, 6]} />
        <meshStandardMaterial color="#302013" roughness={0.8} />
      </mesh>
      {/* Mast */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 2.4]} />
        <meshStandardMaterial color="#201005" />
      </mesh>
      {/* Sail Main */}
      <mesh position={[0, 1.2, 0.3]} rotation={[0, -0.4, 0]}>
        <boxGeometry args={[1.2, 1.8, 0.05]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.9} />
      </mesh>
      {/* Sail Front */}
      <mesh position={[0, 0.6, 1.2]} rotation={[-0.4, 0, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 1.5]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
    </group>
  );
}

export function OceanShip() {
  const oceanRef = useRef<THREE.Mesh>(null);
  const shipGroupRef = useRef<THREE.Group>(null); // For scroll position
  const shipBobRef = useRef<THREE.Group>(null);   // For wave bobbing physics
  
  const scroll = useScroll();
  const { viewport } = useThree();

  // Create geometry once
  const planeGeo = useMemo(() => new THREE.PlaneGeometry(80, 80, 60, 60), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const offset = scroll.offset;

    // 1. Animate Ocean Waves via CPU modification of vertices
    if (oceanRef.current) {
      const positions = oceanRef.current.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        // Plane is rotated -PI/2 on X.
        // So local X = world X. Local Y = world -Z.
        const lx = positions.getX(i);
        const ly = positions.getY(i);
        const worldZ = -ly;
        
        const h = getWaveHeight(lx, worldZ, time);
        // Set local Z (which points up as World Y due to rotation)
        positions.setZ(i, h);
      }
      positions.needsUpdate = true;
      oceanRef.current.geometry.computeVertexNormals();
    }

    // 2. Set base scroll position of the Ship (similar to AnimatedSphere logic)
    if (shipGroupRef.current) {
      const edgeX = (viewport.width / 2) - 3.0;
      const targetPos = new THREE.Vector3();
      let targetScale = 1.0;

      // Section 1: Right -> Left
      if (offset < 0.25) {
        const p = offset / 0.25;
        targetPos.lerpVectors(new THREE.Vector3(edgeX, 0, 0), new THREE.Vector3(-edgeX, -0.5, 2), p);
        targetScale = 1.2 - (0.2 * p);
      } 
      // Section 2: Left -> Right
      else if (offset < 0.5) {
        const p = (offset - 0.25) / 0.25;
        targetPos.lerpVectors(new THREE.Vector3(-edgeX, -0.5, 2), new THREE.Vector3(edgeX, 0, -2), p);
        targetScale = 1.0;
      } 
      // Section 3: Right -> Center distance
      else if (offset < 0.75) {
        const p = (offset - 0.5) / 0.25;
        targetPos.lerpVectors(new THREE.Vector3(edgeX, 0, -2), new THREE.Vector3(0, 0.5, -4), p);
        targetScale = 1.0 - (0.4 * p);
      } 
      // Section 4: Exit to background
      else {
        const p = (offset - 0.75) / 0.25;
        targetPos.lerpVectors(new THREE.Vector3(0, 0.5, -4), new THREE.Vector3(-edgeX * 2, 2, -10), p);
        targetScale = 0.6 - (0.4 * p);
      }

      shipGroupRef.current.position.copy(targetPos);
      shipGroupRef.current.scale.setScalar(targetScale);

      // Make the ship look towards where it's scrolling
      // (For this placeholder, X moves dictating facing direction)
      const lookOffset = Math.sin(time * 0.5) * 0.2; 
      shipGroupRef.current.rotation.y = targetPos.x > 0 ? -1.57 + lookOffset : 1.57 + lookOffset;
    }

    // 3. Make the ship bob exactly on the wave surface underneath it
    if (shipGroupRef.current && shipBobRef.current) {
      const sx = shipGroupRef.current.position.x;
      const sz = shipGroupRef.current.position.z;
      
      // Get height exactly under the ship
      const shipY = getWaveHeight(sx, sz, time);
      shipBobRef.current.position.y = shipY;

      // Calculate approximate slope for tilt
      const dx = getWaveHeight(sx + 0.1, sz, time) - shipY;
      const dz = getWaveHeight(sx, sz + 0.1, time) - shipY;

      // Apply tilt to the bobbing group
      shipBobRef.current.rotation.z = -dx * 8; // Roll
      shipBobRef.current.rotation.x = dz * 8;  // Pitch
    }
  });

  return (
    <group>
      {/* ─── Oceanic Plane ─── */}
      <mesh 
        ref={oceanRef} 
        geometry={planeGeo} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -2.5, -5]}
      >
        <meshStandardMaterial 
          color="#042a4f" 
          roughness={0.1} 
          metalness={0.8} 
          flatShading 
        />
      </mesh>

      {/* ─── The Ship (Scroll Group -> Bobbing Group) ─── */}
      <group ref={shipGroupRef}>
        <group ref={shipBobRef}>
          <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
            {/* Base rotation to fix the cylinder alignment to point forward */}
            <PlaceholderShip rotation={[0, Math.PI / 2, Math.PI / 2]} />
          </Float>
        </group>
      </group>
    </group>
  );
}
