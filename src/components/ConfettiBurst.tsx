"use client";

const COLORS = ["#0C831F", "#F8CB46", "#FF6B6B", "#4D96FF", "#FFA94D"];

export default function ConfettiBurst() {
  const pieces = Array.from({ length: 40 }, (_, i) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 0.4;
    const duration = 1.6 + Math.random() * 0.8;
    const rotate = Math.random() * 360;
    const color = COLORS[i % COLORS.length];
    return { id: i, left, delay, duration, rotate, color };
  });

  return (
    <div className="pointer-events-none fixed inset-0 z-[110] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-[-10px] block h-2.5 w-1.5 rounded-sm"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}
