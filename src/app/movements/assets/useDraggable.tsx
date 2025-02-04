import { useState, useRef, useCallback, useEffect } from 'react';
import { useMousePosition } from './useMousePosition';

interface DraggableOptions {
  draggable?: boolean;
  rotatable?: boolean;
}

export const useDraggable = (
  id: string,
  initialPosition: { x?: number; y?: number; rotation?: number } = {},
  options: DraggableOptions = {},
  onMove?: (id: string, x?: number, y?: number, rotation?: number) => void
) => {
  const { gRef, mousePosition } = useMousePosition(true);
  const [position, setPosition] = useState(initialPosition);
  const draggingRef = useRef(false);
  const rotatingRef = useRef(false);

  const latestPosition = useRef(position);
  useEffect(() => {
    latestPosition.current = position;
  }, [position]);

  const handleMouseDownMove = useCallback(() => {
    if (options.draggable) {
      draggingRef.current = true;
      rotatingRef.current = false;
    }
  }, [options.draggable]);

  const handleMouseDownRotate = useCallback(() => {
    if (options.rotatable) {
      rotatingRef.current = true;
      draggingRef.current = false;
    }
  }, [options.rotatable]);

  const handleMouseMove = useCallback(() => {
    if (draggingRef.current) {
      setPosition((prev) => ({
        ...prev,
        x: mousePosition.x,
        y: mousePosition.y,
      }));
    } else if (rotatingRef.current) {
      const centerX = latestPosition.current.x || 0;
      const centerY = latestPosition.current.y || 0;
      const deltaX = mousePosition.x - centerX;
      const deltaY = mousePosition.y - centerY;
      const angleRadians = Math.atan2(deltaY, deltaX);
      const angleDegrees = (angleRadians * 180) / Math.PI + 90;

      setPosition((prev) => ({
        ...prev,
        rotation: (angleDegrees + 360) % 360,
      }));
    }
  }, [mousePosition]);

  const handleMouseUp = useCallback(() => {
    if (draggingRef.current && onMove) {
      onMove(id, latestPosition.current.x, latestPosition.current.y);
    }
    if (rotatingRef.current && onMove) {
      onMove(id, latestPosition.current.x, latestPosition.current.y, latestPosition.current.rotation);
    }
    draggingRef.current = false;
    rotatingRef.current = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [id, onMove, handleMouseMove]);

  const startDraggingOrRotating = useCallback(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (draggingRef.current || rotatingRef.current) {
      startDraggingOrRotating();
    }
  }, [draggingRef.current, rotatingRef.current, startDraggingOrRotating]);

  return {
    gRef,
    position,
    handleMouseDownMove: () => {
      handleMouseDownMove();
      startDraggingOrRotating();
    },
    handleMouseDownRotate: () => {
      handleMouseDownRotate();
      startDraggingOrRotating();
    },
  };
};
