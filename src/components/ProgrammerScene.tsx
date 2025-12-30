import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  Float,
  OrbitControls,
  RoundedBox,
} from '@react-three/drei';

const BubbleProgrammer: React.FC = () => {
  return (
    <group position={[0, -0.6, 0]} rotation={[0, Math.PI / 12, 0]}>
      <RoundedBox
        args={[1.4, 1.6, 1]}
        radius={0.42}
        smoothness={8}
        position={[0, -0.05, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#ffe44d"
          roughness={0.32}
          metalness={0.12}
        />
      </RoundedBox>

      <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.75, 48, 48]} />
        <meshStandardMaterial color="#ffe76b" roughness={0.25} metalness={0.1} />
      </mesh>

      <mesh position={[0.26, 1.07, 0.55]}>
        <sphereGeometry args={[0.09, 24, 24]} />
        <meshStandardMaterial color="#0c0c0c" />
      </mesh>
      <mesh position={[-0.26, 1.07, 0.55]}>
        <sphereGeometry args={[0.09, 24, 24]} />
        <meshStandardMaterial color="#0c0c0c" />
      </mesh>
      <mesh position={[0, 0.9, 0.58]} rotation={[0, 0, Math.PI * 0.04]}>
        <torusGeometry args={[0.14, 0.03, 12, 32, Math.PI]} />
        <meshStandardMaterial color="#0c0c0c" />
      </mesh>

      <mesh
        position={[0.95, 0.1, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <capsuleGeometry args={[0.12, 0.65, 10, 18]} />
        <meshStandardMaterial color="#ffe76b" roughness={0.35} />
      </mesh>
      <mesh
        position={[-0.95, 0.1, 0]}
        rotation={[0, 0, -Math.PI / 2]}
        castShadow
      >
        <capsuleGeometry args={[0.12, 0.65, 10, 18]} />
        <meshStandardMaterial color="#ffe76b" roughness={0.35} />
      </mesh>

      <mesh position={[0.45, -0.8, 0]} castShadow>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial color="#f6d13a" />
      </mesh>
      <mesh position={[-0.45, -0.8, 0]} castShadow>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial color="#f6d13a" />
      </mesh>

      <group position={[0, -0.4, 0.75]} rotation={[-0.12, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1, 0.65, 0.08]} />
          <meshStandardMaterial
            color="#0b0b0b"
            roughness={0.55}
            emissive="#00eaff"
            emissiveIntensity={0.35}
          />
        </mesh>
        <mesh position={[0, 0.12, -0.05]}>
          <boxGeometry args={[0.32, 0.08, 0.04]} />
          <meshStandardMaterial color="#111" emissive="#36cfc9" />
        </mesh>
        <mesh position={[0.18, -0.14, -0.04]}>
          <boxGeometry args={[0.08, 0.06, 0.04]} />
          <meshStandardMaterial color="#111" emissive="#22d3ee" />
        </mesh>
      </group>

      <mesh position={[0.6, 1.4, -0.5]} castShadow>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#fff7d1" emissive="#fffbeb" />
      </mesh>
      <mesh position={[-0.7, 1.6, 0.5]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#fff7d1" emissive="#fef08a" />
      </mesh>
    </group>
  );
};

const ProgrammerScene: React.FC = () => {
  return (
    <div className="hero-visual">
      <Canvas camera={{ position: [0, 1.1, 4.2], fov: 40 }} shadows>
        <Suspense fallback={null}>
          <color attach="background" args={['#050505']} />
          <hemisphereLight intensity={0.55} groundColor="#0b0b0b" />
          <spotLight
            position={[6, 8, 4]}
            angle={0.4}
            penumbra={0.5}
            intensity={1.6}
            castShadow
          />
          <spotLight position={[-6, 4, -2]} intensity={0.65} color="#8ab4ff" />

          <Float floatIntensity={1.1} rotationIntensity={0.55}>
            <BubbleProgrammer />
          </Float>

          <ContactShadows
            position={[0, -1.4, 0]}
            opacity={0.45}
            scale={9}
            blur={3}
            far={2.8}
          />
          <Environment preset="city" />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={(2 * Math.PI) / 3}
            autoRotate
            autoRotateSpeed={0.45}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ProgrammerScene;
