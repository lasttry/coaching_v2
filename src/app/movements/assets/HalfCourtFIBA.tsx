/* eslint-disable react/prop-types */
import React from 'react';

import { getCircleYCoordinates } from '@/utils/math';

interface HalfcourtFIBAProps {
  scale: number;
  courtBorder: number;
  stageWidth: number;
  keyHeight: number;
  keyWidth: number;
  strokeColor: string;
  strokeWidth: number;
  backgroundColor?: string;
}

export const HalfcourtFIBA: React.FC<HalfcourtFIBAProps> = React.memo(
  ({
    scale,
    courtBorder,
    stageWidth,
    keyHeight,
    keyWidth,
    strokeColor,
    strokeWidth,
    backgroundColor,
  }) => {
    const keyTopY = keyHeight + courtBorder;
    const keyMiddleX = keyWidth / 2;
    const middleX = stageWidth / 2;

    const keyStartX = middleX - keyMiddleX;
    const keyEndX = middleX + keyMiddleX;
    const freeThrowRadius = 18 * scale;
    const basketY = 15.75 * scale + courtBorder;
    const backboardY = 12 * scale + courtBorder;
    const noChargeRadius = 12.5 * scale;
    const noChargeHeight = 3.75 * scale;
    const threePointRadius = 67.5 * scale;

    const { y1: startThreePointArcY } = getCircleYCoordinates(
      middleX,
      basketY,
      threePointRadius,
      9 * scale + courtBorder,
    );
    const { y1: endThreePointArcY } = getCircleYCoordinates(
      middleX,
      basketY,
      threePointRadius,
      stageWidth - 9 * scale - courtBorder,
    );

    const generateArcPath = (
      centerX: number,
      centerY: number,
      radius: number,
      lineHeight: number,
    ): string =>
      `M ${centerX - radius},${centerY - lineHeight}
       l 0,${lineHeight}
       A ${radius},${radius} 0 0,0 ${centerX + radius},${centerY}
       l 0,-${lineHeight}`;

    return (
      <g
        stroke={strokeColor}
        fill="none"
        id="halfcourt"
        strokeWidth={strokeWidth}
      >
        {/* Key lines */}
        <line
          x1={keyStartX - 2 * scale}
          x2={keyEndX + 2 * scale}
          y1={courtBorder + 17.5 * scale}
          y2={courtBorder + 17.5 * scale}
          strokeWidth={1 * scale}
        />
        <line
          x1={keyStartX - 2 * scale}
          x2={keyEndX + 2 * scale}
          y1={courtBorder + 27 * scale}
          y2={courtBorder + 27 * scale}
          strokeWidth={4 * scale}
        />
        <line
          x1={keyStartX - 2 * scale}
          x2={keyEndX + 2 * scale}
          y1={courtBorder + 39.5 * scale}
          y2={courtBorder + 39.5 * scale}
          strokeWidth={1 * scale}
        />
        <line
          x1={keyStartX - 2 * scale}
          x2={keyEndX + 2 * scale}
          y1={courtBorder + 49 * scale}
          y2={courtBorder + 49 * scale}
          strokeWidth={1 * scale}
        />
        <rect
          x={keyStartX}
          y={courtBorder}
          width={keyWidth}
          height={keyHeight}
          stroke={strokeColor}
          strokeWidth={1 * scale}
          fill={backgroundColor || 'none'}
        />

        {/* Basket */}
        <circle cx={middleX} cy={basketY} r={2 * scale} stroke={strokeColor} />
        <line
          x1={middleX - 10 * scale}
          x2={middleX + 10 * scale}
          y1={backboardY}
          y2={backboardY}
          strokeWidth={strokeWidth}
        />
        <line
          x1={middleX}
          x2={middleX}
          y1={backboardY}
          y2={backboardY + 2 * scale}
          strokeWidth={strokeWidth}
        />

        {/* No charge area */}
        <path
          d={generateArcPath(middleX, basketY, noChargeRadius, noChargeHeight)}
        />

        {/* 3-point line */}
        <path
          d={`M ${courtBorder + 9 * scale},${courtBorder}
              l 0,${startThreePointArcY - courtBorder}
              A ${threePointRadius},${threePointRadius} 0 0,0 ${
                stageWidth - courtBorder - 9 * scale
              },${endThreePointArcY}
              l 0,-${startThreePointArcY - courtBorder}`}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />

        {/* Freethrow circle */}
        <path
          d={generateArcPath(middleX, keyTopY, freeThrowRadius, 0)}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      </g>
    );
  },
);

HalfcourtFIBA.displayName = 'HalfcourtFIBA';
