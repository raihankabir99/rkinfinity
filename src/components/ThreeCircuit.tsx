import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

const BRIGHT_GOLD = "#ffdf00";

const getCircuitPaths = () => {
  const paths = [];

  // Path 1: Top-left tree structure
  paths.push({ points: [ new THREE.Vector3(-4.5, 2.5, 0), new THREE.Vector3(-3.5, 2.5, 0), new THREE.Vector3(-3, 3, 0), new THREE.Vector3(-2.8, 4, 0) ], delay: 0 });
  paths.push({ points: [ new THREE.Vector3(-3.5, 2.5, 0), new THREE.Vector3(-3.5, 1.5, 0) ], delay: 0.1 });
  paths.push({ points: [ new THREE.Vector3(-3, 3, 0), new THREE.Vector3(-2, 3, 0) ], delay: 0.2 });

  // Path 2: Central horizontal line with branches
  paths.push({ points: [ new THREE.Vector3(-2, 0, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(1.5, 0, 0) ], delay: 0.3 });
  paths.push({ points: [ new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -1, 0), new THREE.Vector3(-0.5, -1.5, 0) ], delay: 0.4 });

  // Path 3: Right side connections to chips
  paths.push({ points: [ new THREE.Vector3(4.5, 1, 0), new THREE.Vector3(2.5, 1, 0), new THREE.Vector3(2, 1.5, 0) ], delay: 0.5 });
  paths.push({ points: [ new THREE.Vector3(4.5, 0.5, 0), new THREE.Vector3(2.5, 0.5, 0), new THREE.Vector3(2, 1, 0) ], delay: 0.6 });
  paths.push({ points: [ new THREE.Vector3(2, 1.5, 0), new THREE.Vector3(1.5, 2.5, 0) ], delay: 0.7 });

  // Path 4: Top-right hub-like structures
  paths.push({ points: [ new THREE.Vector3(2.5, 3.5, 0), new THREE.Vector3(3.5, 3.5, 0) ], delay: 0.8 });
  paths.push({ points: [ new THREE.Vector3(3.5, 3.5, 0), new THREE.Vector3(4, 3, 0) ], delay: 0.9 });
  paths.push({ points: [ new THREE.Vector3(3.5, 3.5, 0), new THREE.Vector3(4, 4, 0) ], delay: 1.0 });

  // Path 5: Bottom-right tree
  paths.push({ points: [ new THREE.Vector3(4, -4.5, 0), new THREE.Vector3(4, -3, 0), new THREE.Vector3(3.5, -2.5, 0) ], delay: 1.1 });
  paths.push({ points: [ new THREE.Vector3(3, -4.5, 0), new THREE.Vector3(3.5, -4, 0), new THREE.Vector3(3.5, -2.5, 0) ], delay: 1.2 });

  // Path 6: Connection between gears on the left
  paths.push({ points: [ new THREE.Vector3(-1.5, -2.5, 0), new THREE.Vector3(-2.5, -3, 0), new THREE.Vector3(-2.5, -4, 0) ], delay: 1.3 });

  // Path 7: Long vertical line on the right
  paths.push({ points: [ new THREE.Vector3(4.5, 4.5, 0), new THREE.Vector3(4.5, -1, 0) ], delay: 1.4 });

  return paths;
};

const DataPulse = ({ points, delay }: { points: THREE.Vector3[]; delay: number }) => {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5), [points]);
  const pulseRef = useRef<THREE.Mesh>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (pulseRef.current && pointLightRef.current) {
      const elapsedTime = state.clock.elapsedTime;
      const animationProgress = (elapsedTime * 0.15 + delay) % 1;
      const pos = curve.getPointAt(animationProgress);
      pulseRef.current.position.copy(pos);
      pointLightRef.current.position.copy(pos);
      pointLightRef.current.intensity = 2.5 * (1 + Math.sin(animationProgress * Math.PI * 2));
    }
  });

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 100, 0.007, 8, false]} />
        <meshStandardMaterial color={BRIGHT_GOLD} emissive={BRIGHT_GOLD} emissiveIntensity={0.6} transparent opacity={0.25} />
      </mesh>
      <Sphere ref={pulseRef} args={[0.04, 16, 16]}>
        <meshBasicMaterial color={BRIGHT_GOLD} />
      </Sphere>
      <pointLight ref={pointLightRef} color={BRIGHT_GOLD} intensity={1.5} distance={1.5} />
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
        camera={{ position: [0, 0, 7], fov: 50 }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.15} color="#ffdf00" />
        <pointLight position={[-5, -5, -5]} intensity={0.4} color={BRIGHT_GOLD} />
        <pointLight position={[5, 5, 5]} intensity={0.4} color={BRIGHT_GOLD} />

        <Suspense fallback={null}>
          <CircuitOverlay />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ThreeCircuitBackground;
