"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";

export function CobeGlobe({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16_000,
      mapBrightness: 6,
      baseColor: [0.1, 0.2, 0.4],
      markerColor: [0.2, 0.6, 1],
      glowColor: [0.1, 0.3, 0.8],
      markers: [
        { location: [37.7595, -122.4367], size: 0.03 },
        { location: [40.7128, -74.006], size: 0.08 },
        { location: [51.5074, -0.1278], size: 0.05 },
        { location: [35.6762, 139.6503], size: 0.05 },
        { location: [48.8566, 2.3522], size: 0.04 },
        { location: [-33.8688, 151.2093], size: 0.04 },
      ],
      onRender: (state) => {
        state.phi = phi;
        phi += 0.005;
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: 600,
        height: 600,
        maxWidth: "100%",
        aspectRatio: "1",
      }}
    />
  );
}