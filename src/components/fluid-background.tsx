
'use client';

import React, { useEffect, useRef } from 'react';

export default function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const initFluid = async () => {
      try {
        // Menggunakan library webgl-fluid yang lebih stabil
        const WebGLFluid = (await import('webgl-fluid')).default;
        WebGLFluid(canvas, {
          IMMEDIATE: true,
          TRIGGER: 'hover',
          SIM_RESOLUTION: 128,
          DYE_RESOLUTION: 512,
          CAPTURE_RESOLUTION: 512,
          DENSITY_DISSIPATION: 1.0,
          VELOCITY_DISSIPATION: 0.2,
          PRESSURE: 0.8,
          PRESSURE_ITERATIONS: 20,
          CURL: 30,
          SPLAT_RADIUS: 0.25,
          SPLAT_FORCE: 6000,
          SHADING: true,
          COLORFUL: true,
          COLOR_UPDATE_SPEED: 10,
          PAUSED: false,
          BACK_COLOR: { r: 0, g: 0, b: 0 },
          TRANSPARENT: true,
          BLOOM: true,
          BLOOM_ITERATIONS: 8,
          BLOOM_RESOLUTION: 256,
          BLOOM_INTENSITY: 0.8,
          BLOOM_THRESHOLD: 0.6,
          BLOOM_SOFT_KNEE: 0.7,
          SUNRAYS: true,
          SUNRAYS_RESOLUTION: 196,
          SUNRAYS_WEIGHT: 1.0,
        });
      } catch (error) {
        console.error('Failed to initialize fluid simulation:', error);
      }
    };

    initFluid();

    return () => {
      // Library webgl-fluid tidak memiliki method destroy eksplisit,
      // namun pembersihan dilakukan secara otomatis saat elemen canvas dilepas dari DOM.
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ 
        zIndex: -1, 
        opacity: 0.5, 
        mixBlendMode: 'screen' 
      }}
    />
  );
}
