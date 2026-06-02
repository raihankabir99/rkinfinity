import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

const ELECTRIC_GREEN = "#39ff14"; // Neon Green for a "Matrix" feel

// A completely new, highly detailed set of paths meticulously mapped from the user's image.
const getCircuitPaths = () => {
  const paths = [];

  // Path 1: Top-left, curving around "Hi," text.
  paths.push({
    points: [
      new THREE.Vector3(-1.8, 4.0, 0),
      new THREE.Vector3(-2.8, 3.8, 0),
      new THREE.Vector3(-3.8, 2.5, 0),
      new THREE.Vector3(-4.2, 1, 0),
      new THREE.Vector3(-4, -1.5, 0),
    ],
    delay: 0,
  });

  // Path 2: Long, prominent line on the right side.
  paths.push({
    points: [
      new THREE.Vector3(4.8, 4.5, 0),
      new THREE.Vector3(4.7, 1, 0),
      new THREE.Vector3(3.5, 0, 0),
      new THREE.Vector3(3.3, -1.5, 0),
      new THREE.Vector3(4, -2.8, 0),
      new THREE.Vector3(3.5, -4.2, 0),
    ],
    delay: 0.8,
  });

  // Path 3: Under "Digita" text, connecting to the lower right chip.
  paths.push({
    points: [
      new THREE.Vector3(0.5, -3.8, 0),
      new THREE.Vector3(1.5, -3.9, 0),
      new THREE.Vector3(2.8, -3.5, 0),
      new THREE.Vector3(3.4, -2.5, 0),
    ],
    delay: 1.5,
  });

  // Path 4: Above "I'm RK", curving down.
  paths.push({
    points: [
      new THREE.Vector3(0.8, 3.9, 0),
      new THREE.Vector3(2, 4.2, 0),
      new THREE.Vector3(2.9, 3.5, 0),
      new THREE.Vector3(3.3, 2.5, 0),
      new THREE.Vector3(3.3, 1.5, 0),
    ],
    delay: 2.2,
  });

  // Path 5: Bottom-left corner, going up.
  paths.push({
    points: [
        new THREE.Vector3(-4.8, -4.5, 0),
        new THREE.Vector3(-4.7, -3, 0),
        new THREE.Vector3(-4, -2.2, 0),
        new THREE.Vector3(-3, -2, 0),
    ],
    delay: 3.0,
  });

  // Path 6: Small connector line on the middle left, branching from path 1.
  paths.push({
      points: [
          new THREE.Vector3(-4.2, 1, 0),
          new THREE.Vector3(-3.5, 1.1, 0),
          new THREE.Vector3(-2.5, 0.8, 0),
      ],
      delay: 0.2,
  });

    // Path 7: Top-middle faint line
    paths.push({
        points: [
            new THREE.Vector3(0, 4.5, 0),
            new THREE.Vector3(0.5, 3.5, 0),
            new THREE.Vector3(0, 2.5, 0),
        ],
        delay: 4.0,
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
      // Adjusted animation speed for a more energetic flow
      const animationProgress = (elapsedTime * 0.12 + delay) % 1;
      const pos = curve.getPointAt(animationProgress);
      pulseRef.current.position.copy(pos);
      pointLightRef.current.position.copy(pos);
      pointLightRef.current.intensity = 3.0 * (1 + Math.sin(animationProgress * Math.PI * 2));
    }
  });

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 100, 0.01, 8, false]} />
        <meshStandardMaterial color={ELECTRIC_GREEN} emissive={ELECTRIC_GREEN} emissiveIntensity={0.6} transparent opacity={0.35} />
      </mesh>
      <Sphere ref={pulseRef} args={[0.05, 16, 16]}>
        <meshBasicMaterial color={ELECTRIC_GREEN} />
      </Sphere>
      <pointLight ref={pointLightRef} color={ELECTRIC_GREEN} intensity={2} distance={2} />
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
        // Adjusted camera for better view
        camera={{ position: [0, 0, 9], fov: 60 }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.2} color={ELECTRIC_GREEN} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color={ELECTRIC_GREEN} />
        <pointLight position={[5, 5, 5]} intensity={0.5} color={ELECTRIC_GREEN} />

        <Suspense fallback={null}>
          <CircuitOverlay />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ThreeCircuitBackground;
