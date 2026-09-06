"use client";

import {
  forwardRef,
  useEffect,
  useRef,
} from "react";
import { useFrame } from "@react-three/fiber";
import {
  useAnimations,
  useGLTF,
  useKeyboardControls,
} from "@react-three/drei";
import * as THREE from "three";

const UP = new THREE.Vector3(0, 1, 0);
const FORWARD = new THREE.Vector3(0, 0, -1);

export const WalkableCharacter = forwardRef<THREE.Group>(
  function WalkableCharacter(_, ref) {
    const group = useRef<THREE.Group>(null);

    const { scene, animations } = useGLTF("/models/Soldier.glb");
    const { actions } = useAnimations(animations, group);
    const [, getKeys] = useKeyboardControls();

    const currentAction = useRef("Idle");

    useEffect(() => {
      actions.Idle?.reset().fadeIn(0.2).play();
    }, [actions]);

    useFrame(({ camera }, delta) => {
      if (!group.current) return;

      const { forward, backward, left, right, run } = getKeys();

      const x = Number(right) - Number(left);
      const z = Number(backward) - Number(forward);

      const moving = x !== 0 || z !== 0;

      const nextAction = moving
        ? run
          ? "Run"
          : "Walk"
        : "Idle";

      if (nextAction !== currentAction.current) {
        actions[currentAction.current]?.fadeOut(0.2);
        actions[nextAction]?.reset().fadeIn(0.2).play();
        currentAction.current = nextAction;
      }

      if (!moving) return;

      const cameraDirection = new THREE.Vector3();
      const direction = new THREE.Vector3();

      camera.getWorldDirection(cameraDirection);
      cameraDirection.y = 0;
      cameraDirection.normalize();

      const rightDirection = new THREE.Vector3()
        .crossVectors(cameraDirection, UP)
        .normalize();

      direction
        .addScaledVector(cameraDirection, -z)
        .addScaledVector(rightDirection, x)
        .normalize();

      const rotation = new THREE.Quaternion().setFromUnitVectors(
        FORWARD,
        direction
      );

      group.current.quaternion.rotateTowards(
        rotation,
        delta * 10
      );

      group.current.position.addScaledVector(
        direction,
        (run ? 5 : 2) * delta
      );
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
  }
);

useGLTF.preload("/models/Soldier.glb");