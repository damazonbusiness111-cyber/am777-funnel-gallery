"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

type NetworkNode = { x: number; y: number; vx: number; vy: number; r: number };

/**
 * Futuristic animated background: a Framer Motion ambient glow layered over a
 * lightweight canvas node-network (glowing points drifting and connecting
 * with lines), matching the InfraMind777 / AM777 dark navy aesthetic.
 */
export default function NodeNetworkBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const reduced = Boolean(useReducedMotion());

  useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || reduced) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

                let width = 0;
        let height = 0;
        let frameId = 0;

                function resize() {
                        const parent = canvas!.parentElement;
                        width = parent ? parent.clientWidth : window.innerWidth;
                        height = parent ? parent.clientHeight : window.innerHeight;
                        canvas!.width = width;
                        canvas!.height = height;
                }
        resize();
        window.addEventListener("resize", resize);

                const NODE_COUNT = 42;
        const nodes: NetworkNode[] = Array.from({ length: NODE_COUNT }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                r: Math.random() * 1.6 + 1,
        }));

                function draw() {
                        if (!ctx) return;
                        ctx.clearRect(0, 0, width, height);

          for (const n of nodes) {
                    n.x += n.vx;
                    n.y += n.vy;
                    if (n.x < 0 || n.x > width) n.vx *= -1;
                    if (n.y < 0 || n.y > height) n.vy *= -1;
          }

          for (let i = 0; i < nodes.length; i++) {
                    for (let j = i + 1; j < nodes.length; j++) {
                                const a = nodes[i];
                                const b = nodes[j];
                                const d = Math.hypot(a.x - b.x, a.y - b.y);
                                if (d < 130) {
                                              ctx.strokeStyle = `rgba(125,180,255,${0.16 * (1 - d / 130)})`;
                                              ctx.lineWidth = 1;
                                              ctx.beginPath();
                                              ctx.moveTo(a.x, a.y);
                                              ctx.lineTo(b.x, b.y);
                                              ctx.stroke();
                                }
                    }
          }

          for (const n of nodes) {
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(147,184,232,0.85)";
                    ctx.shadowColor = "rgba(91,147,240,0.8)";
                    ctx.shadowBlur = 5;
                    ctx.fill();
          }

          frameId = requestAnimationFrame(draw);
                }
        draw();

                return () => {
                        window.removeEventListener("resize", resize);
                        cancelAnimationFrame(frameId);
                };
  }, [reduced]);

  return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
              <canvas ref={canvasRef} className="node-network-canvas" />
          {!reduced && (
                  <motion.div
                              className="pointer-events-none absolute left-1/2 top-1/3 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
                              style={{ background: "radial-gradient(closest-side, rgba(59,130,246,0.16), transparent)" }}
                              animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
                              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            />
                )}
        </div>
      );
}
</div>
