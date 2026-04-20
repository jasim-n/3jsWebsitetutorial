import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, Text } from '@react-three/drei';
import * as THREE from 'three';
import { scrollStore } from '../scrollStore';

const CARDS = [
  { title: "Project Alpha", color: "#ff0055" },
  { title: "Project Beta", color: "#0055ff" },
  { title: "Project Gamma", color: "#00ff55" },
  { title: "Project Delta", color: "#ffaa00" },
  { title: "Project Epsilon", color: "#aa00ff" },
];

export function GlassCarousel() {
  const groupRef = useRef<THREE.Group>(null);
  const radius = 3.5;
  const count = CARDS.length;

  useFrame((state) => {
    if (!groupRef.current) return;

    // Rotate the entire carousel continuously, plus bound rotation to scroll progress 
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.1 + (scrollStore.offset * Math.PI * 4);

    // Animate Y position so it slides up when we reach the second half of the page
    // Using simple lerp logic towards a target based on the scroll offset
    const targetY = scrollStore.offset > 0.25 && scrollStore.offset < 0.48 ? 0 : -20;
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05);
  });

  return (
    <group ref={groupRef} position={[0, -10, 0]}>
      {CARDS.map((card, i) => {
        const angle = (i / count) * Math.PI * 2;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;

        return (
          <group key={i} position={[x, 0, z]} rotation={[0, angle, 0]}>
            {/* The Glassy Card */}
            <mesh>
              <planeGeometry args={[2.2, 3.2]} />
              <MeshTransmissionMaterial
                backside={true}
                samples={4}
                thickness={0.5}
                roughness={0.1}
                clearcoat={1}
                clearcoatRoughness={0.1}
                transmission={1}
                ior={1.5}
                chromaticAberration={0.06}
                color={card.color}
              />
            </mesh>
            {/* The Text embedded on the glass */}
            <Text
              position={[0, 0, 0.1]}
              fontSize={0.25}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              maxWidth={1.8}
            >
              {card.title}
            </Text>
          </group>
        );
      })}
    </group>
  );
}
