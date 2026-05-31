import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, PerspectiveCamera, Instances, Instance, Stars } from '@react-three/drei';
import * as THREE from 'three';

const GOLDEN_COLOR = "#c1a35a";
const BRIGHT_GOLD = "#ffd700";
const DARK_BG = "#050505";

interface CircuitPathProps {
  points: THREE.Vector3[];
  delay: number;
}

const CircuitPath = ({ points, delay }: CircuitPathProps) => {
  const pulseRef = useRef<THREE.Mesh>(null);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  
  useFrame((state) => {
    if (pulseRef.current) {
      const t = (state.clock.elapsedTime * 0.15 + delay) % 1;
      const pos = curve.getPointAt(t);
      pulseRef.current.position.copy(pos);
    }
  });

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 32, 0.012, 8, false]} />
        <meshStandardMaterial 
          color={GOLDEN_COLOR} 
          metalness={1} 
          roughness={0.2} 
          transparent 
          opacity={0.4} 
        />
      </mesh>
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshBasicMaterial color={BRIGHT_GOLD} />
        <pointLight color={BRIGHT_GOLD} intensity={1.5} distance={1} />
      </mesh>
    </group>
  );
};

const MotherboardLayer = ({ z, count = 12 }: { z: number; count?: number }) => {
  const paths = useMemo(() => {
    return Array.from({ length: count }).map(() => {
      const startX = (Math.random() - 0.5) * 12;
      const startY = (Math.random() - 0.5) * 12;
      const points = [
        new THREE.Vector3(startX, startY, z),
        new THREE.Vector3(startX + (Math.random() - 0.5) * 4, startY + (Math.random() - 0.5) * 4, z),
        new THREE.Vector3(startX + (Math.random() - 0.5) * 6, startY + (Math.random() - 0.5) * 6, z),
      ];
      return { points, delay: Math.random() };
    });
  }, [z, count]);

  const chips = useMemo(() => {
    return Array.from({ length: 8 }).map(() => ({
      position: [(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, z + 0.05] as [number, number, number],
      scale: [Math.random() * 0.5 + 0.2, Math.random() * 0.5 + 0.2, 0.1] as [number, number, number]
    }));
  }, [z]);

  return (
    <group>
      {/* Base Plane for the layer */}
      <mesh position={[0, 0, z]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#020202" transparent opacity={0.2} metalness={1} roughness={0} />
      </mesh>

      {/* 3D Chips */}
      {chips.map((chip, i) => (
        <mesh key={i} position={chip.position} scale={chip.scale}>
          <boxGeometry />
          <meshStandardMaterial color="#0a0a0a" metalness={0.8} roughness={0.2} />
          <lineSegments>
            <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry()]} />
            <lineBasicMaterial attach="material" color={GOLDEN_COLOR} linewidth={1} />
          </lineSegments>
        </mesh>
      ))}

      {paths.map((path, idx) => (
        <CircuitPath key={idx} points={path.points} delay={path.delay} />
      ))}
    </group>
  );
};

const Scene = () => {
  const groupRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();

  useFrame(() => {
    if (groupRef.current) {
      const targetRotationX = -mouse.y * 0.25;
      const targetRotationY = mouse.x * 0.25;
      
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.1} />
      <pointLight position={[5, 5, 5]} intensity={2} color={GOLDEN_COLOR} />
      <pointLight position={[-5, -5, 2]} intensity={1} color={BRIGHT_GOLD} />
      
      {/* Glowing Grid Base */}
      <gridHelper args={[40, 40, GOLDEN_COLOR, "#111"]} position={[0, 0, -4]} rotation={[Math.PI / 2, 0, 0]} transparent opacity={0.05} />

      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.6}>
        <MotherboardLayer z={0} count={20} />
      </Float>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
        <MotherboardLayer z={-1.5} count={15} />
      </Float>
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
        <MotherboardLayer z={-3} count={10} />
      </Float>

      <mesh position={[0, 0, -8]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#000" />
      </mesh>
    </group>
  );
};

export const ThreeCircuitBackground = () => {
  return (
    <div className="absolute inset-0 z-0 bg-[#020202]">
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={55} />
        <fog attach="fog" args={[DARK_BG, 1, 15]} />
        <Scene />
      </Canvas>
      {/* Overlay gradient for UI readability */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/20 via-transparent to-[#050505]" />
    </div>
  );
};

export default ThreeCircuitBackground;