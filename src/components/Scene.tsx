import { GlassCarousel } from './GlassCarousel';
import { TestimonialCards } from './TestimonialCards';
import { OceanShip } from './OceanShip';
import { GlassGlobeShip } from './GlassGlobeShip';

export default function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <OceanShip />
      <GlassCarousel />
      <TestimonialCards />
      <GlassGlobeShip />
    </>
  );
}
