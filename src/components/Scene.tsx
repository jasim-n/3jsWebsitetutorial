import { useFrame } from '@react-three/fiber';
import { Environment, Float, MeshDistortMaterial, Sphere, useScroll } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const scroll = useScroll();

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Constant rotation
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;

    // Scroll interpolation
    // offset goes from 0 (top) to 1 (bottom)
    const offset = scroll.offset; 

    // Calculate target position and scale based on scroll sections
    const targetPosition = new THREE.Vector3();
    let targetScale = 1.5;

    // We have 4 pages. 
    // Sec 1 is 0 -> 0.33
    // Sec 2 is 0.33 -> 0.66
    // Sec 3 is 0.66 -> 1.0

    if (offset < 0.33) {
      const progress = offset / 0.33;
      targetPosition.lerpVectors(new THREE.Vector3(2, -1, 0), new THREE.Vector3(-2, 0, 0), progress);
      targetScale = 1.5 - (0.5 * progress);
    } else if (offset < 0.66) {
      const progress = (offset - 0.33) / 0.33;
      targetPosition.lerpVectors(new THREE.Vector3(-2, 0, 0), new THREE.Vector3(2, 0, 0), progress);
      targetScale = 1;
    } else {
      const progress = (offset - 0.66) / 0.34;
      targetPosition.lerpVectors(new THREE.Vector3(2, 0, 0), new THREE.Vector3(0, 0, 0), progress);
      targetScale = 1 + (1 * progress);
    }

    // ScrollControls with damping=0.25 already smoothly interpolates scroll.offset.
    // So we can just directly apply it for buttery smoothness!
    meshRef.current.position.copy(targetPosition);
    meshRef.current.scale.setScalar(targetScale);
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <MeshDistortMaterial 
          color="#4200ff" 
          attach="material" 
          distort={0.4} 
          speed={2} 
          roughness={0.1} 
          metalness={0.9} 
        />
      </Sphere>
    </Float>
  );
}

export default function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Environment preset="city" />
      <AnimatedSphere />
    </>
  );
}
