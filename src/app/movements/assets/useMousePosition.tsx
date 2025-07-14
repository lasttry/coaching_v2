import { useState, useEffect, useCallback, useRef } from 'react';

interface MouseDetails {
  svgElement: SVGSVGElement | null;
  bckElement: SVGGraphicsElement | null;
  point: DOMPoint | null;
  ctm: DOMMatrix | null;
  width: number;
  height: number;
}

export const useMousePosition = (
  visible: boolean
): {
  gRef: React.RefObject<SVGGElement> | null;
  mousePosition: { x: number; y: number };
} => {
  const gRef = useRef<SVGGElement>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [details, setDetails] = useState<MouseDetails>({
    svgElement: null,
    bckElement: null,
    point: null,
    ctm: null,
    width: 0,
    height: 0,
  });

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (details.point && details.ctm) {
        details.point.x = event.clientX;
        details.point.y = event.clientY;

        const svgPoint = details.point.matrixTransform(details.ctm.inverse());
        const clampedX = Math.max(0, Math.min(svgPoint.x, details.width));
        const clampedY = Math.max(0, Math.min(svgPoint.y, details.height));
        setMousePosition({ x: clampedX, y: clampedY });
      }
    },
    [details]
  );

  useEffect(() => {
    if (visible) {
      if (!details.svgElement) {
        const svgElement = gRef.current?.closest('svg');
        if (svgElement) {
          const bckElement = svgElement.querySelector('.background');
          if (bckElement instanceof SVGGraphicsElement) {
            const ctm = svgElement.getScreenCTM();
            if (ctm) {
              const point = svgElement.createSVGPoint();
              const { width, height } = bckElement.getBBox();
              setDetails({ svgElement, bckElement, point, ctm, width, height });
            }
          }
        }
      }

      const handleMouseMoveThrottled = (event: MouseEvent): void => {
        requestAnimationFrame(() => handleMouseMove(event));
      };

      window.addEventListener('mousemove', handleMouseMoveThrottled);

      return () => {
        window.removeEventListener('mousemove', handleMouseMoveThrottled);
      };
    }
  }, [visible, handleMouseMove, details.svgElement]);

  return { gRef, mousePosition };
};
