import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Float, Stars, Box, Line } from '@react-three/drei';
import * as THREE from 'three';

const GOLDEN_COLOR = "#c1a35a";
const BRIGHT_GOLD = "#ffd700";
const DARK_BG = "#050505";

// Component to render individual 3D circuit traces with moving energy pulses
const CircuitTrace = ({ points, delay }: { points: THREE.Vector3[]; delay: number }) => {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  const pulseRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (pulseRef.current) {
      // Animate the pulseRef mesh along the curve
      const t = (state.clock.elapsedTime * 0.3 + delay) % 1;
      const pos = curve.getPointAt(t);
      pulseRef.current.position.copy(pos);
    }
  });

  return (
    <group>
      {/* The Physical Trace */}
      <mesh>
        <tubeGeometry args={[curve, 32, 0.006, 8, false]} />
        <meshStandardMaterial color={GOLDEN_COLOR} metalness={1} roughness={0.3} transparent opacity={0.3} />
      </mesh>
      
      {/* The Energy Pulse - Small glowing golden sphere */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.018, 16, 16]} />
        <meshBasicMaterial color={BRIGHT_GOLD} />
        <pointLight color={BRIGHT_GOLD} intensity={0.8} distance={0.4} />
      </mesh>
    </group>
  );
};

// Component for floating 3D microchips with glowing edges
const Chip = ({ position, scale = [1, 1, 1] }: { position: [number, number, number]; scale?: [number, number, number] }) => {
  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.4} position={position}>
      <Box args={[0.6 * scale[0], 0.6 * scale[1], 0.15 * scale[2]]}>
        <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} />
      </Box>
      {/* Golden Glowing Edges */}
      <Box args={[0.62 * scale[0], 0.62 * scale[1], 0.02 * scale[2]]}>
        <meshBasicMaterial color={GOLDEN_COLOR} transparent opacity={0.4} />
      </Box>
      <pointLight position={[0, 0, 0.1]} color={GOLDEN_COLOR} intensity={0.3} distance={1} />
    </Float>
  );
};

// Main Motherboard structure
const Motherboard = () => {
  const traces = useMemo(() => {
    return Array.from({ length: 45 }).map((_, i) => {
      const startX = (Math.random() - 0.5) * 14;
      const startY = (Math.random() - 0.5) * 14;
      const z = (Math.random() - 0.5) * 1.5;
      
      const points = [
        new THREE.Vector3(startX, startY, z),
        new THREE.Vector3(startX + (Math.random() - 0.5) * 3, startY + (Math.random() - 0.5) * 3, z),
        new THREE.Vector3(startX + (Math.random() - 0.5) * 6, startY + (Math.random() - 0.5) * 6, z),
      ];
      return { points, delay: Math.random() };
    });
  }, []);

  // Grid lines representing background circuit paths
  const gridLines = useMemo(() => {
    const lines = [];
    for (let i = -10; i <= 10; i += 2) {
      lines.push(
        <Line 
          key={`h-${i}`}
          points={[[-15, i, -2], [15, i, -2]]} 
          color={GOLDEN_COLOR} 
          lineWidth={0.5} 
          transparent 
          opacity={0.05} 
        />
      );
      lines.push(
        <Line 
          key={`v-${i}`}
          points={[[i, -15, -2], [i, 15, -2]]} 
          color={GOLDEN_COLOR} 
          lineWidth={0.5} 
          transparent 
          opacity={0.05} 
        />
      );
    }
    return lines;
  }, []);

  return (
    <group>
      {/* Passive Grid */}
      {gridLines}

      {/* Active Data Flow Traces */}
      {traces.map((t, i) => (
        <CircuitTrace key={i} points={t.points} delay={t.delay} />
      ))}

      {/* Integrated Components */}
      <Chip position={[3, 2, 0.5]} scale={[1.2, 1.2, 1]} />
      <Chip position={[-4, -1, -0.5]} scale={[0.8, 0.8, 1]} />
      <Chip position={[1, -3, 0.2]} scale={[1.5, 1, 1]} />
      <Chip position={[-2, 3.5, 0.8]} scale={[0.5, 0.5, 1]} />
    </group>
  );
};

const Scene = () => {
  const boardRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();

  useFrame(() => {
    if (boardRef.current) {
      // Smooth Parallax Interaction
      const targetRotationX = -mouse.y * 0.25;
      const targetRotationY = mouse.x * 0.25;
      boardRef.current.rotation.x = THREE.MathUtils.lerp(boardRef.current.rotation.x, targetRotationX, 0.04);
      boardRef.current.rotation.y = THREE.MathUtils.lerp(boardRef.current.rotation.y, targetRotationY, 0.04);
    }
  });

  return (
    <>
      <ambientLight intensity={0.25} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color={GOLDEN_COLOR} />
      <pointLight position={[-10, -10, 5]} intensity={0.5} color={BRIGHT_GOLD} />
      
      <group ref={boardRef}>
        <Motherboard />
      </group>

      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
    </>
  );
};

export const ThreeCircuitBackground = () => {
  return (
    <div className="absolute inset-0 z-0 bg-[#050505] overflow-hidden pointer-events-none">
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 7]} fov={50} />
        <fog attach="fog" args={[DARK_BG, 5, 18]} />
        
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      
      {/* Premium UI Overlay Layers */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505]" />
    </div>
  );
};

export default ThreeCircuitBackground;