import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Float, useTexture, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import heroCircuit from "@/assets/hero-circuit.png";

const GOLDEN_COLOR = "#c1a35a";
const BRIGHT_GOLD = "#ffd700";
const DARK_BG = "#020202";

// Component for the floating energy particles (Data Packets)
const DataPackets = ({ count = 100 }) => {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 20;
      p[i * 3 + 1] = (Math.random() - 0.5) * 20;
      p[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    return p;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.position.z = (state.clock.elapsedTime * 0.2) % 2;
      pointsRef.current.rotation.z += 0.001;
    }
  });

  return (
    <Points ref={pointsRef} positions={points} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={BRIGHT_GOLD}
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

// Component for the layered circuit boards using the user's asset
const CircuitLayers = () => {
  const texture = useTexture(heroCircuit);
  const groupRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();

  useFrame(() => {
    if (groupRef.current) {
      // Smooth parallax effect
      const targetRotationX = -mouse.y * 0.15;
      const targetRotationY = mouse.x * 0.15;
      
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Deepest Layer */}
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh position={[0, 0, -4]}>
          <planeGeometry args={[30, 20]} />
          <meshBasicMaterial 
            map={texture} 
            transparent 
            opacity={0.05} 
            color={GOLDEN_COLOR} 
            blending={THREE.AdditiveBlending} 
          />
        </mesh>
      </Float>

      {/* Middle Layer */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
        <mesh position={[0, 0, -1.5]}>
          <planeGeometry args={[25, 18]} />
          <meshBasicMaterial 
            map={texture} 
            transparent 
            opacity={0.12} 
            color={GOLDEN_COLOR} 
            blending={THREE.AdditiveBlending} 
          />
        </mesh>
      </Float>

      {/* Front Layer - more contrast */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[20, 15]} />
          <meshBasicMaterial 
            map={texture} 
            transparent 
            opacity={0.25} 
            color={BRIGHT_GOLD} 
            blending={THREE.AdditiveBlending} 
            depthTest={false}
          />
        </mesh>
      </Float>
      
      <DataPackets count={150} />
    </group>
  );
};

export const ThreeCircuitBackground = () => {
  return (
    <div className="absolute inset-0 z-0 bg-[#020202] overflow-hidden">
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
        <fog attach="fog" args={[DARK_BG, 1, 10]} />
        
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color={BRIGHT_GOLD} />
        
        <Suspense fallback={null}>
          <CircuitLayers />
        </Suspense>
      </Canvas>
      
      {/* Iron Man HUD style Vignette & HUD lines via CSS */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
      <div className="absolute inset-0 pointer-events-none border-[1px] border-gold/5 m-4 rounded-3xl" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black" />
    </div>
  );
};

export default ThreeCircuitBackground;