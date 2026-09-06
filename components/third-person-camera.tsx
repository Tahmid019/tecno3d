"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  target: React.RefObject<THREE.Group | null>;
}

export function ThirdPersonCamera({ target }: Props) {
  const { gl } = useThree();

  const yaw = useRef(0);
  const pitch = useRef(-0.2);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const targetPosition = useRef(new THREE.Vector3());
  const cameraPosition = useRef(new THREE.Vector3());

  useEffect(() => {
    const element = gl.domElement;

    const rotate = (dx: number, dy: number) => {
      yaw.current -= dx * 0.005;
      pitch.current += dy * 0.005;

      pitch.current = THREE.MathUtils.clamp(
        pitch.current,
        -0.5,
        0.5
      );
    };

    const mouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== element) return;
      rotate(e.movementX, e.movementY);
    };

    const mouseDown = () => {
      if (window.matchMedia("(pointer: fine)").matches) {
        element.requestPointerLock();
      }
    };

    const touchStart = (e: TouchEvent) => {
      const touchPoint = e.touches[0];

      if (touchPoint.clientX < window.innerWidth / 2) return;

      touch.current = {
        x: touchPoint.clientX,
        y: touchPoint.clientY,
      };
    };

    const touchMove = (e: TouchEvent) => {
      if (!touch.current) return;

      const touchPoint = e.touches[0];
      const dx = touchPoint.clientX - touch.current.x;
      const dy = touchPoint.clientY - touch.current.y;

      rotate(dx, dy);

      touch.current = {
        x: touchPoint.clientX,
        y: touchPoint.clientY,
      };
    };

    const touchEnd = () => {
      touch.current = null;
    };

    element.addEventListener("click", mouseDown);
    document.addEventListener("mousemove", mouseMove);

    element.addEventListener("touchstart", touchStart, { passive: true });
    element.addEventListener("touchmove", touchMove, { passive: true });
    element.addEventListener("touchend", touchEnd);

    return () => {
      element.removeEventListener("click", mouseDown);
      document.removeEventListener("mousemove", mouseMove);
      element.removeEventListener("touchstart", touchStart);
      element.removeEventListener("touchmove", touchMove);
      element.removeEventListener("touchend", touchEnd);
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

    cameraPosition.current.y = Math.max(
      cameraPosition.current.y,
      0.5
    );

    camera.position.lerp(
      cameraPosition.current,
      1 - Math.exp(-8 * delta)
    );

    camera.lookAt(targetPosition.current);
  });

  return null;
}