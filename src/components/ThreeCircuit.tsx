import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

// Force re-deploy
const BRIGHT_GOLD = "#ffdf00";

// New, more detailed paths based on the image
const getCircuitPaths = () => {
  const paths = [];

  // 1. Main artery on the right side
  paths.push({
    points: [
      new THREE.Vector3(4.5, 4, 0),
      new THREE.Vector3(4.5, 1, 0),
      new THREE.Vector3(3, 0, 0),
      new THREE.Vector3(3, -2, 0),
      new THREE.Vector3(4, -3, 0),
    ],
    delay: 0,
  });

  // 2. Top-left tree structure
  paths.push({
    points: [
      new THREE.Vector3(-4.5, -1, 0),
      new THREE.Vector3(-4.5, 2, 0),
      new THREE.Vector3(-3.5, 3, 0),
      new THREE.Vector3(-3, 3.5, 0),
    ],
    delay: 0.5,
  });
  // Branch of top-left tree
  paths.push({
    points: [
      new THREE.Vector3(-4.5, 1, 0),
      new THREE.Vector3(-3.5, 1, 0),
    ],
    delay: 0.6,
  });

  // 3. Central horizontal line connecting to gears
  paths.push({
    points: [
      new THREE.Vector3(-2.5, 2, 0),
      new THREE.Vector3(0, 2, 0),
      new THREE.Vector3(1, 2.5, 0),
    ],
    delay: 1.0,
  });

  // 4. Bottom-right structure
  paths.push({
    points: [
      new THREE.Vector3(1, -4, 0),
      new THREE.Vector3(2.5, -4, 0),
      new THREE.Vector3(3.5, -3, 0),
    ],
    delay: 1.5,
  });

   // 5. Connection to the central chip on the right
   paths.push({
    points: [
      new THREE.Vector3(2, 0.5, 0),
      new THREE.Vector3(1, 0.5, 0),
      new THREE.Vector3(1, -0.5, 0),
      new THREE.Vector3(2, -0.5, 0),
    ],
    delay: 2.0,
  });

  // 6. From bottom-left corner upwards
  paths.push({
    points: [
      new THREE.Vector3(-4.5, -4.5, 0),
      new THREE.Vector3(-4.5, -3, 0),
      new THREE.Vector3(-3.5, -2, 0),
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
      // Slower animation speed
      const animationProgress = (elapsedTime * 0.1 + delay) % 1;
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
        // Adjusted camera for better view
        camera={{ position: [0, 0, 9], fov: 60 }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.15} color="#ffdf00" />
        <pointLight position={[-5, -5, -5]} intensity={0.4} color={BRIGHT_GOLD} />
        <pointLight position={[5, 5, 5]} intensity={0.4} color={BRIGHT_GOLD} />

        <Suspense fallback={null)>
          <CircuitOverlay />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ThreeCircuitBackground;
