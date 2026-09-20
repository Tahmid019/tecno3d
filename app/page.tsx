
"use client";

import { useEffect, useState } from "react";
import Experience from "@/components/experience";
import { MobileControls } from "@/components/mobile-controls";

const controls = [
  ["WASD", "Move"],
  ["SHIFT", "Run"],
  ["SPACE", "Jump"],
  ["MOUSE", "Look"],
];

export default function Page() {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    checkOrientation();

    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener(
        "orientationchange",
        checkOrientation
      );
    };
  }, []);

  return (
    <main className="relative h-[100dvh] w-screen overflow-hidden bg-black">
      {/* 3D WORLD */}
      <div className="absolute inset-0 z-0">
        <Experience />
      </div>

      {/* MOBILE CONTROLS */}
      <MobileControls />

      {/* DESKTOP CONTROLS */}
      <div className="pointer-events-none absolute bottom-10 left-1/2 z-10 hidden -translate-x-1/2 text-center text-black lg:block">
        <b>CONTROLS</b>

        <div className="mt-4 space-y-1 text-sm">
          {controls.map(([key, action]) => (
            <div key={key}>
              <b>{key}</b> — {action}
            </div>
          ))}
        </div>
      </div>

      {/* PORTRAIT ORIENTATION OVERLAY */}
      {isPortrait && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black px-6 text-center text-white md:hidden">
          <div>
            <div className="text-5xl">↻</div>

            <h2 className="mt-4 text-xl font-bold">
              Rotate your device
            </h2>

            <p className="mt-2 text-sm text-white/60">
              Please rotate to landscape mode
            </p>
          </div>
        </div>
      )}
    </main>
  );
}