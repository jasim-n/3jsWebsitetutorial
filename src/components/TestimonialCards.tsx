import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { scrollStore } from '../scrollStore';

const TESTIMONIALS = [
  { company: "Red Bull",   text: "\"The entire Noomo team have been an\nexceptional and trusted creative partner in\nshaping our global digital products. Their\ndedication to listening, iterating, and\npushing for the best possible experience\nmakes them invaluable collaborators. I\nhave full confidence in their technical and\ncreative expertise to deliver time and time\nagain.\"", author: "DAVID GRAU\nDirector Global Product Design & Research" },
  { company: "Salesforce", text: "\"I've been very impressed with how the\nNoomo team has worked quickly to\nimmerse themselves in the narrative of our\nproducts...\"",                                         author: "JONNY FRUITS\nSr. Creative Director" },
  { company: "AMD",        text: "\"Noomo does such incredible and\nthoughtful work. I have been at this almost\n25 years and have never been more\nimpressed with an agency.\"",                                        author: "WALLIS MILLS\nDirector of Marketing" },
  { company: "coinbase",   text: "\"Noomo demonstrates an abundance of\ncreativity and ambition when it comes to\ncomplex Web3 projects.\"",                                                                                 author: "ERIC DAVIES\nSenior Producer" },
  { company: "Intel",      text: "\"Their innovative use of WebGL at AWS\nre:Invent created an experience that truly\nshowcased what modern web can do.\"",                                                               author: "TEAM INTEL\nAI Experience" },
];

const N = TESTIMONIALS.length;
const CARD_W = 2.8;
const CARD_H = 3.9;
const CARD_D = 0.12;           // Card thickness
const SPACING = CARD_W + 0.6;
const TOTAL_W = SPACING * N;
const AMPLITUDE = 0.6;         // Vertical sine wave height
const FREQUENCY = 0.35;        // Sine wave frequency

const textProps = {
  font: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf",
  color: "#222222",
  anchorX: "left" as const,
  anchorY: "top" as const,
};

export function TestimonialCards() {
  const groupRef = useRef<THREE.Group>(null);
  const cardsRef = useRef<(THREE.Group | null)[]>([]);

  useFrame(() => {
    if (!groupRef.current) return;

    // Use shared scroll.offset (0.8 to 1.0 is the testimonials page)
    const rawScroll = scrollStore.offset;
    const vis = Math.max(0, Math.min(1, (rawScroll - 0.7) / 0.3));

    // Slide entire group into position
    const targetX = THREE.MathUtils.lerp(12, 0, vis);
    const targetY = THREE.MathUtils.lerp(-10, 0, vis);
    const targetZ = THREE.MathUtils.lerp(-4, -0.5, vis);
    groupRef.current.position.set(
      THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.08),
      THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.08),
      THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.08)
    );

    // Calculate how far through the section we are to drive the carousel exactly
    const sectionProgress = Math.max(0, Math.min(1, (rawScroll - 0.8) / 0.2));
    const smoothOffset = sectionProgress * TOTAL_W * 1.5; // Scroll speed multiplier
    
    // Position cards on sine wave track
    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      let rx = (i * SPACING - smoothOffset + TOTAL_W * 2) % TOTAL_W;
      const centeredX = rx - TOTAL_W / 2;
      
      const y = Math.sin(centeredX * FREQUENCY) * AMPLITUDE;

      card.position.x = centeredX;
      card.position.y = y;

      // Card tilt: rotate slightly on Y to show thickness, and Z to follow sine slope
      const slope = AMPLITUDE * FREQUENCY * Math.cos(centeredX * FREQUENCY);
      card.rotation.z = -Math.atan(slope) * 0.4;
      // Slight perspective tilt based on distance from center
      card.rotation.y = centeredX * 0.08;
    });
  });

  const hw = CARD_W / 2;
  const hh = CARD_H / 2;
  const PAD_X = 0.3;
  const PAD_Y = 0.3;

  return (
    <group ref={groupRef} position={[12, -10, -4]}>
      {/* Background text */}
      <Text
        position={[0, 0.5, -2.5]}
        fontSize={2.5}
        color="#d0d0d0"
        fontWeight={900}
        maxWidth={16}
        lineHeight={0.88}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        letterSpacing={-0.03}
      >
        GREAT WORK{"\n"}CAN'T HAPPEN{"\n"}WITHOUT TEAM A.
      </Text>

      {TESTIMONIALS.map((td, i) => (
        <group key={i} ref={(el) => { cardsRef.current[i] = el; }}>
          
          {/* Thick 3D Beveled Glass Card */}
          <RoundedBox args={[CARD_W, CARD_H, CARD_D]} radius={0.06} smoothness={5}>
            <MeshTransmissionMaterial
              backside
              backsideThickness={0.1}
              thickness={CARD_D}
              chromaticAberration={0.03}
              anisotropy={0.1}
              distortion={0.0}
              distortionScale={0.0}
              temporalDistortion={0.0}
              ior={1.2}
              color="#ffffff"
              roughness={0.18}
              clearcoat={1}
              clearcoatRoughness={0.05}
              transmission={0.55}
              transparent={true}
              opacity={1}
            />
          </RoundedBox>

          {/* Text content slightly in front of the card face */}
          <group position={[0, 0, CARD_D / 2 + 0.015]}>
            {/* Logo/Company header */}
            <Text
              {...textProps}
              position={[-hw + PAD_X, hh - PAD_Y, 0]}
              fontSize={0.24}
              fontWeight={900}
              letterSpacing={-0.03}
              color="#000000"
            >
              {td.company}
            </Text>

            {/* Quotation text */}
            <Text
              {...textProps}
              position={[-hw + PAD_X, hh - PAD_Y - 0.5, 0]}
              fontSize={0.11}
              fontWeight={400}
              maxWidth={CARD_W - PAD_X * 2}
              lineHeight={1.4}
              color="#2a2a2a"
              letterSpacing={-0.01}
            >
              {td.text}
            </Text>

            {/* Author details */}
            <Text
              {...textProps}
              position={[-hw + PAD_X, -hh + PAD_Y + 0.25, 0]}
              fontSize={0.08}
              fontWeight={700}
              color="#000000"
              letterSpacing={-0.01}
            >
              {td.author.split('\n')[0]}
            </Text>
            <Text
              {...textProps}
              position={[-hw + PAD_X, -hh + PAD_Y + 0.1, 0]}
              fontSize={0.08}
              fontWeight={400}
              color="#666666"
              letterSpacing={-0.01}
            >
              {td.author.split('\n')[1]}
            </Text>
          </group>
        </group>
      ))}
    </group>
  );
}
