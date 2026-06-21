import React, { useRef, useCallback, useEffect, useState } from 'react';
import '../styles/ImageFramer.css';

const FRAME_W = 400;

interface Props {
  src: string;
  posX: number;
  posY: number;
  zoom: number;
  frameH?: number;
  onPosChange: (x: number, y: number) => void;
  onZoomChange: (zoom: number) => void;
}

export default function ImageFramer({ src, posX, posY, zoom, frameH = 400, onPosChange, onZoomChange }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const dragState = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
  const [natSize, setNatSize] = useState({ w: 0, h: 0 });

  const handleImgLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    setNatSize({ w: img.naturalWidth, h: img.naturalHeight });
  };

  // Overflow of the image beyond the frame under object-fit: cover (at zoom 1)
  const coverScale = natSize.w > 0 ? Math.max(FRAME_W / natSize.w, frameH / natSize.h) : 1;
  const excessW = Math.max(0, natSize.w * coverScale - FRAME_W);
  const excessH = Math.max(0, natSize.h * coverScale - frameH);

  const clamp = (v: number) => Math.max(0, Math.min(100, v));

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragState.current = { startX: e.clientX, startY: e.clientY, startPosX: posX, startPosY: posY };
  };

  // At zoom > 1 the image appears larger, so the same drag distance should move
  // the view proportionally less — divide excess by zoom to keep image-follows-finger feel.
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    onPosChange(
      excessW > 0 ? clamp(dragState.current.startPosX - (dx / (excessW * zoom)) * 100) : posX,
      excessH > 0 ? clamp(dragState.current.startPosY - (dy / (excessH * zoom)) * 100) : posY,
    );
  }, [excessW, excessH, posX, posY, zoom, onPosChange]);

  const handleMouseUp = useCallback(() => { dragState.current = null; }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    dragState.current = { startX: t.clientX, startY: t.clientY, startPosX: posX, startPosY: posY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragState.current) return;
    const t = e.touches[0];
    const dx = t.clientX - dragState.current.startX;
    const dy = t.clientY - dragState.current.startY;
    onPosChange(
      excessW > 0 ? clamp(dragState.current.startPosX - (dx / (excessW * zoom)) * 100) : posX,
      excessH > 0 ? clamp(dragState.current.startPosY - (dy / (excessH * zoom)) * 100) : posY,
    );
  };

  return (
    <div className="image-framer">
      <div
        className="image-frame"
        style={{ aspectRatio: `${FRAME_W} / ${frameH}` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => { dragState.current = null; }}
      >
        <img
          ref={imgRef}
          src={src}
          alt="Preview"
          draggable={false}
          onLoad={handleImgLoad}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: `${posX}% ${posY}%`,
            transform: `scale(${zoom})`,
            transformOrigin: `${posX}% ${posY}%`,
            pointerEvents: 'none',
          }}
        />
      </div>
      <div className="scale-control">
        <span>Zoom</span>
        <input
          type="range"
          min={1}
          max={4}
          step={0.01}
          value={zoom}
          onChange={(e) => onZoomChange(parseFloat(e.target.value))}
        />
      </div>
      <p className="framer-hint">Drag to reposition</p>
    </div>
  );
}
