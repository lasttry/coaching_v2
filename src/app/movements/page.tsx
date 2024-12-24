'use client';

import './assets/movements.css';
import * as Icons from './assets/icons';

import React, { useState, useMemo, useRef } from 'react';

const DrillDesignNew: React.FC = () => {
  const [currentColor, setCurrentColor] = useState("#003366");
  const [currentAreaColor, setCurrentAreaColor] = useState("#FFC300");
  const [currentIsFullCourt, setCurrentIsFullCourt] = useState(true);
  const [currentDefenseValue, setCurrentDefenseValue] = useState(1);
  const [currentOfenseValue, setcurrentOfenseValue] = useState(1);
  
  return (
    <>
      <div id="drawingHost">
        <svg
          version='1.1'
          width="100%"
          height="100%"
          viewBox='0 0 384 270'
          >

        </svg>
      </div>
      <div id="toolbar">
        <div id="btnSelect" className="toolBtn" title="Pointer" data-mode="Select" style={{ height: '42px' }}>
          <Icons.ArrowIcon />
        </div>
        <div id="btnDelete" className="toolBtn" style={{ lineHeight: '30px', fontSize: '12pt', fontWeight: 'bold', height: '42px' }} title="Delete (DEL / X)">x</div>
        <div id='btnOfense' className='toolBtn' style={{ height: '42px' }} >
          <Icons.OffenseToolbarIcon textValue={currentOfenseValue} onChange={setcurrentOfenseValue} color={currentColor} />
        </div>
        <div id='btnDefense' className='toolBtn' style={{ height: '42px' }} >
          <Icons.DefenseIcon textValue={currentDefenseValue} onChange={setCurrentDefenseValue} color={currentColor} />
        </div>
        <div id='btnBall' className='toolBtn' style={{ height: '42px' }} >
          <Icons.BallIcon />
        </div>
        <div id='btnCone' className='toolBtn' style={{ height: '42px' }} >
          <Icons.ConeIcon />
        </div>
        <div id='btnCoach' className='toolBtn' style={{ height: '42px' }} >
          <Icons.CoachIcon />
        </div>
        <div id='btnText' className='toolBtn' style={{ height: '42px' }} >
          <Icons.TextIcon />
        </div>
        <div className="toolSep"><hr /></div>
        <div id='btnArea' className='toolBtn' style={{ height: '42px' }} >
          <Icons.AreaIcon currentColor={currentAreaColor} onColorChange={setCurrentAreaColor} />
        </div>
        <div id='btnChangeColor' className='toolBtn' style={{ height: '42px' }} >
          <Icons.ChangeColorIcon currentColor={currentColor} onColorChange={setCurrentColor} />
        </div>
        <div className="toolSep"><hr /></div>
        <div id='btnLineMovement' className='toolBtn' style={{ height: '42px' }} >
          <Icons.LineMovementIcon />
        </div>
        <div id='btnLinePassing' className='toolBtn' style={{ height: '42px' }} >
          <Icons.LinePassingIcon />
        </div>
        <div id='btnLineDribbling' className='toolBtn' style={{ height: '42px' }} >
          <Icons.LineDribblingIcon />
        </div>
        <div id='btnLineScreen' className='toolBtn' style={{ height: '42px' }} >
          <Icons.LineScreenIcon />
        </div>
        <div id='btnShooting' className='toolBtn' style={{ height: '42px' }} >
          <Icons.ShootingIcon />
        </div>
        <div id='btnLine' className='toolBtn' style={{ height: '42px' }} >
          <Icons.LineIcon />
        </div>
        <div id='btnHandOff' className='toolBtn' style={{ height: '42px' }} >
          <Icons.HandoffIcon />
        </div>
        <div className="toolSep"><hr /></div>
        <div id='btnToggleHalfCourt' className='toolBtn' style={{ height: '42px' }} >
          <Icons.ToggleHalfCourtIcon onChange={setCurrentIsFullCourt} isFullCourt={currentIsFullCourt} />
        </div>
      </div>
    </>
  );
};
export default DrillDesignNew;
