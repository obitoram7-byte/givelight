"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function PageMascot() {
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [popped, setPopped] = useState(false);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = (event.clientY / window.innerHeight) * 2 - 1;
      setLook({
        x: clamp(x * 14, -14, 14),
        y: clamp(y * 11, -11, 11),
      });
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  const handleClick = () => {
    setPopped(true);
    window.setTimeout(() => setPopped(false), 320);
  };

  return (
    <div
      aria-label="Givelight otter mascot"
      onClick={handleClick}
      style={{
        position: "fixed",
        right: 18,
        bottom: 18,
        zIndex: 50,
        width: 148,
        height: 180,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        pointerEvents: "auto",
        userSelect: "none",
        cursor: "pointer",
        filter: "drop-shadow(0 18px 25px rgba(10, 28, 24, 0.18))",
      }}
    >
      <div
        style={{
          transform: `translate(${look.x * 0.6}px, ${look.y * 0.65}px) rotateX(${look.y * 0.5}deg) rotateY(${look.x * 0.6}deg) scale(${popped ? 1.07 : 1})`,
          transition: "transform 180ms ease-out",
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        <Image
          src="/mascots/otter-mascot.svg"
          alt="Chibi otter mascot for Givelight"
          width={148}
          height={180}
          priority
          unoptimized
        />
      </div>
    </div>
  );
}
