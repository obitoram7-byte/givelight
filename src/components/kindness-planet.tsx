"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh } from "three";

function Planet({ reducedMotion }: { reducedMotion: boolean }) {
  const globe = useRef<Mesh>(null);
  const orbit = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    if (globe.current) globe.current.rotation.y += delta * 0.09;
    if (orbit.current) orbit.current.rotation.z += delta * 0.045;
  });

  return (
    <>
      <ambientLight intensity={1.15} />
      <pointLight position={[3, 4, 4]} intensity={26} color="#ffe0a0" />
      <pointLight position={[-4, -2, -1]} intensity={8} color="#49b89b" />
      <Float speed={reducedMotion ? 0 : 1.15} rotationIntensity={reducedMotion ? 0 : 0.1} floatIntensity={reducedMotion ? 0 : 0.25}>
        <mesh ref={globe}>
          <sphereGeometry args={[1.4, 64, 64]} />
          <MeshDistortMaterial color="#176b57" roughness={0.48} metalness={0.13} distort={reducedMotion ? 0 : 0.16} speed={reducedMotion ? 0 : 1.2} />
        </mesh>
        <mesh ref={orbit} rotation={[1.12, 0.2, -0.25]}>
          <torusGeometry args={[1.72, 0.012, 12, 160]} />
          <meshBasicMaterial color="#f3bd60" transparent opacity={0.82} />
        </mesh>
        <mesh position={[0.79, 0.72, 0.82]}>
          <sphereGeometry args={[0.11, 24, 24]} />
          <meshBasicMaterial color="#ffcf72" />
        </mesh>
      </Float>
      <Sparkles count={58} scale={4.8} size={2.2} speed={reducedMotion ? 0 : 0.28} color="#ffe0a0" opacity={0.64} />
    </>
  );
}

export default function KindnessPlanet({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 5.7], fov: 34 }} gl={{ alpha: true, antialias: true }}>
      <Planet reducedMotion={reducedMotion} />
    </Canvas>
  );
}
