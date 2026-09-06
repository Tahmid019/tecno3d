"use client";

import { forwardRef, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF, useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";

const UP = new THREE.Vector3(0, 1, 0);
const FORWARD = new THREE.Vector3(0, 0, -1);
const GRAVITY = -20, JUMP_FORCE = 8, GROUND_Y = 0;

export const WalkableCharacter = forwardRef<THREE.Group>(function WalkableCharacter(_, ref) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/Soldier.glb");
  const { actions } = useAnimations(animations, group);
  const [, getKeys] = useKeyboardControls();

  const current = useRef("Idle");
  const velocityY = useRef(0);
  const grounded = useRef(true);
  const jumpLocked = useRef(false);

  useEffect(() => {
    actions.Idle?.reset().fadeIn(0.2).play();
  }, [actions]);

  useFrame(({ camera }, delta) => {
    if (!group.current) return;

    const { forward, backward, left, right, run, jump } = getKeys();

    if (jump && grounded.current && !jumpLocked.current) {
      velocityY.current = JUMP_FORCE;
      grounded.current = false;
      jumpLocked.current = true;
    }

    if (!jump) jumpLocked.current = false;

    if (!grounded.current) {
      velocityY.current += GRAVITY * delta;
      group.current.position.y += velocityY.current * delta;

      if (group.current.position.y <= GROUND_Y) {
        group.current.position.y = GROUND_Y;
        velocityY.current = 0;
        grounded.current = true;
      }
    }

    const x = Number(right) - Number(left);
    const z = Number(backward) - Number(forward);
    const moving = x !== 0 || z !== 0;

    const next = !grounded.current ? "Jump" : moving ? run ? "Run" : "Walk" : "Idle";

    if (next !== current.current) {
      actions[current.current]?.fadeOut(0.15);
      actions[next]?.reset().fadeIn(0.15).play();
      current.current = next;
    }

    if (!moving) return;

    const cameraDir = new THREE.Vector3();
    const direction = new THREE.Vector3();

    camera.getWorldDirection(cameraDir);
    cameraDir.y = 0;
    cameraDir.normalize();

    const rightDir = new THREE.Vector3().crossVectors(cameraDir, UP).normalize();

    direction
      .addScaledVector(cameraDir, -z)
      .addScaledVector(rightDir, x)
      .normalize();

    const rotation = new THREE.Quaternion().setFromUnitVectors(FORWARD, direction);

    group.current.quaternion.rotateTowards(rotation, delta * 10);
    group.current.position.addScaledVector(direction, (run ? 5 : 2) * delta);
  });

  return (
    <primitive
      ref={(node: THREE.Group | null) => {
        group.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      object={scene}
    />
  );
});

useGLTF.preload("/models/Soldier.glb");