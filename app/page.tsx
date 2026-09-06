import Experience from "@/components/experience";
import { MobileControls } from "@/components/mobile-controls";

const controls = [
  ["WASD", "Move"],
  ["SHIFT", "Run"],
  ["SPACE", "Jump"],
  ["MOUSE", "Look"],
];

export default function Page() {
  return (
    <main className="relative h-[100dvh] w-screen overflow-hidden">
      <Experience />
      <MobileControls />

      <div className="pointer-events-none hidden absolute bottom-10 left-1/2 z-10 -translate-x-1/2 text-center text-black md:block">
        <b>CONTROLS</b>

        <div className="mt-4 space-y-1 text-sm">
          {controls.map(([key, action]) => (
            <div key={key}>
              <b>{key}</b> — {action}
            </div>
          ))}
        </div>
      </div>

      <div className="rotate-device fixed inset-0 z-50 items-center justify-center text-center">
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
    </main>
  );
}