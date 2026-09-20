
"use client";


import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { KeyboardControls, Environment, useTexture } from "@react-three/drei";
import { Room } from "@colyseus/sdk";
import * as THREE from "three";
import { WalkableCharacter } from "./character";
import { ThirdPersonCamera } from "./third-person-camera";
import { joinCampus, leaveCampus, getRoom } from "@/lib/multiplayer";
import RemotePlayers from "./remote-player";
import { CharacterState } from "./character";

const map = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "backward", keys: ["KeyS", "ArrowDown"] },
  { name: "left", keys: ["KeyA", "ArrowLeft"] },
  { name: "right", keys: ["KeyD", "ArrowRight"] },
  { name: "run", keys: ["ShiftLeft", "ShiftRight"] },
  { name: "jump", keys: ["Space"] },
];

type Props = {
  target: React.RefObject<THREE.Group | null>;
  room: Room | null;
  characterState: React.MutableRefObject<CharacterState>;
};


function Floor() {
  const texture = useTexture("/textures/sand.webp");

  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(20, 20);

  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

export function MultiplayerSync({
  target,
  room,
  characterState,
}: Props) {
  const timer = useRef(0);

  useFrame((_, delta) => {
    if (!target.current || !room) return;

    timer.current += delta;

    if (timer.current < 1 / 30) return;
    timer.current = 0;

    const p = target.current.position;
    const s = characterState.current;

    room.send("move", {
      x: p.x,
      y: p.y,
      z: p.z,
      qx: target.current.quaternion.x,
      qy: target.current.quaternion.y,
      qz: target.current.quaternion.z,
      qw: target.current.quaternion.w,
      animation: s.animation,
    });
  });

  return null;
}

export default function Experience() {
  const character = useRef<THREE.Group>(null);  
  const characterState = useRef<CharacterState>({
    animation: "Idle",
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
  });

  const [room, setRoom] = useState<Room | null>(null);

  useEffect(() => {
    let active = true;

    joinCampus()
      .then((joinedRoom) => {
        if (active) setRoom(joinedRoom);
      })
      .catch(console.error);

    return () => {
      active = false;
      leaveCampus().catch(console.error);
    };
  }, []);

  return (
    <div className="h-full w-full">
      <KeyboardControls map={map}>
        <Canvas
          shadows
          className="h-full w-full"
          dpr={[1, 1.5]}
          camera={{ position: [0, 3, 6], fov: 50 }}
        >
          <ambientLight intensity={1} />
          <directionalLight position={[10, 15, 10]} intensity={2} castShadow />

          <WalkableCharacter ref={character} stateRef={characterState} />

          <RemotePlayers room={room} />

          <ThirdPersonCamera target={character} />

          <MultiplayerSync target={character} room={room} characterState={characterState} />

          <Floor />
          <Environment preset="sunset" />
        </Canvas>
      </KeyboardControls>
    </div>
  );
}