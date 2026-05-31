import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const BRIGHT_GOLD = "#ffdf00";

const DataPulse = ({ points, delay }: { points: THREE.Vector3[]; delay: number }) => {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0), [points]);
  const pulseRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (pulseRef.current) {
      const t = (state.clock.elapsedTime * 0.25 + delay) % 1;
      const pos = curve.getPointAt(t);
      pulseRef.current.position.copy(pos);
    }
  });

  return (
    <mesh ref={pulseRef}>
      <sphereGeometry args={[0.03, 16, 16]} />
      <meshBasicMaterial color={BRIGHT_GOLD} transparent opacity={0.9} />
      <pointLight color={BRIGHT_GOLD} intensity={2.5} distance={1.5} decay={2} />
    </mesh>
  );
};

const PulseNetwork = () => {
  const groupRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();

  const pulses = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => {
      const x = (Math.random() - 0.5) * 14;
      const y = (Math.random() - 0.5) * 14;
      const z = (Math.random() - 0.5) * 0.5;
      
      const p1 = new THREE.Vector3(x, y, z);
      const p2 = new THREE.Vector3(x + (Math.random() > 0.5 ? 4 : -4), y, z);
      const p3 = new THREE.Vector3(p2.x, p2.y + (Math.random() > 0.5 ? 4 : -4), z);
      
      return {
        points: [p1, p2, p3],
        delay: Math.random()
      };
    });
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouse.y * 0.08, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.08, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      {pulses.map((p, i) => <DataPulse key={i} {...p} />)}
    </group>
  );
};

export const ThreeCircuitBackground = () => {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      <Canvas dpr={[1, 2]} alpha={true}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
        <ambientLight intensity={0.2} />
        <Suspense fallback={null}>
          <PulseNetwork />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ThreeCircuitBackground;