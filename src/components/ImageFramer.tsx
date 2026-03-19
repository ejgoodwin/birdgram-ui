import React, { useRef, useCallback, useEffect, useState } from 'react';
import '../styles/ImageFramer.css';

const FRAME_SIZE = 400;

interface Props {
  src: string;
  offset: { x: number; y: number };
  scale: number;
  onOffsetChange: (offset: { x: number; y: number }) => void;
  onScaleChange: (scale: number) => void;
  autoFit?: boolean;
}

export default function ImageFramer({ src, offset, scale, onOffsetChange, onScaleChange, autoFit = true }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragState = useRef<{ startX: number; startY: number; startOffsetX: number; startOffsetY: number } | null>(null);
  const [imgNaturalSize, setImgNaturalSize] = useState({ w: 0, h: 0 });

  const handleImgLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    setImgNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });

    if (autoFit) {
      // Auto-fit: scale so the image covers the frame
      const minScale = Math.max(FRAME_SIZE / img.naturalWidth, FRAME_SIZE / img.naturalHeight);
      onScaleChange(minScale);
      onOffsetChange({ x: 0, y: 0 });
    }
  };

  const clampOffset = useCallback((x: number, y: number, currentScale: number) => {
    const scaledW = imgNaturalSize.w * currentScale;
    const scaledH = imgNaturalSize.h * currentScale;
    const maxX = 0;
    const minX = Math.min(0, FRAME_SIZE - scaledW);
    const maxY = 0;
    const minY = Math.min(0, FRAME_SIZE - scaledH);
    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y)),
    };
  }, [imgNaturalSize]);

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
    const raw = {
      x: dragState.current.startOffsetX + dx,
      y: dragState.current.startOffsetY + dy,
    };
    onOffsetChange(clampOffset(raw.x, raw.y, scale));
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

  // Touch support
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
    onScaleChange(newScale);
    onOffsetChange(clampOffset(offset.x, offset.y, newScale));
  };

  const minScale = imgNaturalSize.w > 0
    ? Math.max(FRAME_SIZE / imgNaturalSize.w, FRAME_SIZE / imgNaturalSize.h)
    : 1;

  return (
    <div className="image-framer">
      <div
        ref={frameRef}
        className="image-frame"
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
