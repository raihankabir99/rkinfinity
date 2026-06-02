import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

const BRIGHT_GOLD = "#ffdf00";

// New, meticulously crafted paths to match the golden circuit image
const getCircuitPaths = () => {
  const paths = [];

  // Path 1: Main central artery from top to bottom-right
  paths.push({
    points: [
      new THREE.Vector3(0.5, 4.5, 0),
      new THREE.Vector3(0.8, 2.5, 0),
      new THREE.Vector3(1.5, 1.5, 0),
      new THREE.Vector3(3, 0.5, 0),
      new THREE.Vector3(4, -1, 0),
      new THREE.Vector3(4.5, -3, 0),
    ],
    delay: 0,
  });

  // Path 2: Left-side "tree" structure
  paths.push({
    points: [
      new THREE.Vector3(-4.5, 4, 0),
      new THREE.Vector3(-4, 2, 0),
      new THREE.Vector3(-3.5, 1, 0),
      new THREE.Vector3(-3, 0, 0),
      new THREE.Vector3(-3.5, -1.5, 0),
      new THREE.Vector3(-4, -4, 0),
    ],
    delay: 0.5,
  });

  // Path 3: Branching off the left tree
  paths.push({
    points: [
      new THREE.Vector3(-3.5, 1, 0),
      new THREE.Vector3(-2.5, 1.5, 0),
      new THREE.Vector3(-2, 2.5, 0),
    ],
    delay: 0.8,
  });

  // Path 4: Lower horizontal line connecting gears
  paths.push({
    points: [
      new THREE.Vector3(-2, -3, 0),
      new THREE.Vector3(0, -3, 0),
      new THREE.Vector3(2, -2.8, 0),
    ],
    delay: 1.2,
  });

  // Path 5: Top-right complex network
  paths.push({
    points: [
      new THREE.Vector3(4.5, 4.5, 0),
      new THREE.Vector3(4, 3.5, 0),
      new THREE.Vector3(3, 3, 0),
      new THREE.Vector3(2, 4, 0),
    ],
    delay: 1.8,
  });

  // Path 6: Connecting upper gears
  paths.push({
    points: [
        new THREE.Vector3(-1, 3.5, 0),
        new THREE.Vector3(0, 3.8, 0),
        new THREE.Vector3(1, 3.5, 0),
    ],
    delay: 2.5,
  });

  return paths;
};


const DataPulse = ({ points, delay }: { points: THREE.Vector3[]; delay: number }) => {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5), [points]);
  const pulseRef = useRef<THREE.Mesh>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (pulseRef.current && pointLightRef.current) {
      const elapsedTime = state.clock.elapsedTime;
      const animationProgress = (elapsedTime * 0.15 + delay) % 1.2; // Slowed down and offset
      const pos = curve.getPointAt(animationProgress > 1 ? 0 : animationProgress);
      pulseRef.current.position.copy(pos);
      pointLightRef.current.position.copy(pos);
      pointLightRef.current.intensity = 4 * (1 + Math.sin(animationProgress * Math.PI * 2));
    }
  });

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 128, 0.015, 8, false]} />
        <meshStandardMaterial color={BRIGHT_GOLD} emissive={BRIGHT_GOLD} emissiveIntensity={0.8} transparent opacity={0.3} />
      </mesh>
      <Sphere ref={pulseRef} args={[0.06, 16, 16]}>
        <meshBasicMaterial color={BRIGHT_GOLD} />
      </Sphere>
      <pointLight ref={pointLightRef} color={BRIGHT_GOLD} intensity={3} distance={2} />
    </group>
  );
};

const CircuitOverlay = () => {
  const groupRef = useRef<THREE.Group>(null);
  const { mouse, size } = useThree();

  const paths = useMemo(getCircuitPaths, []);

  useFrame(() => {
    if (groupRef.current) {
      const aspect = size.width / size.height;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouse.y * 0.05, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.05 * aspect, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      {paths.map((pathData, index) => (
        <DataPulse key={index} points={pathData.points} delay={pathData.delay} />
      ))}
    </group>
  );
};

export const ThreeCircuitBackground = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        gl={{ antialias: true, physicallyCorrectLights: true }}
        camera={{ position: [0, 0, 10], fov: 55 }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.25} color={BRIGHT_GOLD} />
        <pointLight position={[-10, -10, -5]} intensity={0.6} color={BRIGHT_GOLD} />
        <pointLight position={[10, 10, 5]} intensity={0.6} color={BRIGHT_GOLD} />

        <Suspense fallback={null}>
          <CircuitOverlay />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ThreeCircuitBackground;
