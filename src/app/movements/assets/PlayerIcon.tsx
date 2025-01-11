/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import WithDraggable from './WithDraggable';
import { useSvgDefs } from '@/app/(DashboardLayout)/components/drills/SvgDefsProvider';
import { SvgIconsInterface, DrawingToolType } from './types';

interface PlayerIconProps extends SvgIconsInterface {
  onClick?: (id: string) => void;
}

const PlayerIcon: React.FC<PlayerIconProps> = React.memo(
  ({ id, type, textValue, onClick }) => {
    const { addDef, hasDef } = useSvgDefs();
    const [updateSvgDefs, setUpdateSvgDefs] = useState<boolean>(false);

    const handleOnClick = (
      event: React.MouseEvent<SVGGElement, MouseEvent>,
    ) => {
      event.stopPropagation();
      console.log('PlayerIcon->handleOnClick');
      if (onClick) onClick(id);
    };

    useEffect(() => {
      if (!hasDef('coneGradient')) {
        addDef(
          'coneGradient',
          <linearGradient x1="0" y1="0.5" x2="1" y2="0.5" id="coneGradient">
            <stop offset="0%" stopColor="#ffffff"></stop>
            <stop offset="25%" stopColor="#ff7f7f"></stop>
            <stop offset="100%" stopColor="#f00000"></stop>
          </linearGradient>,
        );
      }
      if (!hasDef('cone')) {
        addDef(
          'cone',
          <g id="cone">
            <path
              d="m -5,8 4.5,-17 1,0 4.5,17 z"
              fill="url(#coneGradient)"
            ></path>
            <line
              x1="-10"
              x2="10"
              y1="8"
              y2="8"
              stroke="#000000"
              style={{ strokeWidth: 1 }}
            ></line>
            <line
              x1="-10"
              x2="10"
              y1="9"
              y2="9"
              stroke="#f00000"
              style={{ strokeWidth: 1 }}
            ></line>
          </g>,
        );
      }
      if (!hasDef('ballGradient')) {
        addDef(
          'ballGradient',
          <radialGradient cx="0.6" cy="0.4" r="0.5" id="ballGradient">
            <stop offset="0%" stopColor="#ffcaa6"></stop>
            <stop offset="75%" stopColor="#d54800"></stop>
            <stop offset="100%" stopColor="#8d3d17"></stop>
          </radialGradient>,
        );
      }
      if (!hasDef('ball')) {
        addDef(
          'ball',
          <g id="ball">
            <ellipse
              cx="0"
              cy="0"
              rx="7.25"
              ry="7"
              fill="url(#ballGradient)"
            ></ellipse>
            <path
              d="m -3.4,-6.1 c 2.3,-0.9 5.3,2 8.5,1 M -5.6,4.5 C -4.3,0.6 5.6,-8.1 5.9,4 M -0.4,7 C 2.7,3.5 3.1,-3.5 2.1,-6.6 M -7,-1.2 C -6.6,-3.3 3.2,-6.3 7,-1"
              stroke="#000000"
              fill="none"
              style={{ strokeWidth: 0.2 }}
            ></path>
          </g>,
        );
      }
      if (!hasDef('offense')) {
        addDef(
          'offense',
          <circle
            id="offense"
            cx="0"
            cy="0"
            r="10"
            fill="#ffffff"
            strokeWidth={2}
            style={{ cursor: 'pointer' }}
          ></circle>,
        );
      }
      if (!hasDef('defense')) {
        addDef(
          'defense',
          <g id="defense">
            <path
              d="m -20,10 c 10,-16 30,-16 40,0 -5,-24 -35,-24 -40,0"
              stroke="none"
              strokeWidth={0}
            ></path>
            <circle
              cx="0"
              cy="0"
              r="7"
              fill="#ffffff"
              strokeWidth={2}
              style={{ cursor: 'pointer' }}
            ></circle>
          </g>,
        );
      }
      setUpdateSvgDefs(true);
    }, [updateSvgDefs]);

    return (
      <>
        <use href={'#' + type} className={id} onClick={handleOnClick}></use>
        {(type === DrawingToolType.Offense ||
          type === DrawingToolType.Defense) && (
          <text
            x="-4"
            y="5"
            stroke="none"
            style={{
              fontSize: '14px',
              fontFamily: 'Arial',
              fontWeight: 'bold',
              pointerEvents: 'none',
            }}
          >
            {textValue}
          </text>
        )}
      </>
    );
  },
);

PlayerIcon.displayName = 'PlayerIcon';

export default WithDraggable(PlayerIcon);
