"use client";

// Adaptado de https://reactbits.dev/backgrounds/grid-motion (licencia MIT).
// Ajustado para llenar su contenedor (no 100vh) y usarse como fondo ambiental.
import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./GridMotion.css";

export interface GridMotionProps {
  items?: string[];
  className?: string;
}

const TOTAL_ITEMS = 28;

export default function GridMotion({ items = [], className = "" }: GridMotionProps) {
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mouseXRef = useRef(typeof window !== "undefined" ? window.innerWidth / 2 : 0);

  const combinedItems =
    items.length > 0
      ? Array.from({ length: TOTAL_ITEMS }, (_, i) => items[i % items.length])
      : Array.from({ length: TOTAL_ITEMS }, (_, i) => `Item ${i + 1}`);

  useEffect(() => {
    gsap.ticker.lagSmoothing(0);

    const handleMouseMove = (e: MouseEvent) => {
      mouseXRef.current = e.clientX;
    };

    const updateMotion = () => {
      const maxMoveAmount = 120;
      const baseDuration = 0.8;
      const inertiaFactors = [0.6, 0.4, 0.3, 0.2];

      rowRefs.current.forEach((row, index) => {
        if (row) {
          const direction = index % 2 === 0 ? 1 : -1;
          const moveAmount =
            ((mouseXRef.current / window.innerWidth) * maxMoveAmount - maxMoveAmount / 2) * direction;

          gsap.to(row, {
            x: moveAmount,
            duration: baseDuration + inertiaFactors[index % inertiaFactors.length],
            ease: "power3.out",
            overwrite: "auto",
          });
        }
      });
    };

    const removeAnimationLoop = gsap.ticker.add(updateMotion);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      removeAnimationLoop();
    };
  }, []);

  return (
    <div className={`gm-noscroll ${className}`} aria-hidden="true">
      <section className="gm-intro">
        <div className="gm-container">
          {[...Array(4)].map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="gm-row"
              ref={(el) => {
                rowRefs.current[rowIndex] = el;
              }}
            >
              {[...Array(7)].map((_, itemIndex) => {
                const content = combinedItems[rowIndex * 7 + itemIndex];
                return (
                  <div key={itemIndex} className="gm-item">
                    <div className="gm-item-inner">
                      <div className="gm-item-img" style={{ backgroundImage: `url(${content})` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
