"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

/* ── Blob config ─────────────────────────────────────────────────────────────
   Each blob is a morphing organic shape (bezier through oscillating vertices)
   that also drifts slowly around the canvas. Canvas blur makes them blend.
─────────────────────────────────────────────────────────────────────────── */
const BLOBS = [
  {
    // Gold — large, top-left
    cx: 0.05, cy: 0.05,
    mxSpeed: 0.00022, mySpeed: 0.00018, mxRange: 0.22, myRange: 0.18, mxPhase: 0.0, myPhase: 1.2,
    baseRadius: 560,
    r: 234, g: 179, b: 8, opacity: 0.30,
  },
  {
    // Deep orange — right side
    cx: 0.90, cy: 0.45,
    mxSpeed: 0.00018, mySpeed: 0.00025, mxRange: 0.18, myRange: 0.25, mxPhase: 2.1, myPhase: 0.8,
    baseRadius: 500,
    r: 251, g: 100, b: 20, opacity: 0.25,
  },
  {
    // Crimson — bottom
    cx: 0.55, cy: 0.95,
    mxSpeed: 0.00025, mySpeed: 0.00015, mxRange: 0.28, myRange: 0.18, mxPhase: 3.5, myPhase: 2.0,
    baseRadius: 530,
    r: 200, g: 20, b: 20, opacity: 0.28,
  },
  {
    // Rose/magenta — center left
    cx: 0.15, cy: 0.65,
    mxSpeed: 0.00020, mySpeed: 0.00022, mxRange: 0.20, myRange: 0.22, mxPhase: 1.8, myPhase: 3.3,
    baseRadius: 420,
    r: 220, g: 38, b: 120, opacity: 0.20,
  },
  {
    // Warm purple — top right
    cx: 0.82, cy: 0.08,
    mxSpeed: 0.00030, mySpeed: 0.00020, mxRange: 0.16, myRange: 0.20, mxPhase: 4.2, myPhase: 1.5,
    baseRadius: 400,
    r: 160, g: 40, b: 220, opacity: 0.18,
  },
  {
    // Amber — bottom left
    cx: 0.08, cy: 0.88,
    mxSpeed: 0.00016, mySpeed: 0.00019, mxRange: 0.18, myRange: 0.15, mxPhase: 5.0, myPhase: 0.3,
    baseRadius: 460,
    r: 234, g: 150, b: 8, opacity: 0.22,
  },
];

const NUM_POINTS   = 8;    // vertices per blob (more = more organic)
const MORPH_SPEED  = 0.07; // how fast blobs morph shape (lower = slower/smoother)
const CANVAS_BLUR  = 90;   // px — CSS blur applied to canvas

export function GradientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Pre-generate per-blob per-point oscillation params so they're stable
    const blobParams = BLOBS.map(() =>
      Array.from({ length: NUM_POINTS }, (_, i) => ({
        speed: MORPH_SPEED * (0.6 + Math.random() * 0.8),
        phase: (i / NUM_POINTS) * Math.PI * 2 + Math.random() * 0.5,
        amp:   0.18 + Math.random() * 0.28,   // how much each vertex stretches
      }))
    );

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    let animId: number;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);
      t += 0.25;

      BLOBS.forEach((blob, bi) => {
        const pts = blobParams[bi];

        // Blob center drifts slowly
        const cx = (blob.cx + Math.sin(t * blob.mxSpeed * 60 + blob.mxPhase) * blob.mxRange) * W;
        const cy = (blob.cy + Math.cos(t * blob.mySpeed * 60 + blob.myPhase) * blob.myRange) * H;

        // Build morphing vertices
        const verts: { x: number; y: number }[] = [];
        for (let i = 0; i < NUM_POINTS; i++) {
          const angle = (i / NUM_POINTS) * Math.PI * 2;
          const morph = 1 + Math.sin(t * pts[i].speed + pts[i].phase) * pts[i].amp;
          const r = blob.baseRadius * morph;
          verts.push({
            x: cx + Math.cos(angle) * r,
            y: cy + Math.sin(angle) * r,
          });
        }

        // Draw smooth closed bezier through vertices
        ctx.beginPath();
        const start = {
          x: (verts[NUM_POINTS - 1].x + verts[0].x) / 2,
          y: (verts[NUM_POINTS - 1].y + verts[0].y) / 2,
        };
        ctx.moveTo(start.x, start.y);
        for (let i = 0; i < NUM_POINTS; i++) {
          const curr = verts[i];
          const next = verts[(i + 1) % NUM_POINTS];
          ctx.quadraticCurveTo(curr.x, curr.y, (curr.x + next.x) / 2, (curr.y + next.y) / 2);
        }
        ctx.closePath();

        // Radial gradient fill — bright core fading to transparent
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, blob.baseRadius * 1.6);
        grad.addColorStop(0,    `rgba(${blob.r},${blob.g},${blob.b},${blob.opacity})`);
        grad.addColorStop(0.40, `rgba(${blob.r},${blob.g},${blob.b},${+(blob.opacity * 0.45).toFixed(2)})`);
        grad.addColorStop(1,    `rgba(${blob.r},${blob.g},${blob.b},0)`);

        ctx.fillStyle = grad;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none transition-opacity duration-1000"
      style={{
        zIndex: 0,
        filter: `blur(${CANVAS_BLUR}px)`,
        opacity: resolvedTheme === "light" ? 0 : 1,
      }}
    />
  );
}
