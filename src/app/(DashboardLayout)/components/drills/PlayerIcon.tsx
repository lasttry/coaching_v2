/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import withDraggable from './withDraggable';
import { useSvgDefs } from '@/app/(DashboardLayout)/components/drills/SvgDefsProvider';

interface PlayerIconProps {
  value?: number;
  x?: number;
  y?: number;
  id?: string;
  type: string;
  draggable?: boolean;
  rotatable?: boolean;
  rotation?: number;
  onMove?: (
    x: number,
    y: number,
    rotation: number,
    additionalProps: { id: string },
  ) => void;
}

const PlayerIcon: React.FC<PlayerIconProps> = React.memo(
  ({ value = 1, id = '', type }) => {
    const { addDef, hasDef } = useSvgDefs();
    const [updateSvgDefs, setUpdateSvgDefs] = useState<boolean>(false);

    useEffect(() => {
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
        <use href={'#' + type} className={id}></use>
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
          {value}
        </text>
      </>
    );
  },
);

PlayerIcon.displayName = 'PlayerIcon';

export default withDraggable(PlayerIcon);
