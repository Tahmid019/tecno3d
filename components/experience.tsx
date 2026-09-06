"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  KeyboardControls,
  Environment,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";

import { WalkableCharacter } from "./character";
import { ThirdPersonCamera } from "./third-person-camera";

const map = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "backward", keys: ["KeyS", "ArrowDown"] },
  { name: "left", keys: ["KeyA", "ArrowLeft"] },
  { name: "right", keys: ["KeyD", "ArrowRight"] },
  { name: "run", keys: ["ShiftLeft", "ShiftRight"] },
];

function GrassFloor() {
  const texture = useTexture("/textures/sand.jpg");

  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(20, 20);

  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

export default function Experience() {
  const character = useRef<THREE.Group>(null);

  return (
    <KeyboardControls map={map}>
      <Canvas
        shadows
        camera={{ position: [0, 3, 6], fov: 50 }}
      >
        <ambientLight intensity={1} />

        <directionalLight
          position={[10, 15, 10]}
          intensity={2}
          castShadow
        />

        <WalkableCharacter ref={character} />

        <ThirdPersonCamera target={character} />

        <GrassFloor />

        <Environment preset="sunset" />
      </Canvas>
    </KeyboardControls>
  );
}