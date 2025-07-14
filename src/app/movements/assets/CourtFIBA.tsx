import React, { useEffect, useState, useMemo, useRef } from 'react';

import { useSvgDefs } from '@/app/(DashboardLayout)/components/drills/SvgDefsProvider';
import { HalfcourtFIBA } from './HalfCourtFIBA';

interface CircleImage {
  img: HTMLImageElement;
  scale: { x: number; y: number };
  offset: { x: number; y: number };
}

interface BasketballCourtSVGProps {
  scale?: number;
  courtBorder?: number;
  strokeColor?: string;
  backgroundColor?: string;
  isFullCourt: boolean;
  playground?: string;
  centerLogo?: string;
}

const CourtFIBA: React.FC<BasketballCourtSVGProps> = ({
  scale = 1,
  courtBorder = 25,
  strokeColor = '#ffffff',
  backgroundColor = '#70bfe9',
  isFullCourt,
  playground = '/images/backgrounds/playground.jpg',
  centerLogo,
}) => {
  const gRef = useRef<SVGGElement | null>(null);
  const { addDef, removeDef } = useSvgDefs();
  const [circleImage, setCircleImage] = useState<CircleImage | undefined>();

  const courtWidth = 150 * scale;
  const courtHeight = 280 * scale;

  const stageWidth = useMemo(() => courtWidth + courtBorder * 2, [courtWidth, courtBorder]);
  const stageHeight = useMemo(() => courtHeight + courtBorder * 2, [courtHeight, courtBorder]);

  const middleX = stageWidth / 2;
  const middleY = stageHeight / 2;
  const centerCircleRadius = (36 / 2) * scale;
  const keyWidth = 49 * scale;
  const keyHeight = 58 * scale;
  const strokeWidth = 1 * scale;

  useEffect(() => {
    const updateViewBox = (): void => {
      if (gRef.current) {
        const parentSvg = gRef.current.closest('svg');
        if (parentSvg) {
          parentSvg.setAttribute('viewBox', `0 0 ${stageWidth} ${stageHeight}`);
        }
      }
    };

    const addSvgDefinitions = (): void => {
      addDef(
        'playground',
        <pattern
          id="playgroundPattern"
          patternUnits="userSpaceOnUse"
          width={courtWidth}
          height={courtHeight}
        >
          <image
            href={playground}
            x="0"
            y="0"
            width={courtWidth}
            height={courtHeight}
            preserveAspectRatio="none"
          />
        </pattern>
      );

      addDef(
        'background',
        <HalfcourtFIBA
          scale={scale}
          courtBorder={courtBorder}
          stageWidth={stageWidth}
          keyHeight={keyHeight}
          keyWidth={keyWidth}
          strokeColor={strokeColor}
          backgroundColor={backgroundColor}
          strokeWidth={strokeWidth}
        />
      );

      addDef(
        'middleCircleCutout',
        <clipPath id="courtCenter">
          <circle
            cx={middleX}
            cy={middleY}
            r={centerCircleRadius}
            fill="#FFFFFF"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </clipPath>
      );

      if (!isFullCourt) {
        addDef(
          'fullCourt',
          <clipPath id="clipHalfCourt">
            <rect x="0" y="0" width={stageWidth} height={stageHeight / 2} />
          </clipPath>
        );
      }
    };

    const loadCircleImage = (): void => {
      if (centerLogo) {
        const img = new Image();
        img.src = centerLogo;
        img.onload = () => {
          const diameter = centerCircleRadius * 2;
          const scaleFactor = diameter / Math.max(img.width, img.height);
          setCircleImage({
            img,
            scale: { x: scaleFactor, y: scaleFactor },
            offset: { x: img.width / 2, y: img.height / 2 },
          });
        };
        img.onerror = (error) => console.error('Error loading circle image:', error);
      }
    };

    updateViewBox();
    addSvgDefinitions();
    loadCircleImage();

    return () => {
      removeDef('playground');
      removeDef('background');
      removeDef('middleCircleCutout');
      removeDef('fullCourt');
    };
  }, [
    scale,
    courtBorder,
    strokeColor,
    backgroundColor,
    isFullCourt,
    playground,
    centerLogo,
    stageWidth,
    stageHeight,
    addDef,
    removeDef,
    centerCircleRadius,
    courtHeight,
    courtWidth,
    keyHeight,
    keyWidth,
    middleX,
    middleY,
    strokeWidth,
  ]);

  return (
    <g ref={gRef} className="background">
      <rect
        x={0}
        y={0}
        width={stageWidth}
        height={isFullCourt ? stageHeight : stageHeight / 2 + 25}
        fill={backgroundColor || 'none'}
        strokeWidth={strokeWidth}
      />
      <g id="fullCanvas" clipPath="url(#clipHalfCourt)">
        <rect
          x={courtBorder}
          y={courtBorder}
          width={courtWidth}
          height={isFullCourt ? courtHeight : courtHeight / 2}
          fill="url(#playgroundPattern)"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        <line
          x1={courtBorder}
          y1={middleY}
          x2={courtWidth + courtBorder}
          y2={middleY}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={middleX}
          cy={middleY}
          r={centerCircleRadius}
          fill={backgroundColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        {circleImage && (
          <image
            x={middleX - centerCircleRadius}
            y={middleY - centerCircleRadius}
            href={circleImage.img.src}
            width={centerCircleRadius * 2}
            height={centerCircleRadius * 2}
            clipPath="url(#courtCenter)"
          />
        )}
      </g>
      <use href="#halfcourt" />
      {isFullCourt && <use href="#halfcourt" transform={`matrix(1,0,0,-1,0,${stageHeight})`} />}
    </g>
  );
};

export default CourtFIBA;
CourtFIBA.displayName = 'CourtFIBA';
