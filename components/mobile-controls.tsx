"use client";

import { useRef } from "react";

export const mobileInput = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  run: false,
  jump: false,
  lookX: 0,
  lookY: 0,
};

export function MobileControls() {
  const joystick = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLDivElement>(null);
  const pointer = useRef<number | null>(null);

  const reset = () => {
    pointer.current = null;
    mobileInput.forward = false;
    mobileInput.backward = false;
    mobileInput.left = false;
    mobileInput.right = false;

    if (knob.current) {
      knob.current.style.transform = "translate(-50%, -50%)";
    }
  };

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!joystick.current || pointer.current !== e.pointerId) return;

    const rect = joystick.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    let x = e.clientX - cx;
    let y = e.clientY - cy;

    const max = rect.width * 0.32;
    const length = Math.hypot(x, y);

    if (length > max) {
      x = (x / length) * max;
      y = (y / length) * max;
    }

    if (knob.current) {
      knob.current.style.transform =
        `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    }

    mobileInput.forward = y < -15;
    mobileInput.backward = y > 15;
    mobileInput.left = x < -15;
    mobileInput.right = x > 15;
  };

  return (
    <div className="absolute inset-0 z-20 md:hidden">
      <div
        ref={joystick}
        className="absolute bottom-8 left-8 h-28 w-28 touch-none rounded-full border-2 border-black/40 bg-black/10"
        onPointerDown={(e) => {
          pointer.current = e.pointerId;
          e.currentTarget.setPointerCapture(e.pointerId);
          move(e);
        }}
        onPointerMove={move}
        onPointerUp={reset}
        onPointerCancel={reset}
      >
        <div
          ref={knob}
          className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-black/60 bg-black/20"
        />
      </div>

      <button
        className="absolute bottom-10 right-8 flex h-16 w-16 items-center justify-center rounded-full border-2 border-black/60 bg-black/10 text-xs font-black text-black active:scale-90"
        onPointerDown={() => (mobileInput.jump = true)}
        onPointerUp={() => (mobileInput.jump = false)}
        onPointerCancel={() => (mobileInput.jump = false)}
      >
        JUMP
      </button>
    </div>
  );
}