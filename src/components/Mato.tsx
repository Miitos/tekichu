import { useRef } from 'react';
import type { Shot } from '../types';

// Rayons des anneaux de la mato kasumi (36 cm), en proportion du rayon extérieur.
const RINGS: [number][] = [[1], [0.8167], [0.65], [0.5667], [0.4], [0.2]];
const VIEW = 1.55;

type Props = {
  shots: Shot[];
  numbered?: boolean;
  label: string;
  /** Un toucher : nouvelle flèche à cette position. */
  onTap?: (x: number, y: number) => void;
  /** Glisser : déplace la dernière flèche. */
  onMove?: (x: number, y: number) => void;
};

export function Mato({ shots, numbered, label, onTap, onMove }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const interactive = !!onTap;
  const placed = shots.map((s, i) => ({ s, i })).filter((p) => p.s.x !== undefined && p.s.y !== undefined);
  const last = shots.length > 0 ? shots[shots.length - 1] : undefined;

  function local(e: React.PointerEvent): { x: number; y: number } | null {
    const svg = ref.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    const clamp = (v: number) => Math.max(-VIEW * 1.6, Math.min(VIEW * 1.6, v));
    return { x: Math.round(clamp(p.x) * 1000) / 1000, y: Math.round(clamp(p.y) * 1000) / 1000 };
  }

  function down(e: React.PointerEvent) {
    const p = local(e);
    if (!p || !onTap) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    const nearLast = last && last.x !== undefined && last.y !== undefined && Math.hypot(p.x - last.x, p.y - last.y) < 0.24;
    if (!nearLast) onTap(p.x, p.y);
  }

  function move(e: React.PointerEvent) {
    if (!dragging.current || !onMove) return;
    const p = local(e);
    if (p) onMove(p.x, p.y);
  }

  const up = () => {
    dragging.current = false;
  };

  const r = numbered ? 0.115 : 0.075;
  return (
    <svg
      ref={ref}
      role="img"
      aria-label={label}
      viewBox={`${-VIEW} ${-VIEW} ${VIEW * 2} ${VIEW * 2}`}
      preserveAspectRatio="xMidYMid meet"
      onPointerDown={interactive ? down : undefined}
      onPointerMove={interactive ? move : undefined}
      onPointerUp={interactive ? up : undefined}
      onPointerCancel={interactive ? up : undefined}
    >
      {RINGS.map(([rad], n) => (
        <circle key={rad} cx={0} cy={0} r={rad} className={n % 2 === 0 ? 'ring-a' : 'ring-b'} />
      ))}
      {placed.map(({ s, i }) => {
        const isLast = interactive && i === shots.length - 1;
        return (
          <g key={i}>
            {isLast && <circle className="halo" cx={s.x} cy={s.y} r={0.24} strokeWidth={0.015} strokeDasharray="0.04 0.04" />}
            {isLast && <circle className="ripple" cx={s.x} cy={s.y} r={0.24} strokeWidth={0.03} />}
            <circle className={interactive ? 'impact' : undefined} cx={s.x} cy={s.y} r={r} fill="var(--impact)" stroke="var(--mato-b)" strokeWidth={numbered ? 0.025 : 0.02} />
            {numbered && (
              <text x={s.x} y={(s.y ?? 0) + 0.045} textAnchor="middle" fontSize={0.13} fontWeight={600} fill="#FFFFFF" fontFamily="Inter, sans-serif">
                {i + 1}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
