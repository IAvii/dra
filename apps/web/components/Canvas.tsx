'use client';

import { useEffect, useRef } from 'react';
import { CanvasEngine } from '@/canvas';
import { Toolbar } from './Toolbar';

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<CanvasEngine | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new CanvasEngine(canvasRef.current);
    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none touch-none">
      <Toolbar
        onFitToScreen={() => engineRef.current?.fitToScreen()}
        onResetZoom={() => engineRef.current?.resetZoom()}
        onCenterCanvas={() => engineRef.current?.centerCanvas()}
      />
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
