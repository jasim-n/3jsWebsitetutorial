import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Float, Sphere, Clone, Center } from '@react-three/drei';
import * as THREE from 'three';
import { scrollStore } from '../scrollStore';

const GLOBE_RADIUS = 2.5;
const NUM_BLOCKS = 220;
const BLOCK_SIZE = [0.6, 0.6, 0.08] as [number, number, number];
const HOVER_RADIUS = 1.5;
const HOVER_PUSH = 1.8; // How far to push blocks away

function InstancesGlobe() {
  // Dummy object to calculate matrix transforms effortlessly
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const hoverPointRef = useRef<THREE.Vector3 | null>(null);

  // Pre-calculate base positions and rotations on a Fibonacci sphere
  const blocksData = useMemo(() => {
    const data = [];
    for (let i = 0; i < NUM_BLOCKS; i++) {
      // Fibonacci sphere point distribution
      const phi = Math.acos(-1 + (2 * i) / NUM_BLOCKS);
      const theta = Math.sqrt(NUM_BLOCKS * Math.PI) * phi;

      const x = GLOBE_RADIUS * Math.cos(theta) * Math.sin(phi);
      const y = GLOBE_RADIUS * Math.sin(theta) * Math.sin(phi);
      const z = GLOBE_RADIUS * Math.cos(phi);

      const position = new THREE.Vector3(x, y, z);

      // Orient the box so its face points outward, normal to the sphere surface
      const baseQuaternion = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        position.clone().normalize()
      );

      data.push({
        basePos: position,
        baseQuat: baseQuaternion,
        currentPos: position.clone(),
        // Randomize individual subtle float speeds
        speed: 0.5 + Math.random() * 0.8,
        offset: Math.random() * Math.PI * 2
      });
    }
    return data;
  }, []);

  useFrame((state) => {
    if (!instancedMeshRef.current) return;
    const time = state.clock.elapsedTime;

    // Premium idle animation - deeply slow, continuous rotation of the globe
    instancedMeshRef.current.rotation.y = time * 0.08;
    instancedMeshRef.current.rotation.x = time * 0.04;

    // Convert world hoverPoint to local space of the rotating instancedMesh
    let localHoverPoint: THREE.Vector3 | null = null;
    if (hoverPointRef.current) {
      localHoverPoint = hoverPointRef.current.clone();
      instancedMeshRef.current.worldToLocal(localHoverPoint);
    }

    blocksData.forEach((data, i) => {
      const { basePos, baseQuat, currentPos, speed, offset } = data;

      const targetPos = basePos.clone();

      // Subtle organic breathing motion for each block
      const breathingOffset = Math.sin(time * speed + offset) * 0.08;
      targetPos.add(basePos.clone().normalize().multiplyScalar(breathingOffset));

      // Interaction Displacement Logic (GSAP style hover reveal)
      let blockScale = 1;
      if (localHoverPoint) {
        const dist = basePos.distanceTo(localHoverPoint);
        if (dist < HOVER_RADIUS) {
          // Easing curve for the push force
          const force = Math.pow(1 - (dist / HOVER_RADIUS), 2);

          // Push radially outwards from the center of the sphere
          const pushDir = basePos.clone().normalize();
          targetPos.add(pushDir.multiplyScalar(force * HOVER_PUSH ));//will do it my self remove 5.2

          // Optionally shrink blocks slightly as they push out to create a deeper "hole"
          blockScale = 1 - (force * .9);//will do it my self make .9 .6
        }
      }

      // Smoothly interpolate current position toward target for that buttery organic feel
      currentPos.lerp(targetPos, 0.08);

      // Apply transforms to our dummy object and snapshot the matrix
      dummy.position.copy(currentPos);
      dummy.quaternion.copy(baseQuat);
      dummy.scale.setScalar(blockScale);
      dummy.updateMatrix();

      // Inject matrix into the optimized GPU buffer
      instancedMeshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    // Notify ThreeJS to upload the new buffer to the GPU for this frame
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* Invisible hit-box layer for seamless Raycasting */}
      <Sphere
        args={[GLOBE_RADIUS + 0.1, 32, 32]}
        visible={false}
        onPointerMove={(e) => {
          // Stop propagation so it doesn't drill-down to elements behind it
          e.stopPropagation();
          if (!hoverPointRef.current) hoverPointRef.current = new THREE.Vector3();
          hoverPointRef.current.copy(e.point);
        }}
        onPointerOut={() => { hoverPointRef.current = null; }}
      />

      {/* Single Draw Call Glass Instances */}
      <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, NUM_BLOCKS]}>
        <boxGeometry args={BLOCK_SIZE} />
        {/* Highly Refractive Glass Material */}
        {/* Setting transmission to 1 and roughness very low creates a premium glass look */}
        {/* Premium Diamond/Crystal Glass Material matching the reference */}
        {/* <meshPhysicalMaterial
          transmission={1}          // Fully see-through glass
          transparent={true}
          opacity={1}

          roughness={0}             // Perfectly polished surface
          metalness={0.1}           // Very slight metalness to darken shadows and pop reflections

          ior={1.52}                // Exact IOR of optical glass for heavy light bending
          thickness={2.5}           // High thickness forces deep inner refraction logic 

          envMapIntensity={3}       // Heavily multiply environment reflections for high contrast

          clearcoat={1}             // Add glaring specular highlights
          clearcoatRoughness={0}

          // Iridescence fakes "Chromatic Aberration / Dispersion" rainbow edges flawlessly in R3F natively
          iridescence={1}
          iridescenceIOR={1.5}
          iridescenceThicknessRange={[100, 400]}

          color="#ffffff"           // Keep base white for pure light transmission
        /> */}

        <meshPhysicalMaterial
          color="#ffffff"
                        transparent
                        opacity={0.18}
                        roughness={30}
                        metalness={0}
                        clearcoat={1}
                        clearcoatRoughness={0.05}
                        reflectivity={12}
                        side={THREE.DoubleSide}
        />
      </instancedMesh>
    </group>
  );
}

export function GlassGlobeShip() {

  const ship = useGLTF('/modals/jellyfish.glb');
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  useFrame(() => {
    if (!groupRef.current) return;
    const rawScroll = scrollStore.offset;

    // We want this in the "glassglob" section, which mathematically lands at the precise bottom
    // across the 6.45 page layout:
    // It starts entering the bottom of the screen at offset 0.78
    // It is perfectly dead-center when the user hits the bottom of the entire web page (offset 1.0)

    // Calculate vertical scroll progress from 0 (entering) to 1 (fully scrolled)
    const progress = Math.max(0, Math.min(1, (rawScroll - 0.78) / 0.22));

    // Map progress to absolute Viewport Height 
    // -viewport.height places it exactly just below the screen edge
    // 0 places it perfectly centered at the end of the scroll
    const targetY = THREE.MathUtils.lerp(-viewport.height * 1.2, 0, progress);

    const targetX = 0;
    const targetZ = -2;

    groupRef.current.position.set(
      THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.08),
      THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.08),
      THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.08)
    );
  });

  return (
    <group ref={groupRef} position={[0, -20, -2]} scale={1.0}>
      {/* Floating Ship in the center */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Center>
          <Clone object={ship.scene} scale={0.6} />
        </Center>
      </Float>

      {/* The Interactive Glass Globe */}
      <InstancesGlobe />
    </group>
  );
}

// Preload the spaceship model early
useGLTF.preload('/modals/jellyfish.glb');
