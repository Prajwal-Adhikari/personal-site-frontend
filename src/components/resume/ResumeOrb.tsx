import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

type ResumeOrbProps = {
  color: string;
};

const SpinningTorus: React.FC<ResumeOrbProps> = ({ color }) => {
  const meshRef = React.useRef<THREE.Mesh | null>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += delta * 0.4;
    meshRef.current.rotation.y += delta * 0.3;
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1, 0.3, 128, 32]} />
      <meshStandardMaterial color={color} metalness={0.6} roughness={0.25} />
    </mesh>
  );
};

const ResumeOrb: React.FC<ResumeOrbProps> = ({ color }) => {
  return (
    <div className="resume-orb-container">
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[4, 4, 4]} intensity={0.9} />
        <SpinningTorus color={color} />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
};

export default ResumeOrb;
