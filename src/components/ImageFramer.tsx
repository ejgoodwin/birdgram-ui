import React, { useRef, useCallback, useEffect, useState } from 'react';
import '../styles/ImageFramer.css';

const FRAME_W = 400;

interface Props {
  src: string;
  offset: { x: number; y: number };
  scale: number;
  frameH?: number;
  onOffsetChange: (offset: { x: number; y: number }) => void;
  onScaleChange: (scale: number) => void;
  autoFit?: boolean;
}

export default function ImageFramer({ src, offset, scale, frameH = 400, onOffsetChange, onScaleChange, autoFit = true }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragState = useRef<{ startX: number; startY: number; startOffsetX: number; startOffsetY: number } | null>(null);
  const [imgNaturalSize, setImgNaturalSize] = useState({ w: 0, h: 0 });

  const handleImgLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    setImgNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });

    if (autoFit) {
      const minScale = Math.max(FRAME_W / img.naturalWidth, frameH / img.naturalHeight);
      onScaleChange(minScale);
      onOffsetChange({ x: 0, y: 0 });
    }
  };

  const clampOffset = useCallback((x: number, y: number, currentScale: number) => {
    const scaledW = imgNaturalSize.w * currentScale;
    const scaledH = imgNaturalSize.h * currentScale;
    const minX = Math.min(0, FRAME_W - scaledW);
    const minY = Math.min(0, frameH - scaledH);
    return {
      x: Math.max(minX, Math.min(0, x)),
      y: Math.max(minY, Math.min(0, y)),
    };
  }, [imgNaturalSize, frameH]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      startOffsetX: offset.x,
      startOffsetY: offset.y,
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    onOffsetChange(clampOffset(
      dragState.current.startOffsetX + dx,
      dragState.current.startOffsetY + dy,
      scale,
    ));
  }, [scale, clampOffset, onOffsetChange]);

  const handleMouseUp = useCallback(() => {
    dragState.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    dragState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startOffsetX: offset.x,
      startOffsetY: offset.y,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragState.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragState.current.startX;
    const dy = touch.clientY - dragState.current.startY;
    onOffsetChange(clampOffset(
      dragState.current.startOffsetX + dx,
      dragState.current.startOffsetY + dy,
      scale,
    ));
  };

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScale = parseFloat(e.target.value);
    const centerImgX = (FRAME_W / 2 - offset.x) / scale;
    const centerImgY = (frameH / 2 - offset.y) / scale;
    const newOffsetX = FRAME_W / 2 - centerImgX * newScale;
    const newOffsetY = frameH / 2 - centerImgY * newScale;
    onScaleChange(newScale);
    onOffsetChange(clampOffset(newOffsetX, newOffsetY, newScale));
  };

  const minScale = imgNaturalSize.w > 0
    ? Math.max(FRAME_W / imgNaturalSize.w, frameH / imgNaturalSize.h)
    : 1;

  return (
    <div className="image-framer">
      <div
        ref={frameRef}
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
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: 'top left',
            width: imgNaturalSize.w > 0 ? `${imgNaturalSize.w}px` : 'auto',
            height: imgNaturalSize.h > 0 ? `${imgNaturalSize.h}px` : 'auto',
          }}
        />
      </div>
      <div className="scale-control">
        <span>Zoom</span>
        <input
          type="range"
          min={minScale}
          max={minScale * 3}
          step={0.01}
          value={scale}
          onChange={handleScaleChange}
        />
      </div>
      <p className="framer-hint">Drag to reposition</p>
    </div>
  );
}
