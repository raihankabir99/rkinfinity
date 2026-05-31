import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Float, Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const GOLDEN_COLOR = "#d4af37";
const BRIGHT_GOLD = "#ffdf00";
const DARK_BG = "#050505";

const CircuitTrace = ({ points, delay }: { points: THREE.Vector3[]; delay: number }) => {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  const pulseRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (pulseRef.current) {
      const t = (state.clock.elapsedTime * 0.4 + delay) % 1;
      const pos = curve.getPointAt(t);
      pulseRef.current.position.copy(pos);
    }
  });

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 70, 0.012, 8, false]} />
        <meshStandardMaterial color={GOLDEN_COLOR} metalness={1} roughness={0.1} emissive={GOLDEN_COLOR} emissiveIntensity={0.5} transparent opacity={0.6} />
      </mesh>
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshBasicMaterial color={BRIGHT_GOLD} />
        <pointLight color={BRIGHT_GOLD} intensity={1.5} distance={1} />
      </mesh>
    </group>
  );
};

const Motherboard = () => {
  const groupRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();

  const traces = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => {
      const startX = (Math.random() - 0.5) * 15;
      const startY = (Math.random() - 0.5) * 15;
      const z = (Math.random() - 0.5) * 2;
      return {
        points: [
          new THREE.Vector3(startX, startY, z),
          new THREE.Vector3(startX + (Math.random() - 0.5) * 5, startY + (Math.random() - 0.5) * 5, z),
          new THREE.Vector3(startX + (Math.random() - 0.5) * 10, startY + (Math.random() - 0.5) * 10, z),
        ],
        delay: Math.random()
      };
    });
  }, []);

  const chips = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      pos: [(Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 1.5],
      scale: [Math.random() + 0.5, Math.random() + 0.5, 0.2]
    }));
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouse.y * 0.2, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.2, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      {traces.map((t, i) => <CircuitTrace key={i} {...t} />)}
      {chips.map((c, i) => (
        <Box key={i} position={c.pos as any} scale={c.scale as any}>
          <meshStandardMaterial color="#111" metalness={1} roughness={0.2} emissive={GOLDEN_COLOR} emissiveIntensity={0.2} />
        </Box>
      ))}
    </group>
  );
};

export const ThreeCircuitBackground = () => {
  return (
    <div className="absolute inset-0 z-0 bg-[#000]">
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color={GOLDEN_COLOR} />
        <pointLight position={[-10, -10, 5]} intensity={1} color={BRIGHT_GOLD} />
        <Suspense fallback={null}>
          <Motherboard />
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black" />
    </div>
  );
};

export default ThreeCircuitBackground;
