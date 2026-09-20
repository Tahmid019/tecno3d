
"use client";

import { useCallback, useEffect, useRef } from "react";

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

  const resetJoystick = useCallback(() => {
    pointer.current = null;

    mobileInput.forward = false;
    mobileInput.backward = false;
    mobileInput.left = false;
    mobileInput.right = false;

    if (knob.current) {
      knob.current.style.transform =
        "translate(-50%, -50%)";
    }
  }, []);

  // Calculate joystick position
  const move = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (
        !joystick.current ||
        pointer.current !== e.pointerId
      ) {
        return;
      }

      const rect = joystick.current.getBoundingClientRect();

      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      let x = e.clientX - cx;
      let y = e.clientY - cy;

      const max = rect.width * 0.32;
      const length = Math.hypot(x, y);

      if (length > max && length > 0) {
        x = (x / length) * max;
        y = (y / length) * max;
      }

      if (knob.current) {
        knob.current.style.transform =
          `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
      }

      // Deadzone
      const deadzone = 10;

      mobileInput.forward = y < -deadzone;
      mobileInput.backward = y > deadzone;
      mobileInput.left = x < -deadzone;
      mobileInput.right = x > deadzone;
    },
    []
  );

  // Start joystick
  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (pointer.current !== null) return;

    e.preventDefault();

    pointer.current = e.pointerId;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      console.log("Browser Error A1")
    }

    move(e);
  };

  // End joystick
  const handlePointerUp = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (pointer.current !== e.pointerId) return;

    resetJoystick();
  };

  // Reset if pointer is interrupted
  useEffect(() => {
    const handleWindowBlur = () => {
      resetJoystick();
      mobileInput.jump = false;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        resetJoystick();
        mobileInput.jump = false;
      }
    };

    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [resetJoystick]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100] block lg:hidden"
      style={{
        touchAction: "none",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* JOYSTICK */}
      <div
        ref={joystick}
        className="pointer-events-auto absolute bottom-8 left-8 h-32 w-32 touch-none select-none rounded-full border-2 border-black/40 bg-black/10"
        style={{
          touchAction: "none",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={move}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onLostPointerCapture={resetJoystick}
      >
        <div
          ref={knob}
          className="pointer-events-none absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-black/60 bg-black/20"
        />
      </div>

      {/* JUMP BUTTON */}
      <button
        type="button"
        aria-label="Jump"
        className="pointer-events-auto absolute bottom-10 right-8 flex h-16 w-16 select-none items-center justify-center rounded-full border-2 border-black/60 bg-black/10 text-xs font-black text-black active:scale-90"
        style={{
          touchAction: "none",
        }}
        onPointerDown={(e) => {
          e.preventDefault();
          mobileInput.jump = true;
        }}
        onPointerUp={() => {
          mobileInput.jump = false;
        }}
        onPointerCancel={() => {
          mobileInput.jump = false;
        }}
        onPointerLeave={() => {
          mobileInput.jump = false;
        }}
      >
        JUMP
      </button>
    </div>
  );
}