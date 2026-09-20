
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Room, Callbacks } from "@colyseus/sdk";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";

type PlayerData = {
  x: number;
  y: number;
  z: number;
  qx: number;
  qy: number;
  qz: number;
  qw: number;
  name: string;
  animation: string;
};

function lerpAngle(a: number, b: number, t: number) {
  const diff = THREE.MathUtils.euclideanModulo(
    b - a + Math.PI,
    Math.PI * 2
  ) - Math.PI;

  return a + diff * t;
}

function RemotePlayer({ player }: { player: PlayerData }) {
  const { scene, animations } = useGLTF("/models/Soldier_comp.glb");
  const model = useRef<THREE.Group>(null);
  const mixer = useRef<THREE.AnimationMixer | null>(null);
  const actions = useRef<Record<string, THREE.AnimationAction>>({});
  const current = useRef("");
  const target = useRef(new THREE.Vector3());
    const targetQuaternion = useRef(new THREE.Quaternion());
    const currentQuaternion = useRef(new THREE.Quaternion());

  const cloned = useMemo(() => clone(scene), [scene]);

  useEffect(() => {
    const m = new THREE.AnimationMixer(cloned);
    mixer.current = m;

    const find = (name: string) =>
      animations.find((a) =>
        a.name.toLowerCase().includes(name.toLowerCase())
      );

    for (const name of ["Idle", "Walk", "Run", "Jump"]) {
      const clip = find(name);
      if (clip) actions.current[name] = m.clipAction(clip);
    }

    actions.current.Idle?.reset().fadeIn(0.1).play();
    current.current = "Idle";

    return () => {
      m.stopAllAction();
      m.uncacheRoot(cloned);
      mixer.current = null;
      actions.current = {};
    };
  }, [animations, cloned]);

  useFrame((_, delta) => {
    if (!model.current) return;

    const animation = player.animation || "Idle";

    if (animation !== current.current) {
      const next =
        actions.current[animation] ||
        actions.current.Idle;

      if (next) {
        actions.current[current.current]?.fadeOut(0.15);
        next.reset().fadeIn(0.15).play();
      }

      current.current = animation;
    }

    target.current.set(player.x, player.y, player.z);

    const alpha = 1 - Math.exp(-15 * delta);

    model.current.position.lerp(target.current, alpha);

    model.current.rotation.x = 0;
    model.current.rotation.z = 0;

    targetQuaternion.current.set(
        player.qx,
        player.qy,
        player.qz,
        player.qw
    );

    model.current.quaternion.slerp(
    targetQuaternion.current,
    1 - Math.exp(-15 * delta)
    );

    mixer.current?.update(delta);
  });

  return <primitive ref={model} object={cloned} />;
}

export default function RemotePlayers({ room }: { room: Room | null }) {
  const players = useRef(new Map<string, PlayerData>());
  const [, render] = useState(0);

    useEffect(() => {
        if (!room) return;

        const callbacks = Callbacks.get(room);
        const refresh = () => render((v) => v + 1);

        callbacks.onAdd("players", (player, sessionId) => {
            const id = String(sessionId);

            if (id === room.sessionId) return;

            players.current.set(id, player as PlayerData);
            refresh();
        });

        callbacks.onRemove("players", (_, sessionId) => {
            const id = String(sessionId);

            players.current.delete(id);
            refresh();
        });

        return () => {
            players.current.clear();
        };
    }, [room]);

  return (
    <>
      {Array.from(players.current.entries()).map(([id, player]) => (
        <RemotePlayer key={id} player={player} />
      ))}
    </>
  );
}

useGLTF.preload("/models/Soldier_comp.glb");