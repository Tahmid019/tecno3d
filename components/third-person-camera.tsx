"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface ThirdPersonCameraProps {
  target: React.RefObject<THREE.Group | null>;
}

export function ThirdPersonCamera({
  target,
}: ThirdPersonCameraProps) {
  const { gl } = useThree();

  const yaw = useRef(0);
  const pitch = useRef(-0.2);

  const targetPosition = useRef(new THREE.Vector3());
  const cameraPosition = useRef(new THREE.Vector3());

  useEffect(() => {
    const element = gl.domElement;

    const onMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== element) return;

      yaw.current -= event.movementX * 0.002;
      pitch.current -= event.movementY * 0.002;

      pitch.current = THREE.MathUtils.clamp(
        pitch.current,
        -0.8,
        0.5
      );
    };

    const onClick = () => {
      element.requestPointerLock();
    };

    element.addEventListener("click", onClick);
    document.addEventListener("mousemove", onMouseMove);

    return () => {
      element.removeEventListener("click", onClick);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [gl]);

  useFrame(({ camera }, delta) => {
    if (!target.current) return;

    targetPosition.current.copy(target.current.position);
    targetPosition.current.y += 1.5;

    const distance = 6;

    const offset = new THREE.Vector3(
      Math.sin(yaw.current) * Math.cos(pitch.current),
      Math.sin(pitch.current),
      Math.cos(yaw.current) * Math.cos(pitch.current)
    ).multiplyScalar(distance);

    cameraPosition.current
      .copy(targetPosition.current)
      .add(offset);

    camera.position.lerp(
      cameraPosition.current,
      1 - Math.exp(-8 * delta)
    );

    camera.lookAt(targetPosition.current);
  });

  return null;
}