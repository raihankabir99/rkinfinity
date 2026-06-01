import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

const BRIGHT_GOLD = "#ffdf00";

const getCircuitPaths = () => {
  const paths = [];
  // Example Path 1 (Top Left Area)
  paths.push({
    points: [
      new THREE.Vector3(-5, 4, 0),
      new THREE.Vector3(-3, 4, 0),
      new THREE.Vector3(-3, 2, 0),
      new THREE.Vector3(-1, 2, 0),
    ],
    delay: 0,
  });
  // Example Path 2 (Middle Area)
  paths.push({
    points: [
      new THREE.Vector3(-2, 0, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(2, 0, 0),
      new THREE.Vector3(2, -2, 0),
      new THREE.Vector3(4, -2, 0),
    ],
    delay: 0.5,
  });
  // Example Path 3 (Bottom Right Area)
  paths.push({
    points: [
      new THREE.Vector3(3, -3, 0),
      new THREE.Vector3(5, -3, 0),
      new THREE.Vector3(5, -5, 0),
    ],
    delay: 1,
  });
   // Example Path 4 (Vertical path near center)
   paths.push({
    points: [
      new THREE.Vector3(0, 3, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(0, -3, 0),
    ],
    delay: 0.2,
  });
  // Example Path 5 (Diagonal path)
  paths.push({
    points: [
      new THREE.Vector3(-4, -4, 0),
      new THREE.Vector3(-2, -2, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(2, 2, 0),
      new THREE.Vector3(4, 4, 0),
    ],
    delay: 0.8,
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
      const animationProgress = (elapsedTime * 0.2 + delay) % 1;
      const pos = curve.getPointAt(animationProgress);
      pulseRef.current.position.copy(pos);
      pointLightRef.current.position.copy(pos);
      pointLightRef.current.intensity = 2.5 * (1 + Math.sin(animationProgress * Math.PI * 2));
    }
  });

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 100, 0.005, 8, false]} />
        <meshStandardMaterial color={BRIGHT_GOLD} emissive={BRIGHT_GOLD} emissiveIntensity={0.8} transparent opacity={0.3} />
      </mesh>
      <Sphere ref={pulseRef} args={[0.03, 16, 16]}>
        <meshBasicMaterial color={BRIGHT_GOLD} />
      </Sphere>
      <pointLight ref={pointLightRef} color={BRIGHT_GOLD} intensity={1.5} distance={1.5} />
    </group>
  );
};

const CircuitOverlay = () => {
  const groupRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();

  const paths = useMemo(getCircuitPaths, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouse.y * 0.03, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.03, 0.05);
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
        camera={{ position: [0, 0, 5], fov: 45 }} 
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.2} color="#ffdf00" />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color={BRIGHT_GOLD} />
        <pointLight position={[5, 5, 5]} intensity={0.5} color={BRIGHT_GOLD} />
        
        <Suspense fallback={null}>
          <CircuitOverlay />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ThreeCircuitBackground;
