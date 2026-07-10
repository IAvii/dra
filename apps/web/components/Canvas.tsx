'use client';

import { useEffect, useRef } from 'react';
import { CanvasEngine } from '@/canvas';

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new CanvasEngine(canvasRef.current);

    return () => engine.destroy();
  }, []);

  return <canvas ref={canvasRef} className="block h-screen w-screen" />;
}
