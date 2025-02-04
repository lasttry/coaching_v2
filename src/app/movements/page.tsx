'use client';

import './assets/movements.css';
import * as Icons from './assets/icons';
import CourtFIBA from './assets/CourtFIBA';

import React, { useState, useEffect } from 'react';
import { DrawingInterface, DrawingToolType, SvgIconsInterface } from './assets/types';
import { SvgDefs, SvgDefsProvider } from '@/app/(DashboardLayout)/components/drills/SvgDefsProvider';
import { v4 as uuidv4 } from 'uuid';
import PlayerIcon from './assets/PlayerIcon';
import { useSession } from 'next-auth/react';
import { ClubInterface } from '@/types/club/types';

const DrillDesignNew: React.FC = () => {
  const { data: session } = useSession();

  const [currentColor, setCurrentColor] = useState('#003366');
  const [currentAreaColor, setCurrentAreaColor] = useState('#FFC300');
  const [currentIsFullCourt, setCurrentIsFullCourt] = useState(true);
  const [currentDefenseValue, setCurrentDefenseValue] = useState(1);
  const [currentOffenseValue, setCurrentOffenseValue] = useState(1);

  const [currentDrawing, setCurrentDrawing] = useState<DrawingInterface>({
    tool: DrawingToolType.None,
  });
  const [drawingIcons, setDrawingIcons] = useState<SvgIconsInterface[]>([]);
  const [currentClub, setCurrentClub] = useState<ClubInterface | null>(null);

  useEffect(() => {
    async function fetchClubs(): Promise<void> {
      if (!session?.user.selectedClubId) return;
      const response = await fetch(`/api/clubs/${session?.user.selectedClubId}`);
      if (response.ok) {
        const data: ClubInterface = await response.json();
        setCurrentClub(data);
      }
    }
    fetchClubs();
  }, [session?.user.selectedClubId]);

  const resetIconSelect = (id?: string): void => {
    setDrawingIcons((prevIcons) =>
      prevIcons.map((icon) =>
        icon.selected !== (icon.id === id) // Only update if the selected state changes
          ? { ...icon, selected: icon.id === id }
          : icon
      )
    );
  };

  const handleFollowMouseCircleClick = (x: number, y: number): void => {
    if (currentDrawing.tool === DrawingToolType.None) {
      return;
    }

    let textValue = 0;
    if (currentDrawing.tool === DrawingToolType.Offense) {
      textValue = currentOffenseValue;
      setCurrentOffenseValue((prevValue) => (prevValue % 9) + 1);
    } else if (currentDrawing.tool === DrawingToolType.Defense) {
      textValue = currentDefenseValue;
      setCurrentDefenseValue((prevValue) => (prevValue % 9) + 1);
    }
    setDrawingIcons((prev) => [
      ...prev,
      {
        id: uuidv4(),
        type: currentDrawing.tool,
        x,
        y,
        textValue,
        color: currentColor,
        selected: false,
      },
    ]);
  };

  const handlePlayerIconSelect = (id: string): void => {
    setCurrentDrawing({ tool: DrawingToolType.None });
    resetIconSelect(id);
  };

  const handleToolChange = (tool: DrawingToolType): void => {
    setCurrentDrawing({ tool: tool });
  };

  const handleIconOnMove = (id: string, x?: number, y?: number, rotation?: number): void => {
    setDrawingIcons((prevIcons): SvgIconsInterface[] => {
      const index = prevIcons.findIndex((icon) => icon.id === id);
      if (index === -1) return prevIcons; // Return unchanged if id not found
      const updatedIcons = [...prevIcons];
      updatedIcons[index] = { ...updatedIcons[index], x, y, rotation };
      return updatedIcons;
    });
  };

  const handleArrowIconClick = (): void => {
    handleToolChange(DrawingToolType.None);
    resetIconSelect();
  };

  return (
    <>
      <div id="drawingHost">
        <SvgDefsProvider>
          <svg version="1.1" width="100%" height="100%" viewBox="0 0 384 270">
            <SvgDefs />
            <CourtFIBA
              scale={2}
              isFullCourt={currentIsFullCourt}
              backgroundColor={currentClub?.backgroundColor}
              strokeColor={currentClub?.foregroundColor}
              centerLogo={currentClub?.image}
            />

            <Icons.FollowMouseCircle
              onClick={handleFollowMouseCircleClick}
              visible={
                currentDrawing.tool === DrawingToolType.Offense ||
                currentDrawing.tool === DrawingToolType.Defense ||
                currentDrawing.tool === DrawingToolType.Ball ||
                currentDrawing.tool === DrawingToolType.Cone
              }
            />

            {drawingIcons.map((icon) => {
              if (
                icon.type === DrawingToolType.Offense ||
                icon.type === DrawingToolType.Defense ||
                icon.type === DrawingToolType.Ball ||
                icon.type === DrawingToolType.Cone
              ) {
                return (
                  <PlayerIcon
                    key={icon.id}
                    id={icon.id}
                    type={icon.type}
                    color={icon.color || currentColor}
                    textValue={icon.textValue}
                    x={icon.x}
                    y={icon.y}
                    selected={icon.selected}
                    selectable={true}
                    draggable={true}
                    rotatable={icon.type === DrawingToolType.Defense}
                    onSelect={handlePlayerIconSelect}
                    onMove={handleIconOnMove}
                  />
                );
              }
              return null; // Handle other types if necessary
            })}
          </svg>
        </SvgDefsProvider>
      </div>
      <div id="toolbar">
        <div id="btnSelect" className="toolBtn" title="Pointer" data-mode="Select" style={{ height: '42px' }}>
          <Icons.ArrowIcon onClick={handleArrowIconClick} />
        </div>
        <div
          id="btnDelete"
          className="toolBtn"
          style={{
            lineHeight: '30px',
            fontSize: '12pt',
            fontWeight: 'bold',
            height: '42px',
          }}
          title="Delete (DEL / X)"
        >
          x
        </div>
        <div id="btnOfense" className="toolBtn" style={{ height: '42px' }}>
          <Icons.OffenseToolbarIcon
            textValue={currentOffenseValue}
            onChange={setCurrentOffenseValue}
            onClick={() => handleToolChange(DrawingToolType.Offense)}
            color={currentColor}
          />
        </div>
        <div id="btnDefense" className="toolBtn" style={{ height: '42px' }}>
          <Icons.DefenseToolbarIcon
            textValue={currentDefenseValue}
            onChange={setCurrentDefenseValue}
            onClick={() => handleToolChange(DrawingToolType.Defense)}
            color={currentColor}
          />
        </div>
        <div id="btnBall" className="toolBtn" style={{ height: '42px' }}>
          <Icons.BallIcon onClick={() => handleToolChange(DrawingToolType.Ball)} />
        </div>
        <div id="btnCone" className="toolBtn" style={{ height: '42px' }}>
          <Icons.ConeIcon onClick={() => handleToolChange(DrawingToolType.Cone)} />
        </div>
        <div id="btnCoach" className="toolBtn" style={{ height: '42px' }}>
          <Icons.CoachIcon />
        </div>
        <div id="btnText" className="toolBtn" style={{ height: '42px' }}>
          <Icons.TextIcon />
        </div>
        <div className="toolSep">
          <hr />
        </div>
        <div id="btnArea" className="toolBtn" style={{ height: '42px' }}>
          <Icons.AreaIcon currentColor={currentAreaColor} onColorChange={setCurrentAreaColor} />
        </div>
        <div id="btnChangeColor" className="toolBtn" style={{ height: '42px' }}>
          <Icons.ChangeColorIcon currentColor={currentColor} onColorChange={setCurrentColor} />
        </div>
        <div className="toolSep">
          <hr />
        </div>
        <div id="btnLineMovement" className="toolBtn" style={{ height: '42px' }}>
          <Icons.LineMovementIcon />
        </div>
        <div id="btnLinePassing" className="toolBtn" style={{ height: '42px' }}>
          <Icons.LinePassingIcon />
        </div>
        <div id="btnLineDribbling" className="toolBtn" style={{ height: '42px' }}>
          <Icons.LineDribblingIcon />
        </div>
        <div id="btnLineScreen" className="toolBtn" style={{ height: '42px' }}>
          <Icons.LineScreenIcon />
        </div>
        <div id="btnShooting" className="toolBtn" style={{ height: '42px' }}>
          <Icons.ShootingIcon />
        </div>
        <div id="btnLine" className="toolBtn" style={{ height: '42px' }}>
          <Icons.LineIcon />
        </div>
        <div id="btnHandOff" className="toolBtn" style={{ height: '42px' }}>
          <Icons.HandoffIcon />
        </div>
        <div className="toolSep">
          <hr />
        </div>
        <div id="btnToggleHalfCourt" className="toolBtn" style={{ height: '42px' }}>
          <Icons.ToggleHalfCourtIcon onChange={setCurrentIsFullCourt} isFullCourt={currentIsFullCourt} />
        </div>
      </div>
    </>
  );
};
export default DrillDesignNew;
