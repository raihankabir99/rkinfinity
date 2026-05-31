import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Box } from '@react-three/drei';
import * as THREE from 'three';

const GOLDEN_COLOR = "#d4af37";
const BRIGHT_GOLD = "#ffdf00";
const DARK_BG = "#050505";

const CircuitTrace = ({ points, delay }: { points: THREE.Vector3[]; delay: number }) => {
  // Use straight lines with corners (Manhattan routing)
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0), [points]);
  const pulseRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (pulseRef.current) {
      const t = (state.clock.elapsedTime * 0.3 + delay) % 1;
      const pos = curve.getPointAt(t);
      pulseRef.current.position.copy(pos);
    }
  });

  return (
    <group>
      {/* Thinner, brighter metallic traces */}
      <mesh>
        <tubeGeometry args={[curve, 64, 0.008, 8, false]} />
        <meshStandardMaterial 
          color={GOLDEN_COLOR} 
          metalness={1} 
          roughness={0.1} 
          emissive={GOLDEN_COLOR} 
          emissiveIntensity={0.8} 
          transparent 
          opacity={0.8} 
        />
      </mesh>
      {/* Energy Pulse */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshBasicMaterial color={BRIGHT_GOLD} />
        <pointLight color={BRIGHT_GOLD} intensity={2} distance={1.2} />
      </mesh>
      {/* Nodes at joints */}
      {points.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color={BRIGHT_GOLD} />
        </mesh>
      ))}
    </group>
  );
};

const Motherboard = () => {
  const groupRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();

  const traces = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => {
      const x = Math.round((Math.random() - 0.5) * 10);
      const y = Math.round((Math.random() - 0.5) * 10);
      const z = (Math.random() - 0.5) * 0.5;
      
      // Create Manhattan-style routing (90 degree turns)
      const p1 = new THREE.Vector3(x, y, z);
      const p2 = new THREE.Vector3(x + (Math.random() > 0.5 ? 2 : -2), y, z);
      const p3 = new THREE.Vector3(p2.x, p2.y + (Math.random() > 0.5 ? 2 : -2), z);
      
      return {
        points: [p1, p2, p3],
        delay: Math.random()
      };
    });
  }, []);

  const chips = useMemo(() => {
    return Array.from({ length: 10 }).map((_, i) => ({
      pos: [
        Math.round((Math.random() - 0.5) * 8), 
        Math.round((Math.random() - 0.5) * 8), 
        (Math.random() - 0.5) * 0.2
      ],
      scale: [0.8, 0.8, 0.15]
    }));
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouse.y * 0.1, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.1, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Background Grid Structure */}
      <gridHelper args={[20, 20, GOLDEN_COLOR, "#111"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.5]} transparent opacity={0.05} />
      
      {traces.map((t, i) => <CircuitTrace key={i} {...t} />)}
      
      {chips.map((c, i) => (
        <Box key={i} position={c.pos as any} scale={c.scale as any}>
          <meshStandardMaterial 
            color="#0a0a0a" 
            metalness={1} 
            roughness={0.2} 
            emissive={GOLDEN_COLOR} 
            emissiveIntensity={0.3} 
          />
        </Box>
      ))}
    </group>
  );
};

export const ThreeCircuitBackground = () => {
  return (
    <div className="absolute inset-0 z-0 bg-black">
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={2.5} color={GOLDEN_COLOR} />
        <pointLight position={[-5, -5, 2]} intensity={1.5} color={BRIGHT_GOLD} />
        <Suspense fallback={null}>
          <Motherboard />
        </Suspense>
      </Canvas>
      {/* Vignette for luxury feel */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,black_90%)]" />
    </div>
  );
};

export default ThreeCircuitBackground;