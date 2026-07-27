import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);
  const [chartState, setChartState] = useState<{
    active: boolean;
    x: number;
    y: number;
    bounds: DOMRect | null;
  }>({ active: false, x: 0, y: 0, bounds: null });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      setPos({ x, y });

      // Check pointer cursor
      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable = !!(
          target.closest('button') ||
          target.closest('a') ||
          target.closest('input') ||
          target.closest('select') ||
          target.closest('[role="button"]') ||
          target.classList.contains('cursor-pointer') ||
          window.getComputedStyle(target).cursor === 'pointer'
        );
        setIsPointer(isClickable);

        // Check if inside line chart container marked for crosshair
        const crosshairChart = target.closest('[data-crosshair-chart="true"]');
        if (crosshairChart) {
          const rect = crosshairChart.getBoundingClientRect();
          setChartState({
            active: true,
            x,
            y,
            bounds: rect
          });
        } else {
          setChartState(prev => prev.active ? { ...prev, active: false } : prev);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {/* Chart Precision Crosshair Grid Overlay (+ Cursor) - ONLY ON ANALYTICS GRAPH */}
      {chartState.active && chartState.bounds && (
        <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
          {/* Horizontal Line extending across Chart Bounds */}
          <div
            className="fixed border-b border-dashed border-blue-400/60 shadow-[0_0_6px_rgba(96,165,250,0.5)]"
            style={{
              top: `${pos.y}px`,
              left: `${chartState.bounds.left}px`,
              width: `${chartState.bounds.width}px`
            }}
          />
          {/* Vertical Line extending down Chart Bounds */}
          <div
            className="fixed border-r border-dashed border-blue-400/60 shadow-[0_0_6px_rgba(96,165,250,0.5)]"
            style={{
              left: `${pos.x}px`,
              top: `${chartState.bounds.top}px`,
              height: `${chartState.bounds.height}px`
            }}
          />

          {/* Plus (+) Center Target Reticle */}
          <div
            className="fixed top-0 left-0 w-5 h-5 flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
            style={{
              transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`
            }}
          >
            {/* Center + Icon */}
            <div className="relative w-4 h-4 flex items-center justify-center">
              <div className="absolute w-3.5 h-[2px] bg-blue-400 rounded-full shadow-[0_0_6px_#60a5fa]" />
              <div className="absolute h-3.5 w-[2px] bg-blue-400 rounded-full shadow-[0_0_6px_#60a5fa]" />
              <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm z-10" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
