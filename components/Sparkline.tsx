// A small dependency-free inline sparkline for table rows — recharts'
// ResponsiveContainer is unreliable at this size, so this is plain SVG.
// Drawn inverted: position 1 (best) plots high, larger numbers plot low.

export function Sparkline({
  values,
  width = 72,
  height = 24,
}: {
  values: (number | null)[];
  width?: number;
  height?: number;
}) {
  const known = values.filter((v): v is number => v != null);
  if (known.length < 2) {
    return (
      <span className="text-xs text-muted" aria-hidden>
        —
      </span>
    );
  }

  const max = Math.max(...known);
  const min = Math.min(...known);
  const span = Math.max(max - min, 1);
  const pad = 3;
  const stepX = (width - pad * 2) / (values.length - 1);

  const points: { x: number; y: number }[] = [];
  values.forEach((v, i) => {
    if (v == null) return;
    const x = pad + i * stepX;
    // Inverted: best (lowest number) near the top of the sparkline.
    const y = pad + ((v - min) / span) * (height - pad * 2);
    points.push({ x, y });
  });

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const last = points[points.length - 1];
  const first = points[0];
  const improved = last.y <= first.y; // lower y = better position

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Position trend"
    >
      <path d={path} fill="none" stroke={improved ? "#1E7A46" : "#B23A2E"} strokeWidth={1.5} />
      <circle cx={last.x} cy={last.y} r={2} fill={improved ? "#1E7A46" : "#B23A2E"} />
    </svg>
  );
}
