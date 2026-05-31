tsx
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, PerspectiveCamera, Fog, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';

const GOLDEN_COLOR = "#c1a35a";
const DEEP_GOLD = "#8a6d2b";
const DARK_BG = "#0a0a0a";

interface CircuitPathProps {
  points: THREE.Vector3[];
  delay: number;
}

const CircuitPath = ({ points, delay }: CircuitPathProps) => {
  const lineRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  
  useFrame((state) => {
    if (pulseRef.current) {
      const t = (state.clock.elapsedTime * 0.2 + delay) % 1;
      const pos = curve.getPointAt(t);
      pulseRef.current.position.copy(pos);
    }
  });

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 64, 0.005, 8, false]} />
        <meshStandardMaterial color={GOLDEN_COLOR} transparent opacity={0.2} />
      </mesh>
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshBasicMaterial color={GOLDEN_COLOR} />
        <pointLight color={GOLDEN_COLOR} intensity={0.5} distance={0.5} />
      </mesh>
    </group>
  );
};

const MotherboardLayer = ({ z }: { z: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const paths = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => {
      const startX = (Math.random() - 0.5) * 10;
      const startY = (Math.random() - 0.5) * 10;
      const points = [
        new THREE.Vector3(startX, startY, z),
        new THREE.Vector3(startX + Math.random(), startY + Math.random(), z),
        new THREE.Vector3(startX + Math.random() * 2, startY - Math.random(), z),
      ];
      return { points, delay: Math.random() };
    });
  }, [z]);

  return (
    <group>
      <mesh ref={meshRef} position={[0, 0, z - 0.01]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial 
          color="#050505" 
          transparent 
          opacity={0.1} 
          metalness={0.9} 
          roughness={0.1} 
        />
      </mesh>
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
      const targetRotationX = -mouse.y * 0.15;
      const targetRotationY = mouse.x * 0.15;
      
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotationX,
        0.05
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotationY,
        0.05
      );
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color={GOLDEN_COLOR} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color={DEEP_GOLD} />
      
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <MotherboardLayer z={0} />
      </Float>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
        <MotherboardLayer z={-1} />
      </Float>
      <Float speed={1} rotationIntensity={0.05} floatIntensity={0.2}>
        <MotherboardLayer z={-2} />
      </Float>

      <mesh position={[0, 0, -5]} rotation={[0, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color={DARK_BG} />
      </mesh>
    </group>
  );
};

export const ThreeCircuitBackground = () => {
  return (
    <div className="absolute inset-0 z-0 bg-[#050505]">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
        <fog attach="fog" args={[DARK_BG, 2, 10]} />
        <Scene />
      </Canvas>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-[#050505]" />
    </div>
  );
};

export default ThreeCircuitBackground;