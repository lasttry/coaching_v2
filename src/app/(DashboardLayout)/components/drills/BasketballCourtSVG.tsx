import React, { useEffect, useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { getCircleYCoordinates } from '@/utils/math';
import { useSvgDefs } from '@/app/(DashboardLayout)/components/drills/SvgDefsProvider';

interface CircleImage {
  img: HTMLImageElement;
  scale: {
    x: number;
    y: number;
  };
  offset: {
    x: number;
    y: number;
  };
}

interface BasketballCourtSVGProps {
  scale?: number;
  courtBorder?: number;
  stageWidth: number;
  stageHeight: number;
  courtWidth: number;
  courtHeight: number;
  strokeColor: string | undefined;
  fullCourt: boolean;
}

const BasketballCourtSVG: React.FC<BasketballCourtSVGProps> = ({
  scale = 1,
  courtBorder = 25,
  stageWidth,
  stageHeight,
  courtWidth,
  courtHeight,
  strokeColor,
  fullCourt,
}) => {
  const { settings } = useSettings();
  const { addDef, removeDef } = useSvgDefs();
  const [updateSvgDefs, setUpdateSvgDefs] = useState<boolean>(false);
  const [playground, setPlayground] = useState<HTMLImageElement | undefined>(
    undefined,
  );
  const [circleImage, setCircleImage] = useState<CircleImage | undefined>(
    undefined,
  );
  const middleX = stageWidth / 2;
  const middleY = stageHeight / 2;

  const keyWidth = 49 * scale;
  const keyHeight = 58 * scale;
  const keyTopY = keyHeight + courtBorder;
  const keyMiddleX = keyWidth / 2;
  const keyStartX = middleX - keyMiddleX;
  const keyEndX = middleX + keyMiddleX;
  const freeThrowRadius = 18 * scale;
  const basketY = 15.75 * scale + courtBorder;
  const backboardY = 12 * scale + courtBorder;
  const noChargeRadius = 12.5 * scale;
  const noChargeHeigh = 3.75 * scale;
  const threePointRadius = 67.5 * scale;
  {
    /* Calculate the start/end point of the three point line */
  }
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
  ) => {
    return `
    M ${centerX - radius},${centerY - lineHeight}
    l 0,${lineHeight}
    A ${radius},${radius} 0 0,0 ${centerX + radius},${centerY}
    l 0,-${lineHeight}`;
  };

  useEffect(() => {
    const loadPlayground = () => {
      const imgPlayground = new Image();
      imgPlayground.src = '/images/backgrounds/playground.jpg';
      imgPlayground.onload = () => setPlayground(imgPlayground);
      addDef(
        'playground',
        <pattern
          id="playgroundPattern"
          patternUnits="userSpaceOnUse"
          width={courtWidth}
          height={courtHeight}
        >
          <image
            href={imgPlayground.src}
            x="0"
            y="0"
            width={courtWidth}
            height={courtHeight}
            preserveAspectRatio="none"
          />
        </pattern>,
      );
    };
    const loadCircleImage = () => {
      console.log(settings?.teamName);
      if (settings?.image) {
        const img = new Image();
        img.src = `${settings.image}`;
        img.onload = () => {
          console.log('Circle image loaded');
          const circleRadius = (36 / 2) * scale; // Circle radius
          const diameter = circleRadius * 2;
          // Calculate scale to fit the circle
          const scaleFactor = diameter / Math.max(img.width, img.height);
          setCircleImage({
            img,
            scale: { x: scaleFactor, y: scaleFactor }, // Apply the scale
            offset: { x: img.width / 2, y: img.height / 2 }, // Center the image
          });
        };
        img.onerror = (error) =>
          console.error('Error loading circle image:', error);
      }
    };
    const addDefs = () => {
      {
        /* Halfcourt design */
      }
      addDef(
        'background',
        <g stroke={strokeColor} fill="none" id="halfcourt" strokeWidth={2}>
          {/* key lines */}
          <line
            x1={keyStartX - 2 * scale}
            x2={keyEndX + 2 * scale}
            y1={courtBorder + 17.5 * scale}
            y2={courtBorder + 17.5 * scale}
            strokeWidth={1 * scale}
          ></line>
          <line
            x1={keyStartX - 2 * scale}
            x2={keyEndX + 2 * scale}
            y1={courtBorder + 27 * scale}
            y2={courtBorder + 27 * scale}
            strokeWidth={4 * scale}
          ></line>
          <line
            x1={keyStartX - 2 * scale}
            x2={keyEndX + 2 * scale}
            y1={courtBorder + 39.5 * scale}
            y2={courtBorder + 39.5 * scale}
            strokeWidth={1 * scale}
          ></line>
          <line
            x1={keyStartX - 2 * scale}
            x2={keyEndX + 2 * scale}
            y1={courtBorder + 49 * scale}
            y2={courtBorder + 49 * scale}
            strokeWidth={1 * scale}
          ></line>
          <rect
            x={keyStartX}
            y={courtBorder}
            width={keyWidth}
            height={keyHeight}
            stroke={strokeColor}
            strokeWidth={1 * scale}
            fill={settings?.backgroundColor || undefined}
          ></rect>
          {/* Basket */}
          <circle cx={middleX} cy={basketY} r={2 * scale} stroke={strokeColor}>
            {' '}
          </circle>
          <line
            x1={middleX - 10 * scale}
            x2={middleX + 10 * scale}
            y1={backboardY}
            y2={backboardY}
            strokeWidth={3}
          ></line>
          <line
            x1={middleX}
            x2={middleX}
            y1={backboardY}
            y2={backboardY + 2 * scale}
            strokeWidth={4}
          ></line>
          {/* No charge */}
          {/* no-charge arc */}
          <path
            d={generateArcPath(middleX, basketY, noChargeRadius, noChargeHeigh)}
          ></path>
          {/* 3 point */}
          <path
            d={`M ${courtBorder + 9 * scale},${courtBorder}
            l 0,${startThreePointArcY - courtBorder}
            A ${threePointRadius},${threePointRadius} 0 0,0 ${stageWidth - courtBorder - 9 * scale},${endThreePointArcY}
            l 0,-${startThreePointArcY - courtBorder}
            `}
            stroke={strokeColor}
            strokeWidth={1 * scale}
          ></path>
          {/* freethrow circle */}
          <path
            d={generateArcPath(middleX, keyTopY, freeThrowRadius, 0)}
            stroke={strokeColor}
            strokeWidth={1 * scale}
          ></path>
        </g>,
      );
      addDef(
        'middleCircleCutout',
        <clipPath id="courtCenter">
          <circle
            cx={middleX}
            cy={middleY}
            r={(36 / 2) * scale}
            fill="#FFFFFF"
            stroke={strokeColor}
            strokeWidth={1 * scale}
          />
        </clipPath>,
      );
      if (fullCourt) {
        addDef(
          'fullCourt',
          <clipPath id="clipHalfCourt">
            <rect
              x="0"
              y="0"
              width={stageWidth}
              height={stageHeight / 2}
            ></rect>
          </clipPath>,
        );
      }
      setUpdateSvgDefs(true);
    };

    addDefs();
    loadCircleImage();
    loadPlayground();
  }, [settings, scale, updateSvgDefs]);

  useEffect(() => {
    if (fullCourt) {
      addDef(
        'fullCourt',
        <clipPath id="clipHalfCourt">
          <rect x="0" y="0" width={stageWidth} height={stageHeight / 2}></rect>
        </clipPath>,
      );
    } else {
      removeDef('fullCourt');
    }
  }, [fullCourt]);

  if (!playground || (settings?.image && !circleImage)) {
    return <div>Loading...</div>; // Show a loading state until images are ready
  }

  return (
    <g className="background">
      {/* Background Rectangle */}
      <rect
        x={0}
        y={0}
        width={stageWidth}
        height={fullCourt ? stageHeight / 2 + 25 : stageHeight}
        fill={settings?.backgroundColor || 'none'}
        strokeWidth={1 * scale}
      />
      <g id="fullCanvas" clipPath="url(#clipHalfCourt)">
        {/* Pattern-filled Rectangle */}
        <rect
          x={courtBorder}
          y={courtBorder}
          width={courtWidth}
          height={fullCourt ? courtHeight / 2 : courtHeight}
          fill={`url(#playgroundPattern)`}
          stroke={strokeColor}
          strokeWidth={1 * scale}
        />

        {/* Center Line */}
        <line
          x1={courtBorder}
          y1={middleY}
          x2={courtWidth + courtBorder}
          y2={middleY}
          stroke={strokeColor}
          strokeWidth={1 * scale}
        />

        {/* Center Circle */}
        <circle
          cx={middleX}
          cy={middleY}
          r={(36 / 2) * scale}
          fill={settings?.backgroundColor}
          stroke={strokeColor}
          strokeWidth={1 * scale}
        />

        {circleImage && (
          <image
            x={middleX - ((36 / 2) * scale * 2) / 2}
            y={middleY - ((36 / 2) * scale * 2) / 2}
            href={circleImage.img.src} // Source of the image
            width={(36 / 2) * scale * 2} // Stretch to match pattern size
            height={(36 / 2) * scale * 2}
            clipPath="url(#courtCenter)"
          />
        )}
      </g>
      <use href="#halfcourt"></use>
      <use
        href="#halfcourt"
        transform={`matrix(1,0,0,-1,0,${stageHeight})`}
      ></use>
    </g>
  );
};

export default BasketballCourtSVG;
