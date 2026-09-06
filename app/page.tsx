import Experience from "@/components/experience";

const controls = [
  ["WASD", "Move"],
  ["SHIFT", "Run"],
  ["SPACE", "Jump"],
  ["MOUSE", "Look"],
];

export default function Page() {
  return (
    <main className="relative h-screen overflow-hidden">
      <Experience />

    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center text-black">
        <b>CONTROLS</b>

        <div className="mt-4 space-y-1 text-sm">
          {controls.map(([key, action]) => (
            <div key={key}>
              <b>{key}</b> — {action}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}