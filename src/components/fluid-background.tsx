
'use client';

import React, { useEffect, useRef } from 'react';

export default function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const initFluid = async () => {
      try {
        const WebGLFluid = (await import('webgl-fluid')).default;
        
        // Configuration for an elegant neon smoke effect
        WebGLFluid(canvas, {
          IMMEDIATE: true,
          TRIGGER: 'hover', // Only trigger on mouse move/hover
          SIM_RESOLUTION: 128,
          DYE_RESOLUTION: 1024, // High resolution for sharp smoke
          CAPTURE_RESOLUTION: 512,
          DENSITY_DISSIPATION: 4.0, // Fast dissipation to prevent buildup
          VELOCITY_DISSIPATION: 0.5, // Smooth flow
          PRESSURE: 0.8,
          PRESSURE_ITERATIONS: 20,
          CURL: 30,
          SPLAT_RADIUS: 0.2, // Leaner smoke trails
          SPLAT_FORCE: 6000,
          SHADING: true,
          COLORFUL: true,
          COLOR_UPDATE_SPEED: 10,
          PAUSED: false,
          BACK_COLOR: { r: 0, g: 0, b: 0 },
          TRANSPARENT: true, // Allow background to show through
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
      // Library cleanup is handled by canvas removal
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ 
        zIndex: -1, 
        backgroundColor: 'transparent'
      }}
    />
  );
}
